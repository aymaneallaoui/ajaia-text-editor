import type {
  CreateDocumentInput,
  Document,
  DocumentVersionSummary,
  UpdateDocumentInput,
} from '../../models/document'

export interface IDocumentService {
  create(ownerId: string, input: CreateDocumentInput): Promise<Document>
  get(id: string): Promise<Document>
  /** Apply a patch; on a content change, snapshot a new version (edited_by). */
  update(id: string, editedBy: string, input: UpdateDocumentInput): Promise<Document>
  softDelete(id: string): Promise<void>
  listVersions(id: string): Promise<DocumentVersionSummary[]>
}
