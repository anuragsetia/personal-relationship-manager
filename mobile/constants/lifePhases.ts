export const LIFE_PHASES = [
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Working Professional' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'retired', label: 'Retired' },
] as const;

export type LifePhase = (typeof LIFE_PHASES)[number]['value'];

// ─── Institution label ────────────────────────────────────────────────────────

export const INSTITUTION_LABEL: Record<LifePhase, string> = {
  student: 'School / College / University',
  professional: 'Current Employer',
  business_owner: 'Business Name',
  freelancer: 'Primary Studio / Agency',
  retired: 'Last Employer',
};

// ─── Phase-specific profile fields ───────────────────────────────────────────

export type ProfileField = {
  key: 'context1' | 'context2';
  label: string;
  placeholder: string;
};

export const PROFILE_FIELDS: Record<LifePhase, ProfileField[]> = {
  student: [
    { key: 'context1', label: 'Course / Degree', placeholder: 'e.g. B.Tech Computer Science, MBA' },
    { key: 'context2', label: 'Batch / Year', placeholder: 'e.g. 2022–2026, Class of 2025' },
  ],
  professional: [
    { key: 'context1', label: 'Current Role / Title', placeholder: 'e.g. Product Manager, Software Engineer' },
    { key: 'context2', label: 'Industry', placeholder: 'e.g. Technology, Finance, Healthcare' },
  ],
  business_owner: [
    { key: 'context1', label: 'Industry', placeholder: 'e.g. E-commerce, SaaS, Manufacturing' },
    { key: 'context2', label: 'Business Type', placeholder: 'e.g. B2B, B2C, Both' },
  ],
  freelancer: [
    { key: 'context1', label: 'Domain / Skill', placeholder: 'e.g. Web Development, UX Design, Copywriting' },
    { key: 'context2', label: 'Years of Experience', placeholder: 'e.g. 3 years' },
  ],
  retired: [
    { key: 'context1', label: 'Former Role', placeholder: 'e.g. Regional Manager, Software Architect' },
    { key: 'context2', label: 'Industry', placeholder: 'e.g. Banking, Government, Education' },
  ],
};

// ─── Where you met them ───────────────────────────────────────────────────────

export const KNOWN_FROM_OPTIONS: Record<LifePhase, string[]> = {
  student: ['School', 'College', 'University', 'Online', 'Neighborhood', 'Family', 'Sports', 'Hobby', 'Exchange Program'],
  professional: ['Current Job', 'Previous Job', 'College', 'School', 'Client', 'Conference', 'Neighborhood', 'Family', 'Online', 'Networking Event'],
  business_owner: ['Customer', 'Supplier', 'Partner', 'Investor', 'Current Job', 'Previous Job', 'College', 'Conference', 'Neighborhood', 'Family', 'Online', 'Trade Show'],
  freelancer: ['Client', 'Collaborator', 'Previous Job', 'College', 'Online', 'Conference', 'Neighborhood', 'Family', 'Platform'],
  retired: ['Previous Job', 'Neighborhood', 'Family', 'Hobby', 'Community', 'Online', 'Place of Worship'],
};

// ─── Relationship types ───────────────────────────────────────────────────────

export const RELATIONSHIP_TYPES: Record<LifePhase, string[]> = {
  student: [
    'Batchmate',
    'Classmate',
    'Friend',
    'Senior',
    'Junior',
    'Mentor',
    'Professor',
    'Teammate',
    'Roommate',
    'Lab Partner',
    'Study Partner',
    'Acquaintance',
  ],
  professional: [
    'Colleague',
    'Manager',
    'Direct Report',
    'Mentor',
    'Mentee',
    'Client',
    'Vendor',
    'Partner',
    'Teammate',
    'Stakeholder',
    'Recruiter',
    'Acquaintance',
  ],
  business_owner: [
    'Customer',
    'Supplier',
    'Business Partner',
    'Investor',
    'Employee',
    'Mentor',
    'Advisor',
    'Competitor',
    'Distributor',
    'Consultant',
    'Acquaintance',
  ],
  freelancer: [
    'Client',
    'Collaborator',
    'Sub-contractor',
    'Mentor',
    'Peer',
    'Referral',
    'Agency Contact',
    'Acquaintance',
  ],
  retired: [
    'Former Colleague',
    'Friend',
    'Neighbor',
    'Family',
    'Community Member',
    'Fellow Retiree',
    'Acquaintance',
  ],
};
