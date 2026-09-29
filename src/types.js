// Shared JSDoc types. `npm run typecheck` checks component props against these.

/**
 * @typedef {'arbeitnow' | 'remotive' | 'muse'} JobSourceId
 */

/**
 * A job listing normalized from any source.
 * @typedef {Object} Job
 * @property {string} id               Unique across sources, e.g. "remotive:123"
 * @property {JobSourceId} source
 * @property {string} sourceName       Display name, required for attribution
 * @property {string} title
 * @property {string} company
 * @property {string | null} companyLogo  Safe http(s) URL or null
 * @property {string | null} museCompanyId
 * @property {string} location
 * @property {boolean} remote
 * @property {string[]} jobTypes       Normalized, see JOB_TYPES
 * @property {string[]} tags
 * @property {string | null} salary
 * @property {string | null} level
 * @property {string} postedAt         ISO timestamp
 * @property {string} descriptionHtml  UNSANITIZED source HTML - only render through <SafeHtml>
 * @property {string} descriptionText  Plain text, safe to render as text
 * @property {string} searchText       Lowercased haystack for keyword search
 * @property {string | null} url       Safe http(s) link back to the original posting
 */

/**
 * @typedef {Object} Profile
 * @property {string[]} keywords        Target roles / keywords
 * @property {string} preferredLocation Free text, matched as a substring
 * @property {'any' | 'remote' | 'onsite'} workMode
 * @property {string[]} jobTypes
 */

/**
 * @typedef {'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'} ApplicationStatus
 */

/**
 * A job the user is tracking.
 * @typedef {Object} Application
 * @property {string} id
 * @property {string | null} jobId
 * @property {string} title
 * @property {string} company
 * @property {string} location
 * @property {string | null} url
 * @property {string} sourceName
 * @property {string} descriptionText
 * @property {ApplicationStatus} status
 * @property {string} notes
 * @property {string} deadline          yyyy-mm-dd or ''
 * @property {string} interviewAt       yyyy-mm-ddThh:mm or ''
 * @property {Record<string, boolean>} checklist
 * @property {{ status: ApplicationStatus, at: string }[]} history
 * @property {string} createdAt
 * @property {string | null} appliedAt
 */

/**
 * @typedef {Object} ExperienceEntry
 * @property {string} id
 * @property {string} title
 * @property {string} company
 * @property {string} start
 * @property {string} end
 * @property {string} bulletsText   One bullet per line
 */

/**
 * @typedef {Object} EducationEntry
 * @property {string} id
 * @property {string} school
 * @property {string} degree
 * @property {string} start
 * @property {string} end
 */

/**
 * @typedef {Object} Resume
 * @property {{ name: string, email: string, phone: string, location: string, linkedin: string }} contact
 * @property {string} summary
 * @property {string} skillsText    Comma-separated
 * @property {ExperienceEntry[]} experience
 * @property {EducationEntry[]} education
 */

export {};
