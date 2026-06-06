import type {
  CreateDocumentInput,
  Document,
  DocumentVersionSummary,
  UpdateDocumentInput,
} from '../../models/document'
import { NotFoundError } from '../../models/errors'
import type {
  CreateDocumentData,
  IDocumentRepository,
  UpdateDocumentData,
} from '../../repositories/documents/document.repository.interface'
import { prosemirrorToText } from '../../utils/prosemirror-text'
import type { IDocumentService } from './document.service.interface'

export class DocumentService implements IDocumentService {
  constructor(private readonly documents: IDocumentRepository) {}

  create(ownerId: string, input: CreateDocumentInput): Promise<Document> {
    const data: CreateDocumentData = { ownerId }
    if (input.title !== undefined) data.title = input.title
    if (input.content !== undefined) {
      data.content = input.content
      data.contentText = prosemirrorToText(input.content)
    }
    return this.documents.create(data)
  }

  async get(id: string): Promise<Document> {
    const document = await this.documents.findActiveById(id)
    if (!document) throw new NotFoundError('Document', id)
    return document
  }

  async update(id: string, editedBy: string, input: UpdateDocumentInput): Promise<Document> {
    const current = await this.documents.findActiveById(id)
    if (!current) throw new NotFoundError('Document', id)

    const contentChanged = input.content !== undefined
    const data: UpdateDocumentData = {}
    if (input.title !== undefined) data.title = input.title
    if (contentChanged) {
      data.content = input.content
      data.contentText = prosemirrorToText(input.content)
    }

    const updated = await this.documents.update(id, data)
    if (!updated) throw new NotFoundError('Document', id)

    // Snapshot a version only when content changed (title-only edits don't).
    if (contentChanged) {
      await this.documents.insertVersion({
        documentId: updated.id,
        title: updated.title,
        content: updated.content,
        editedBy,
      })
    }

    return updated
  }

  async softDelete(id: string): Promise<void> {
    const removed = await this.documents.softDelete(id)
    if (!removed) throw new NotFoundError('Document', id)
  }

  listVersions(id: string): Promise<DocumentVersionSummary[]> {
    return this.documents.listVersions(id)
  }
}
