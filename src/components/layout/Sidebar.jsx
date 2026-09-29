import { NavLink } from "react-router-dom";
import { routes } from "../../app/routes";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">G</div>
        <div>
          <strong>Get a Job</strong>
          <span>Career workflow</span>
        </div>
      </div>
      <div className="nav-label">Workspace</div>
      <nav className="nav">
        {routes.map(({ path, icon, label, subtitle }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-copy">
              <strong>{label}</strong>
              <span>{subtitle}</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="eyebrow">AGILE METHODS</div>
        <strong>Feature decomposition → releases → working increment.</strong>
        <p>V1 stays usable while V2 adds smarter automation and personalization.</p>
      </div>
    </aside>
  );
}
