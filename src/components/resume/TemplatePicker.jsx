import { resumeTemplates } from "../../data/resumeTemplates";

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="template-picker" role="radiogroup" aria-label="Resume template">
      {resumeTemplates.map((template) => {
        const active = template.id === selected;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={active}
            key={template.id}
            className={`template-option${active ? " selected" : ""}`}
            style={{ "--template-color": template.color }}
            onClick={() => onSelect(template.id)}
          >
            <span className="template-swatch" />
            {template.name}
          </button>
        );
      })}
    </div>
  );
}
