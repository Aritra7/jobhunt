import React, { useState } from 'react';
import ApplicationCard from './ApplicationCard';
import AddApplicationForm from './AddApplicationForm';
import { APPLICATION_STATUSES } from '../../data/applicationStatuses';
import { daysUntil } from '../../utils/format';

const DUE_SOON_DAYS = 3;

/**
 * @param {import('../../types').Application[]} apps
 * @param {string} sort
 */
function sortApplications(apps, sort) {
  const copy = [...apps];
  if (sort === 'deadline') {
    // Apps without a deadline go last.
    return copy.sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
  }
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Application tracker: every saved/applied job, its status, deadline and notes.
 * @param {{ tracker: ReturnType<typeof import('../../hooks/useTracker').default>, onFindJobs: () => void }} props
 */
export default function Tracker({ tracker, onFindJobs }) {
  const { applications, addApplication, updateApplication, removeApplication } = tracker;
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [adding, setAdding] = useState(false);

  const counts = Object.fromEntries(APPLICATION_STATUSES.map(s => [s.id, applications.filter(a => a.status === s.id).length]));
  const dueSoon = applications.filter(a =>
    a.deadline && ['saved', 'applied'].includes(a.status) && daysUntil(a.deadline) >= 0 && daysUntil(a.deadline) <= DUE_SOON_DAYS);
  const visible = sortApplications(
    statusFilter === 'all' ? applications : applications.filter(a => a.status === statusFilter), sort);

  return (
    <div className="tracker-view">
      <div className="view-header">
        <div>
          <h2>Application Tracker</h2>
          <p className="section-description">Save jobs, update their status as you go, and never miss a deadline.</p>
        </div>
        {!adding && <button type="button" className="primary-button" onClick={() => setAdding(true)}>+ Add application</button>}
      </div>

      {adding && <AddApplicationForm onAdd={addApplication} onCancel={() => setAdding(false)} />}

      {dueSoon.length > 0 && (
        <div className="warning-banner" role="status">
          ⏰ {dueSoon.length} deadline{dueSoon.length === 1 ? '' : 's'} in the next {DUE_SOON_DAYS} days:{' '}
          {dueSoon.map(a => `${a.title} (${a.company})`).join(', ')}
        </div>
      )}

      <div className="tracker-toolbar">
        <div className="status-chips" role="group" aria-label="Filter by status">
          <button type="button" className={statusFilter === 'all' ? 'chip active' : 'chip'} onClick={() => setStatusFilter('all')}>
            All <span className="chip-count">{applications.length}</span>
          </button>
          {APPLICATION_STATUSES.map(s => (
            <button
              key={s.id}
              type="button"
              className={statusFilter === s.id ? `chip active status-${s.id}` : `chip status-${s.id}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label} <span className="chip-count">{counts[s.id]}</span>
            </button>
          ))}
        </div>
        <label className="inline-field">
          <span>Sort</span>
          <select className="location-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Recently added</option>
            <option value="deadline">Deadline</option>
          </select>
        </label>
      </div>

      {applications.length === 0 ? (
        <div className="no-results">
          <h2>No applications yet</h2>
          <p>Save jobs from search with ☆ Save, or add one you found elsewhere.</p>
          <button type="button" className="primary-button" onClick={onFindJobs}>Find jobs</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="no-results"><p>No applications with this status.</p></div>
      ) : (
        <div className="application-list">
          {visible.map(app => (
            <ApplicationCard key={app.id} application={app} onUpdate={updateApplication} onRemove={removeApplication} />
          ))}
        </div>
      )}
    </div>
  );
}
