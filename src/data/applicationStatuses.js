/** @type {{ id: import('../types').ApplicationStatus, label: string }[]} */
export const APPLICATION_STATUSES = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export const STATUS_IDS = APPLICATION_STATUSES.map(s => s.id);

/** @param {string} id */
export function statusLabel(id) {
  const found = APPLICATION_STATUSES.find(s => s.id === id);
  return found ? found.label : id;
}
