import React, { useState } from 'react';

/**
 * Logo if the source provides one, otherwise the company's initial.
 * @param {{ job: import('../../types').Job, size?: number }} props
 */
export default function CompanyLogo({ job, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (job.companyLogo && !failed) {
    return (
      <img
        className="company-logo"
        src={job.companyLogo}
        alt=""
        style={style}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return <div className="company-logo company-logo-fallback" style={style} aria-hidden="true">{job.company.charAt(0)}</div>;
}
