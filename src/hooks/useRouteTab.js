import { useNavigate, useParams } from "react-router-dom";

// The active tab lives in the URL (/resume-profile/ats), so back/forward and
// reloads keep it. Unknown tabs fall back to the first one.
export function useRouteTab(tabs, basePath) {
  const { tab } = useParams();
  const navigate = useNavigate();
  const active = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;
  return [active, (id) => navigate(`${basePath}/${id}`)];
}
