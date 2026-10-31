import { Component } from 'react'

// Any render crash (or a stale lazy chunk after a deploy) sends the visitor home
// with a full reload instead of leaving a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    // Already on home: reloading would loop, so just show the fallback.
    if (window.location.pathname !== '/') window.location.replace('/')
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="container narrow page-pad">
        <p className="notice">
          Something went wrong. <a href="/">Go home</a>
        </p>
      </main>
    )
  }
}
