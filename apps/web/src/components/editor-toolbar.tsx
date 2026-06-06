import { Button } from '@repo/ui/components/button'
import { Separator } from '@repo/ui/components/separator'
import { cn } from '@repo/ui/lib/utils'
import { type Editor, useEditorState } from '@tiptap/react'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Underline,
} from 'lucide-react'
import type { ReactNode } from 'react'

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn('size-8', active && 'bg-secondary text-foreground')}
    >
      {children}
    </Button>
  )
}

function Divider() {
  return <Separator orientation="vertical" className="mx-1 !h-5" />
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      paragraph: editor.isActive('paragraph'),
      bullet: editor.isActive('bulletList'),
      ordered: editor.isActive('orderedList'),
    }),
  })

  const run = () => editor.chain().focus()

  return (
    <div className="flex flex-wrap items-center gap-0.5 py-1.5">
      <ToolbarButton label="Bold" active={state?.bold} onClick={() => run().toggleBold().run()}>
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state?.italic}
        onClick={() => run().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={state?.underline}
        onClick={() => run().toggleUnderline().run()}
      >
        <Underline className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Heading 1"
        active={state?.h1}
        onClick={() => run().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={state?.h2}
        onClick={() => run().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={state?.h3}
        onClick={() => run().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Paragraph"
        active={state?.paragraph}
        onClick={() => run().setParagraph().run()}
      >
        <Pilcrow className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={state?.bullet}
        onClick={() => run().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state?.ordered}
        onClick={() => run().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
    </div>
  )
}
