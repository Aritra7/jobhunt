import React from 'react';
import { APPLICATION_STATUSES } from '../../data/applicationStatuses';

/**
 * @param {{
 *   value: import('../../types').ApplicationStatus,
 *   onChange: (status: import('../../types').ApplicationStatus) => void,
 *   label?: string,
 * }} props
 */
export default function StatusSelect({ value, onChange, label = 'Application status' }) {
  return (
    <select
      className={`status-select status-${value}`}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(/** @type {import('../../types').ApplicationStatus} */ (e.target.value))}
    >
      {APPLICATION_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  );
}
