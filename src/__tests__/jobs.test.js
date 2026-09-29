import { describe, it, expect } from 'vitest';
import { makeJob } from '../api/jobModel';
import { mergeJobs } from '../api/jobsApi';
import { matchJobs, scoreJob } from '../utils/matchJobs';

/** @param {Partial<Parameters<typeof makeJob>[0]>} overrides */
function job(overrides = {}) {
  return makeJob({
    source: 'remotive', sourceName: 'Remotive', rawId: Math.random(),
    title: 'Frontend Developer', company: 'Acme', location: 'Remote', remote: true,
    jobTypes: ['full_time'], tags: ['React'], postedAt: '2026-09-20T00:00:00.000Z',
    descriptionHtml: '<p>Build UIs with React and TypeScript.</p>', url: 'https://example.com/1',
    ...overrides,
  });
}

describe('makeJob normalization', () => {
  it('normalizes messy job types from different sources', () => {
    expect(job({ jobTypes: ['Full-time'] }).jobTypes).toEqual(['Full time']);
    expect(job({ jobTypes: ['fulltime permanent'] }).jobTypes).toEqual(['Full time']);
    expect(job({ jobTypes: ['Working student'] }).jobTypes).toEqual(['Internship']);
    expect(job({ jobTypes: ['Full or part time'] }).jobTypes).toEqual(['Full time', 'Part time']);
    expect(job({ jobTypes: ['berufserfahren'] }).jobTypes).toEqual([]);
  });

  it('builds plain text and rejects unsafe urls/logos', () => {
    const j = job({ url: 'javascript:alert(1)', companyLogo: 'javascript:x' });
    expect(j.descriptionText).toBe('Build UIs with React and TypeScript.');
    expect(j.url).toBeNull();
    expect(j.companyLogo).toBeNull();
  });

  it('decodes double-escaped HTML so it renders as formatting, not literal tags', () => {
    const j = job({ descriptionHtml: '<p>&lt;strong&gt;Type:&lt;/strong&gt; Full time&lt;br&gt;Remote</p>' });
    expect(j.descriptionHtml).toBe('<strong>Type:</strong> Full time<br>Remote');
    expect(j.descriptionText).toBe('Type: Full time\nRemote');
    expect(job({ descriptionHtml: '<p>Use &lt; and &gt; in math</p>' }).descriptionHtml).toBe('<p>Use &lt; and &gt; in math</p>');
  });

  it('fills in fallbacks for missing fields', () => {
    const j = job({ title: '', company: null, location: '', remote: false });
    expect(j.title).toBe('Untitled role');
    expect(j.company).toBe('Unknown company');
    expect(j.location).toBe('Location not listed');
  });
});

describe('mergeJobs', () => {
  it('drops cross-source duplicates and sorts newest first', () => {
    const a = job({ rawId: 1, postedAt: '2026-09-01T00:00:00.000Z' });
    const dup = job({ rawId: 2, source: 'arbeitnow', postedAt: '2026-09-02T00:00:00.000Z' });
    const b = job({ rawId: 3, title: 'Backend Engineer', postedAt: '2026-09-10T00:00:00.000Z' });
    const merged = mergeJobs([a], [dup, b]);
    expect(merged.map(j => j.title)).toEqual(['Backend Engineer', 'Frontend Developer']);
  });
});

describe('matchJobs', () => {
  const profile = { keywords: ['react'], preferredLocation: '', workMode: /** @type {const} */ ('any'), jobTypes: [] };

  it('ranks title matches above description-only matches', () => {
    const titleHit = job({ rawId: 1, title: 'React Engineer', tags: [] });
    const descHit = job({ rawId: 2, title: 'Web Developer', tags: [] });
    const miss = job({ rawId: 3, title: 'Accountant', tags: [], descriptionHtml: 'Spreadsheets' });
    expect(matchJobs([descHit, miss, titleHit], profile).map(j => j.title)).toEqual(['React Engineer', 'Web Developer']);
  });

  it('applies work mode and job type as filters', () => {
    const onsite = job({ remote: false, location: 'Berlin' });
    expect(scoreJob(onsite, { ...profile, workMode: 'remote' })).toBe(0);
    const contract = job({ jobTypes: ['contract'] });
    expect(scoreJob(contract, { ...profile, jobTypes: ['Full time'] })).toBe(0);
  });

  it('matches location as a case-insensitive substring', () => {
    const berlin = job({ title: 'Designer', tags: [], descriptionHtml: '', location: 'Berlin, Germany', remote: false });
    expect(scoreJob(berlin, { ...profile, keywords: [], preferredLocation: 'berlin' })).toBeGreaterThan(0);
  });
});
