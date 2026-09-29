import { useLocation } from "react-router-dom";
import { titleForPath } from "../../app/routes";

export default function Topbar() {
  const { pathname } = useLocation();
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">GET A JOB · PRODUCT PROTOTYPE</span>
        <h1>{titleForPath(pathname)}</h1>
      </div>
      <div className="topbar-pills">
        <span className="pill">React</span>
        <span className="pill">Vite</span>
        <span className="pill accent-pill">V1 + V2</span>
      </div>
    </header>
  );
}
