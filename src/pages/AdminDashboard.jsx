import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePost, formatDate, listAllPosts, updatePost } from '../lib/posts'

export default function AdminDashboard() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    listAllPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))

  useEffect(() => {
    load()
  }, [])

  async function togglePublish(post) {
    await updatePost(post.id, { published: !post.published })
    load()
  }

  async function remove(post) {
    const title = post.bn?.title || post.en?.title
    if (!window.confirm(`"${title}" delete korben?`)) return
    await deletePost(post.id)
    load()
  }

  return (
    <main className="container page-pad">
      <div className="admin-head">
        <h1>Dashboard</h1>
        <Link to="/admin/new" className="btn btn-primary">
          + Notun blog
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!posts && !error && <p className="muted">Loading…</p>}
      {posts?.length === 0 && <p className="muted">Ekhono kono blog nei. "Notun blog" e click korun.</p>}

      <ul className="admin-list">
        {posts?.map((post) => (
          <li key={post.id} className="panel admin-row">
            {post.coverUrl ? <img src={post.coverUrl} alt="" /> : <div className="thumb-empty" />}
            <div className="admin-row-main">
              <strong>{post.bn?.title || '— (Bangla nei)'}</strong>
              <span className="muted">{post.en?.title || '— (English nei)'}</span>
              <span className="muted small">{formatDate(post.createdAt, 'en')}</span>
            </div>
            <span className={post.published ? 'badge badge-live' : 'badge'}>
              {post.published ? 'Published' : 'Draft'}
            </span>
            <div className="admin-actions">
              <Link to={`/admin/edit/${post.id}`} className="btn btn-ghost">
                Edit
              </Link>
              <button className="btn btn-ghost" onClick={() => togglePublish(post)}>
                {post.published ? 'Unpublish' : 'Publish'}
              </button>
              <button className="btn btn-danger" onClick={() => remove(post)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
