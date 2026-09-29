import React from 'react';

/**
 * Segmented tab bar. The caller renders the active panel.
 * @param {{ tabs: { id: string, label: string }[], active: string, onChange: (id: string) => void, label: string }} props
 */
export default function Tabs({ tabs, active, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? 'tab active' : 'tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
