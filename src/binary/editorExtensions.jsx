import { Extension, Node, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import Sketch from './component/Sketch/Sketch'

// TipTap pieces for editing Binary lessons.

// A lesson sketch, stored as <div data-sketch="name"></div> and drawn in the editor as the real
// diagram. It can be dragged, moved up/down or removed like a photo.
function SketchView({ node }) {
  return (
    <NodeViewWrapper className="sketch-node" data-drag-handle>
      <Sketch name={node.attrs.name} />
    </NodeViewWrapper>
  )
}

export const SketchBlock = Node.create({
  name: 'sketch',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-sketch'),
        renderHTML: (attrs) => ({ 'data-sketch': attrs.name }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-sketch]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes]
  },
  addNodeView() {
    return ReactNodeViewRenderer(SketchView)
  },
})

// Keeps the lesson styles on paragraphs and headings (rule notes, coloured boxes, tip notes).
export const KeepClasses = Extension.create({
  name: 'keepClasses',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          class: {
            default: null,
            parseHTML: (el) => el.getAttribute('class'),
            renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
          },
        },
      },
    ]
  },
})

export const LESSON_EXTENSIONS = [SketchBlock, KeepClasses]
export const LESSON_HEADINGS = [2, 3, 4, 5, 6]
