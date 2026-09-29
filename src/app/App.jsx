import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { routes } from "./routes";

export default function App() {
  return (
    <AppShell>
      <Routes>
        {routes.map(({ path, param, page: Page }) => (
          // One route with an optional segment, so opening a job or tab
          // doesn't remount the page (and reset its filters).
          <Route key={path} path={param ? `${path}/:${param}?` : path} element={<Page />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
