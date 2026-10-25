import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, formatDate, listAllPosts, restorePost, trashPost, updatePost } from '../lib/posts'

const titleOf = (post) => post.bn?.title || post.en?.title || '(no title)'

export default function AdminDashboard() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [view, setView] = useState('posts')
  const [busyId, setBusyId] = useState(null)

  const load = () =>
    listAllPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [])

  // Runs a write for one post, then reloads the list.
  async function act(post, fn) {
    setBusyId(post.id)
    setError('')
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const togglePublish = (post) => act(post, () => updatePost(post.id, { published: !post.published }))
  const moveToTrash = (post) => act(post, () => trashPost(post))
  const restore = (post) => act(post, () => restorePost(post))

  function deleteForever(post) {
    if (!window.confirm(`"${titleOf(post)}" chirodiner jonno delete korben? Eta ar ferot ana jabe na.`)) return
    act(post, () => deletePost(post.id))
  }

  async function emptyTrash() {
    if (!window.confirm(`Trash er ${trashed.length} ta post chirodiner jonno delete korben? Eta ar ferot ana jabe na.`)) return
    setError('')
    try {
      await Promise.all(trashed.map((p) => deletePost(p.id)))
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const active = posts?.filter((p) => !p.deleted) ?? []
  const trashed = (posts?.filter((p) => p.deleted) ?? []).sort(
    (a, b) => (b.deletedAt?.toMillis?.() ?? 0) - (a.deletedAt?.toMillis?.() ?? 0),
  )
  const list = view === 'trash' ? trashed : active

  return (
    <main className="container page-pad">
      <div className="admin-head">
        <h1>Dashboard</h1>
        <Link to="/admin/new" className="btn btn-primary">
          + Notun blog
        </Link>
      </div>

      <div className="admin-tabs">
        <button className={view === 'posts' ? 'pill active' : 'pill'} onClick={() => setView('posts')}>
          Posts ({active.length})
        </button>
        <button className={view === 'trash' ? 'pill active' : 'pill'} onClick={() => setView('trash')}>
          🗑 Trash ({trashed.length})
        </button>
        {view === 'trash' && trashed.length > 0 && (
          <button className="btn btn-danger btn-sm trash-empty" onClick={emptyTrash}>
            Empty trash
          </button>
        )}
      </div>

      {view === 'trash' && (
        <p className="muted small trash-note">
          Delete kora post ekhane thake. Readers ra dekhte pay na. Restore korle ager moto (Published ba Draft) ferot ashbe.
        </p>
      )}

      {error && <p className="error">{error}</p>}
      {!posts && !error && <p className="muted">Loading…</p>}
      {posts && list.length === 0 && (
        <p className="muted">{view === 'trash' ? 'Trash faka.' : 'Ekhono kono blog nei. "Notun blog" e click korun.'}</p>
      )}

      <ul className="admin-list">
        {list.map((post) => (
          <li key={post.id} className={view === 'trash' ? 'panel admin-row is-trashed' : 'panel admin-row'}>
            {post.coverUrl ? <img src={post.coverUrl} alt="" /> : <div className="thumb-empty" />}
            <div className="admin-row-main">
              <strong>{post.bn?.title || '— (Bangla nei)'}</strong>
              <span className="muted">{post.en?.title || '— (English nei)'}</span>
              <span className="muted small">
                {view === 'trash'
                  ? `Deleted: ${formatDate(post.deletedAt, 'en')}`
                  : formatDate(post.createdAt, 'en')}
              </span>
            </div>
            {view === 'trash' ? (
              <span className="badge">{post.wasPublished ? 'Was published' : 'Was draft'}</span>
            ) : (
              <span className={post.published ? 'badge badge-live' : 'badge'}>{post.published ? 'Published' : 'Draft'}</span>
            )}
            <div className="admin-actions">
              {view === 'trash' ? (
                <>
                  <button className="btn btn-primary" disabled={busyId === post.id} onClick={() => restore(post)}>
                    ↩ Restore
                  </button>
                  <button className="btn btn-danger" disabled={busyId === post.id} onClick={() => deleteForever(post)}>
                    Delete forever
                  </button>
                </>
              ) : (
                <>
                  <Link to={`/admin/edit/${post.id}`} className="btn btn-ghost">
                    Edit
                  </Link>
                  <button className="btn btn-ghost" disabled={busyId === post.id} onClick={() => togglePublish(post)}>
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="btn btn-danger" disabled={busyId === post.id} onClick={() => moveToTrash(post)}>
                    🗑 Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
