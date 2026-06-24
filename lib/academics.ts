// Shared academic reference data for Catholic University of Ghana (CUG).

export const FACULTIES = [
  "Faculty of Computing Engineering and Mathematical Sciences: (CEMS)",
  "Faculty of Economics and Business Administration: (EBA)",
  "Faculty of Education: (ED)",
  "Faculty of Nursing and Midwifery: (SONAM)",
  "Faculty of Religious Studies: (RS)",
] as const;

export const PROGRAMMES = [
  "Computer Science",
  "Information Technology",
  "Business Administration",
  "Economics",
  "Nursing",
  "Education",
  "Psychology",
  "Sociology",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
] as const;

export const LEVELS = [
  "Level 100",
  "Level 200",
  "Level 300",
  "Level 400",
  "Level 500",
] as const;

export const COMPLAINT_CATEGORIES = [
  "Academic",
  "Welfare",
  "Accommodation",
  "Finance",
  "Health",
  "Other",
] as const;

export const ANNOUNCEMENT_CATEGORIES = [
  "General",
  "Academic",
  "Events",
  "Emergency",
  "Welfare",
  "Other",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export const STATUSES = ["Pending", "In Progress", "Resolved", "Closed"] as const;

export type Faculty = (typeof FACULTIES)[number];
export type Programme = (typeof PROGRAMMES)[number];
export type Level = (typeof LEVELS)[number];
