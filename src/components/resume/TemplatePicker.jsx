import React from 'react';
import { TEMPLATES } from '../../data/templates';

/**
 * @param {{ selectedTemplate: string, setSelectedTemplate: (id: string) => void }} props
 */
export default function TemplatePicker({ selectedTemplate, setSelectedTemplate }) {
  return (
    <div className="template-picker-section">
      <h3>Choose a Template</h3>
      <div className="templates-grid">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            type="button"
            className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => setSelectedTemplate(template.id)}
            style={{ borderTopColor: template.color }}
            aria-pressed={selectedTemplate === template.id}
          >
            <div className={`template-preview template-thumb-${template.id}`}></div>
            <h4>{template.name}</h4>
            {selectedTemplate === template.id && <div className="selected-indicator">✅ Selected</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
