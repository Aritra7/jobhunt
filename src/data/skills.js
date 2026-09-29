// Skills/keywords the ATS checker looks for in job descriptions. Each entry is
// [display name, ...aliases]; matching is case-insensitive on word boundaries,
// except names in CASE_SENSITIVE_SKILLS, which are also ordinary English words.
/** @type {string[][]} */
export const SKILLS = [
  // Languages
  ['JavaScript', 'js'], ['TypeScript', 'ts'], ['Python'], ['Java'], ['C++', 'cpp'], ['C#', 'csharp'],
  ['Go', 'golang'], ['Rust'], ['Ruby'], ['PHP'], ['Swift'], ['Kotlin'], ['Scala'], ['R (language)', 'rstudio', 'r programming', 'tidyverse'], ['SQL'],
  ['HTML'], ['CSS'], ['Bash', 'shell scripting'], ['MATLAB'],
  // Frontend
  ['React', 'react.js', 'reactjs'], ['Angular'], ['Vue', 'vue.js'], ['Next.js', 'nextjs'], ['Redux'],
  ['Tailwind', 'tailwindcss'], ['Sass', 'scss'], ['Webpack'], ['Vite'], ['Accessibility', 'a11y', 'wcag'],
  ['Responsive design'],
  // Backend
  ['Node.js', 'node', 'nodejs'], ['Express.js', 'expressjs'], ['Django'], ['Flask'], ['FastAPI'], ['Spring Boot', 'spring framework'],
  ['Ruby on Rails', 'rails'], ['.NET', 'dotnet', 'asp.net'], ['GraphQL'], ['REST APIs', 'rest api', 'restful'],
  ['Microservices'], ['gRPC'],
  // Data
  ['PostgreSQL', 'postgres'], ['MySQL'], ['MongoDB'], ['Redis'], ['Elasticsearch'], ['DynamoDB'],
  ['Snowflake'], ['BigQuery'], ['Spark', 'apache spark', 'pyspark'], ['Kafka'], ['Airflow'], ['dbt'],
  ['Pandas'], ['NumPy'], ['Tableau'], ['Power BI'], ['Excel'], ['ETL'], ['Data analysis'],
  ['Data visualization'], ['Statistics'], ['A/B testing', 'ab testing', 'experimentation'],
  // ML / AI
  ['Machine learning', 'ml'], ['Deep learning'], ['TensorFlow'], ['PyTorch'], ['scikit-learn', 'sklearn'],
  ['NLP', 'natural language processing'], ['Computer vision'], ['LLM', 'llms', 'large language models'],
  ['Generative AI', 'genai'],
  // Cloud / DevOps
  ['AWS', 'amazon web services'], ['Azure'], ['GCP', 'google cloud'], ['Docker'], ['Kubernetes', 'k8s'],
  ['Terraform'], ['CI/CD', 'ci cd', 'continuous integration'], ['Jenkins'], ['GitHub Actions'], ['Linux'],
  ['Git'], ['Observability', 'monitoring'], ['Security'],
  // Mobile
  ['iOS'], ['Android'], ['React Native'], ['Flutter'],
  // Testing
  ['Unit testing', 'unit tests'], ['Jest'], ['Cypress'], ['Playwright'], ['Selenium'], ['TDD', 'test-driven development'],
  // Design / product
  ['Figma'], ['UX research', 'user research'], ['Prototyping'], ['Wireframing', 'wireframes'],
  ['Product management'], ['Roadmap', 'roadmapping'], ['Agile'], ['Scrum'], ['Jira'], ['Stakeholder management', 'stakeholders'],
  ['Product strategy'], ['Analytics'], ['SEO'],
  // Soft skills
  ['Communication'], ['Leadership'], ['Collaboration', 'cross-functional'], ['Problem solving', 'problem-solving'],
  ['Mentoring', 'mentorship'], ['Project management'],
];

export const CASE_SENSITIVE_SKILLS = new Set(['Go', 'Swift', 'Excel', 'Rust', 'Spark']);
