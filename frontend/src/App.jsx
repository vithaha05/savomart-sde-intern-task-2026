import './App.css'

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">S</div>
        <nav aria-label="Primary navigation">
          <a href="#overview" className="active">Overview</a>
          <a href="#members">Members</a>
          <a href="#rewards">Rewards</a>
          <a href="#assistant">AI Assistant</a>
        </nav>
      </aside>

      <section className="workspace" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">Savomart</p>
            <h1>Loyalty Companion</h1>
          </div>
          <span className="api-status">API: /api/health</span>
        </header>

        <section className="metrics" aria-label="Loyalty metrics">
          <article>
            <span>Members</span>
            <strong>12,480</strong>
            <small>Ready for customer sync</small>
          </article>
          <article>
            <span>Reward Claims</span>
            <strong>2,931</strong>
            <small>Pending router integration</small>
          </article>
          <article>
            <span>OTP Mode</span>
            <strong>Dev</strong>
            <small>Controlled by backend env</small>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-header">
              <h2>Backend Modules</h2>
              <span>FastAPI</span>
            </div>
            <ul className="module-list">
              <li>routers</li>
              <li>services</li>
              <li>schemas</li>
              <li>models</li>
            </ul>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Deployment Targets</h2>
              <span>Cloud</span>
            </div>
            <div className="deployment-row">
              <span>Render</span>
              <strong>API + PostgreSQL</strong>
            </div>
            <div className="deployment-row">
              <span>Vercel</span>
              <strong>React frontend</strong>
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

export default App
