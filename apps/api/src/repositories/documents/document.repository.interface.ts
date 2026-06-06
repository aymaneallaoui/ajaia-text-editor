import type {
  Document,
  DocumentListItem,
  DocumentVersionSummary,
  SharedDocumentItem,
} from '../../models/document'
import type { Repository } from '../repository.interface'

export interface CreateDocumentData {
  ownerId: string
  title?: string
  content?: unknown
  contentText?: string
}

export interface UpdateDocumentData {
  title?: string
  content?: unknown
  contentText?: string
}

export interface CreateVersionData {
  documentId: string
  title: string
  content: unknown
  editedBy: string | null
}

/**
 * Document is the aggregate root: this repository also owns its version
 * snapshots (document_versions). It implements the base CRUD contract plus the
 * access-aware queries the document/access services rely on. All reads exclude
 * soft-deleted rows.
 */
export interface IDocumentRepository extends Repository<
  Document,
  CreateDocumentData,
  UpdateDocumentData
> {
  findActiveById(id: string): Promise<Document | null>
  listOwnedByUser(userId: string): Promise<DocumentListItem[]>
  listSharedWithUser(userId: string): Promise<SharedDocumentItem[]>
  softDelete(id: string): Promise<boolean>
  insertVersion(data: CreateVersionData): Promise<void>
  listVersions(documentId: string): Promise<DocumentVersionSummary[]>
}
