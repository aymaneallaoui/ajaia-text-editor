import { randomUUID } from 'node:crypto'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from './env'

/**
 * Object storage for document attachments, backed by Cloudflare R2.
 *
 * R2 is S3-compatible, so we talk to it with the AWS S3 v3 client pointed at the
 * account's R2 endpoint with `region: 'auto'`. Credentials come from env and are
 * validated lazily — importing this module never requires R2 to be configured,
 * so DB-only tasks (migrate/seed) work without storage credentials.
 */

let client: S3Client | null = null

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`R2 storage is not configured: set ${name} (see .env.example).`)
  }
  return value
}

function r2(): S3Client {
  if (client) return client
  const accountId = requireEnv(env.R2_ACCOUNT_ID, 'R2_ACCOUNT_ID')
  client = new S3Client({
    region: 'auto', // required by the SDK, ignored by R2
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv(env.R2_ACCESS_KEY_ID, 'R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv(env.R2_SECRET_ACCESS_KEY, 'R2_SECRET_ACCESS_KEY'),
    },
  })
  return client
}

function bucket(): string {
  return requireEnv(env.R2_BUCKET, 'R2_BUCKET')
}

const DEFAULT_EXPIRES_IN = 900 // 15 minutes

/**
 * Build a collision-proof object key for an attachment, namespaced under its
 * document: `documents/{documentId}/{uuid}-{sanitized-filename}`. Store the
 * returned value in `attachments.storage_key`.
 */
export function buildStorageKey(documentId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^[._]+/, '') || 'file'
  return `documents/${documentId}/${randomUUID()}-${safe}`
}

export interface UploadResult {
  key: string
  /** R2 ETag with surrounding quotes stripped — usable as `attachments.checksum`. */
  etag: string | null
}

/** Upload bytes to R2 from the server. Returns the stored key + ETag. */
export async function uploadObject(params: {
  key: string
  body: Uint8Array | Buffer | string
  contentType: string
  contentLength?: number
}): Promise<UploadResult> {
  const res = await r2().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      ...(params.contentLength !== undefined ? { ContentLength: params.contentLength } : {}),
    }),
  )
  return { key: params.key, etag: res.ETag?.replaceAll('"', '') ?? null }
}

/**
 * Presigned PUT URL so a browser can upload a file straight to R2 without the
 * bytes passing through the API. Create the `storage_key` first via
 * `buildStorageKey`, hand the URL to the client, then persist the attachment row.
 */
export function getUploadUrl(params: {
  key: string
  contentType: string
  expiresIn?: number
}): Promise<string> {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: params.key,
      ContentType: params.contentType,
    }),
    { expiresIn: params.expiresIn ?? DEFAULT_EXPIRES_IN },
  )
}

/** Presigned GET URL for time-limited downloads of a private object. */
export function getDownloadUrl(params: { key: string; expiresIn?: number }): Promise<string> {
  return getSignedUrl(r2(), new GetObjectCommand({ Bucket: bucket(), Key: params.key }), {
    expiresIn: params.expiresIn ?? DEFAULT_EXPIRES_IN,
  })
}

/** Permanently delete an object (e.g. when an attachment row is removed). */
export async function deleteObject(key: string): Promise<void> {
  await r2().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
}

/**
 * Public URL for an object, when the bucket is exposed via a public R2.dev or
 * custom domain (`R2_PUBLIC_BASE_URL`). Returns null when no public base is set;
 * use `getDownloadUrl` for private buckets.
 */
export function getPublicUrl(key: string): string | null {
  if (!env.R2_PUBLIC_BASE_URL) return null
  return `${env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '')}/${key}`
}
