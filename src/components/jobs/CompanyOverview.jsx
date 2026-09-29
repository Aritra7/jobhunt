import React, { useEffect, useState } from 'react';
import { fetchCompanyProfile } from '../../api/companyApi';
import ResearchLinks from '../common/ResearchLinks';

const MAX_OTHER_ROLES = 5;

/**
 * Company profile (from The Muse when available), other open roles at the
 * same company, and research links.
 * @param {{
 *   job: import('../../types').Job,
 *   allJobs: import('../../types').Job[],
 *   onSelectJob: (job: import('../../types').Job) => void,
 * }} props
 */
export default function CompanyOverview({ job, allJobs, onSelectJob }) {
  const [info, setInfo] = useState(/** @type {import('../../api/companyApi').CompanyInfo | null} */ (null));
  const [status, setStatus] = useState(job.companyProfile ? 'loading' : 'none');
  const profile = job.companyProfile;
  const profileSource = profile ? profile.source : null;
  const profileId = profile ? profile.id : null;

  useEffect(() => {
    if (!profileSource || !profileId) return undefined;
    let cancelled = false;
    fetchCompanyProfile({ source: profileSource, id: profileId })
      .then(result => { if (!cancelled) { setInfo(result); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [profileSource, profileId]);

  const company = job.company.toLowerCase();
  const otherRoles = allJobs.filter(j => j.id !== job.id && j.company.toLowerCase() === company);

  return (
    <aside className="company-overview">
      <h4>About {job.company}</h4>

      {status === 'loading' && <p className="muted">Loading company profile…</p>}
      {status === 'error' && <p className="muted">Company profile unavailable right now.</p>}
      {info && (
        <div className="company-facts">
          {info.description && <p>{info.description}</p>}
          <dl>
            {info.industries.length > 0 && (<><dt>Industry</dt><dd>{info.industries.join(', ')}</dd></>)}
            {info.size && (<><dt>Size</dt><dd>{info.size}</dd></>)}
            {info.locations.length > 0 && (<><dt>Offices</dt><dd>{info.locations.slice(0, 4).join(', ')}</dd></>)}
          </dl>
          {info.url && (
            <a href={info.url} target="_blank" rel="noopener noreferrer">
              {profileSource === 'muse' ? 'Company page on The Muse ↗' : 'All open roles (careers page) ↗'}
            </a>
          )}
        </div>
      )}

      <h5>Open roles here ({otherRoles.length + 1})</h5>
      {otherRoles.length === 0 ? (
        <p className="muted">No other roles from this company in the loaded results.</p>
      ) : (
        <ul className="other-roles">
          {otherRoles.slice(0, MAX_OTHER_ROLES).map(role => (
            <li key={role.id}>
              <button type="button" className="link-button" onClick={() => onSelectJob(role)}>{role.title}</button>
              <span className="muted"> · {role.location}</span>
            </li>
          ))}
        </ul>
      )}

      <h5>Research</h5>
      <ResearchLinks company={job.company} />
    </aside>
  );
}
