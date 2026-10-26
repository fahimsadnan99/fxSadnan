import { useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { NodeSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { uploadImage } from '../lib/upload'

// Every photo in a post is shown at the same full-width 16:9 size, so per-image
// width/height are dropped. Photos can still be dragged or moved up/down.
const BlogImage = Image.extend({
  addAttributes() {
    // eslint-disable-next-line no-unused-vars
    const { width, height, ...rest } = this.parent?.() ?? {}
    return rest
  },
})

// Swaps the selected image with the block above (dir = -1) or below (dir = 1).
function moveSelectedNode(editor, dir) {
  const { state, view } = editor
  const sel = state.selection
  if (!(sel instanceof NodeSelection)) return

  const $pos = state.doc.resolve(sel.from)
  const siblingIndex = $pos.index() + dir
  if (siblingIndex < 0 || siblingIndex >= $pos.parent.childCount) return

  const sibling = $pos.parent.child(siblingIndex)
  const insertAt = dir < 0 ? sel.from - sibling.nodeSize : sel.from + sibling.nodeSize
  const tr = state.tr.delete(sel.from, sel.to).insert(insertAt, sel.node)
  tr.setSelection(NodeSelection.create(tr.doc, insertAt))
  view.dispatch(tr.scrollIntoView())
}

function Btn({ on, active, title, children, disabled }) {
  return (
    <button type="button" className={active ? 'active' : ''} onClick={on} title={title} disabled={disabled}>
      {children}
    </button>
  )
}

export default function Editor({ content, onChange, placeholder }) {
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Uploads all images in parallel, then inserts them together at `pos` (or the cursor).
  async function insertFiles(fileList, pos) {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setError('')
    setUploading((n) => n + files.length)

    const results = await Promise.allSettled(files.map((f) => uploadImage(f)))
    setUploading((n) => n - files.length)

    const nodes = results
      .map((r, i) => (r.status === 'fulfilled' ? { type: 'image', attrs: { src: r.value, alt: files[i].name } } : null))
      .filter(Boolean)
    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) setError(failed.map((r) => r.reason.message).join(', '))

    const editor = editorRef.current
    if (!nodes.length || !editor || editor.isDestroyed) return
    if (pos == null) editor.chain().focus().insertContent(nodes).run()
    else editor.chain().focus().insertContentAt(Math.min(pos, editor.state.doc.content.size), nodes).run()
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      BlogImage,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
    editorProps: {
      handleDrop: (view, event, _slice, moved) => {
        // `moved` is true when an image already in the post is being dragged; let TipTap handle that.
        if (moved || !event.dataTransfer?.files?.length) return false
        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        insertFiles(event.dataTransfer.files, coords?.pos)
        return true
      },
      handlePaste: (_view, event) => {
        if (!event.clipboardData?.files?.length) return false
        insertFiles(event.clipboardData.files)
        return true
      },
    },
  })
  editorRef.current = editor

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      link: e.isActive('link'),
      image: e.isActive('image'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  if (!editor) return null
  const run = (fn) => () => fn(editor.chain().focus()).run()

  function setLink() {
    const prev = editor.getAttributes('link').href || ''
    const href = window.prompt('Link URL', prev)
    if (href === null) return
    if (href === '') run((c) => c.extendMarkRange('link').unsetLink())()
    else run((c) => c.extendMarkRange('link').setLink({ href }))()
  }

  return (
    <div className="editor">
      <div className="toolbar-wrap">
        <div className="toolbar">
          <Btn on={run((c) => c.toggleBold())} active={s.bold} title="Bold">
            <b>B</b>
          </Btn>
          <Btn on={run((c) => c.toggleItalic())} active={s.italic} title="Italic">
            <i>I</i>
          </Btn>
          <Btn on={run((c) => c.toggleUnderline())} active={s.underline} title="Underline">
            <u>U</u>
          </Btn>
          <span className="sep" />
          <Btn on={run((c) => c.toggleHeading({ level: 2 }))} active={s.h2} title="Heading">
            H2
          </Btn>
          <Btn on={run((c) => c.toggleHeading({ level: 3 }))} active={s.h3} title="Sub-heading">
            H3
          </Btn>
          <Btn on={run((c) => c.toggleBulletList())} active={s.bullet} title="Bullet list">
            • List
          </Btn>
          <Btn on={run((c) => c.toggleOrderedList())} active={s.ordered} title="Numbered list">
            1. List
          </Btn>
          <Btn on={run((c) => c.toggleBlockquote())} active={s.quote} title="Quote">
            ❝
          </Btn>
          <Btn on={setLink} active={s.link} title="Link">
            🔗
          </Btn>
          <span className="sep" />
          <Btn on={() => fileInput.current.click()} title="Upload photos (multiple allowed)">
            🖼 Photo
          </Btn>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              insertFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <span className="sep" />
          <Btn on={run((c) => c.undo())} disabled={!s.canUndo} title="Undo">
            ↶
          </Btn>
          <Btn on={run((c) => c.redo())} disabled={!s.canRedo} title="Redo">
            ↷
          </Btn>
        </div>

        {s.image && (
          <div className="toolbar image-tools">
            <span className="muted">Photo:</span>
            <Btn on={() => moveSelectedNode(editor, -1)} title="Move up">
              ↑ Up
            </Btn>
            <Btn on={() => moveSelectedNode(editor, 1)} title="Move down">
              ↓ Down
            </Btn>
            <span className="sep" />
            <Btn on={run((c) => c.deleteSelection())} title="Remove photo">
              🗑 Remove
            </Btn>
            <span className="muted hint">Drag the photo to move it</span>
          </div>
        )}
      </div>

      {(uploading > 0 || error) && (
        <div className={error ? 'editor-status error' : 'editor-status'}>
          {uploading > 0 ? `Uploading ${uploading} photo(s)…` : error}
        </div>
      )}

      <EditorContent editor={editor} className="prose editor-content" />
    </div>
  )
}
