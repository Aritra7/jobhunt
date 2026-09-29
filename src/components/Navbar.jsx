import React from 'react';

/**
 * @param {{
 *   items: { id: string, label: string, badge?: number }[],
 *   currentView: string,
 *   setCurrentView: (id: string) => void,
 * }} props
 */
export default function Navbar({ items, currentView, setCurrentView }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>JobFind</h1>
      </div>
      <div className="navbar-links">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className={currentView === item.id ? 'nav-link active' : 'nav-link'}
            aria-current={currentView === item.id ? 'page' : undefined}
            onClick={() => setCurrentView(item.id)}
          >
            {item.label}
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </button>
        ))}
      </div>
    </nav>
  );
}
