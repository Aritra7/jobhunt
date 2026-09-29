export const BEHAVIORAL_QUESTIONS = [
  'Tell me about yourself.',
  'Tell me about a time you faced a difficult technical or project challenge. How did you handle it?',
  'Describe a time you disagreed with a teammate. What happened?',
  'Tell me about a time you failed. What did you learn?',
  'Give an example of a goal you set and how you achieved it.',
  'Describe a time you had to learn something new quickly.',
  'Tell me about a time you had to meet a tight deadline.',
  'Describe a situation where you took initiative without being asked.',
  'Tell me about a time you received critical feedback. How did you respond?',
  'Describe a time you had to explain something complex to a non-technical person.',
  'Tell me about a project you are most proud of.',
  'Why do you want to work here?',
];

export const TECHNICAL_QUESTIONS = [
  'Explain the difference between a process and a thread.',
  'What happens when you type a URL into a browser and press Enter?',
  'Explain Big-O notation. What is the complexity of binary search and why?',
  'When would you use a hash map instead of an array?',
  'What is the difference between SQL and NoSQL databases? When would you pick each?',
  'Explain what an API is and how REST APIs work.',
  'What is SQL injection and how do you prevent it?',
  'What is cross-site scripting (XSS) and how do you prevent it?',
  'Describe how you would debug a slow web page.',
  'Explain the difference between unit, integration and end-to-end tests.',
];

/** @type {Record<string, string[]>} */
export const ROLE_QUESTIONS = {
  Frontend: [
    'How does React decide when to re-render a component?',
    'Explain the CSS box model and how flexbox differs from grid.',
    'How would you make a web page accessible to screen-reader users?',
    'What is the difference between state and props in React?',
    'How would you improve the load time of a large single-page app?',
  ],
  Backend: [
    'How would you design a URL shortener?',
    'Explain database indexing. When can an index hurt performance?',
    'How do you handle authentication and authorization in an API?',
    'What is caching and where would you add it in a web service?',
    'How would you make an API endpoint idempotent?',
  ],
  Data: [
    'Explain the difference between an inner join and a left join.',
    'How would you handle missing values in a dataset?',
    'What is overfitting and how do you prevent it?',
    'How would you design an A/B test for a new feature?',
    'Explain precision vs. recall with an example.',
  ],
  Product: [
    'How would you prioritize a backlog with more requests than capacity?',
    'Pick a product you use daily. How would you improve it?',
    'How do you decide which metrics define success for a feature?',
    'Tell me about a time you said no to a stakeholder.',
    'How would you write a user story and its acceptance criteria?',
  ],
  Design: [
    'Walk me through your design process on a recent project.',
    'How do you validate a design decision with users?',
    'How do you balance user needs with business goals?',
    'How do you hand off designs to engineers?',
    'Critique the design of an app you use every day.',
  ],
};

export const STAR_TIP = 'Use STAR: Situation (context), Task (your goal), Action (what YOU did), Result (numbers if possible).';

/** Checklist shown for each upcoming interview; ids are stored per application. */
export const INTERVIEW_CHECKLIST = [
  { id: 'research', label: 'Research the company: product, news, competitors' },
  { id: 'jd', label: 'Re-read the job description and map your experience to it' },
  { id: 'star', label: 'Prepare 3 STAR stories (challenge, conflict, success)' },
  { id: 'technical', label: 'Practice technical / role-specific questions' },
  { id: 'questions', label: 'Prepare 2–3 questions to ask the interviewer' },
  { id: 'logistics', label: 'Confirm time, link/address, and test camera + mic' },
  { id: 'resume', label: 'Have your resume and notes open' },
  { id: 'thanks', label: 'Send a thank-you note within 24 hours' },
];
