import { describe, it, expect } from 'vitest';
import { makeJob, detectRegions, withDescription } from '../api/jobModel';
import { mergeJobs } from '../api/jobsApi';
import { matchJobs } from '../utils/matching';

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

// Ported to the combined app's matching (utils/matching.js), which uses the
// same weights; its profile has preferredLocations[] instead of preferredLocation.
describe('matchJobs', () => {
  const profile = { keywords: ['react'], preferredLocations: [], jobTypes: [] };

  it('ranks title matches above description-only matches', () => {
    const titleHit = job({ rawId: 1, title: 'React Engineer', tags: [] });
    const descHit = job({ rawId: 2, title: 'Web Developer', tags: [] });
    const miss = job({ rawId: 3, title: 'Accountant', tags: [], descriptionHtml: 'Spreadsheets' });
    expect(matchJobs([descHit, miss, titleHit], profile).map(j => j.title)).toEqual(['React Engineer', 'Web Developer']);
  });

  it('applies job type as a filter', () => {
    const contract = job({ jobTypes: ['contract'] });
    expect(matchJobs([contract], { ...profile, jobTypes: ['Full time'] })).toEqual([]);
  });

  it('an Internship preference only matches internships, not jobs with no stated type', () => {
    const untyped = job({ jobTypes: [], title: 'React Engineer' });
    const intern = job({ jobTypes: [], title: 'React Engineering Intern' });
    const internOnly = { ...profile, jobTypes: ['Internship'] };
    expect(matchJobs([untyped, intern], internOnly)).toEqual([intern]);
    // Untyped career-page jobs still count as full time.
    expect(matchJobs([untyped], { ...profile, jobTypes: ['Full time'] })).toEqual([untyped]);
  });

  it('matches location as a case-insensitive substring', () => {
    const berlin = job({ title: 'Designer', tags: [], descriptionHtml: '', location: 'Berlin, Germany', remote: false });
    expect(matchJobs([berlin], { ...profile, keywords: [], preferredLocations: ['berlin'] })).toEqual([berlin]);
  });
});

describe('detectRegions', () => {
  it('recognizes US locations', () => {
    expect(detectRegions('San Francisco, CA • New York, NY • United States', false)).toEqual(['us']);
    expect(detectRegions('Austin, TX', false)).toEqual(['us']);
    expect(detectRegions('Remote (USA)', true)).toEqual(['us']);
    expect(detectRegions('Remote - US', true)).toEqual(['us']);
  });

  it('recognizes Europe/UK and worldwide remote', () => {
    expect(detectRegions('Birmingham Region', false)).toEqual(['europe']);
    expect(detectRegions('London; Manchester City', false)).toEqual(['europe']);
    expect(detectRegions('Remote (Worldwide)', true)).toEqual(['worldwide']);
    expect(detectRegions('London, UK • New York, NY', false)).toEqual(['us', 'europe']);
  });

  it('does not treat the word "us" as the United States', () => {
    expect(detectRegions('Join us in Berlin', false)).toEqual(['europe']);
    expect(detectRegions('Location not listed', false)).toEqual([]);
  });
});

describe('on-demand descriptions', () => {
  it('infers job type from the title when the source has none', () => {
    expect(job({ jobTypes: [], title: 'Software Engineering Intern, Summer 2027' }).jobTypes).toEqual(['Internship']);
    expect(job({ jobTypes: [], title: 'Senior Engineer' }).jobTypes).toEqual([]);
  });

  it('withDescription fills in text, tags and search text', () => {
    const listed = job({ descriptionHtml: '', detailsKey: 'figma/1' });
    expect(listed.descriptionText).toBe('');
    const full = withDescription(listed, '&lt;p&gt;Work with Kubernetes&lt;/p&gt;', ['Engineering']);
    expect(full.descriptionText).toBe('Work with Kubernetes');
    expect(full.tags).toContain('Engineering');
    expect(full.searchText).toContain('kubernetes');
    expect(full.detailsKey).toBeNull();
  });
});
