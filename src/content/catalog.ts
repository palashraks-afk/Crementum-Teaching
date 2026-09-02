export type CoreId = "math" | "science" | "humanities" | "speech";

export type Core = {
  id: CoreId;
  name: string;
  /** Shown under the core heading on /subjects. One plain sentence, no selling. */
  blurb: string;
};

export type Course = {
  /** Stable slug used in booking links and stored with each request. */
  slug: string;
  name: string;
  core: CoreId;
  /** Extra words that should match when someone types. Never rendered. */
  aka?: string[];
};

export const CORES: Core[] = [
  {
    id: "math",
    name: "Math",
    blurb:
      "From pre-algebra through multivariable calculus. Tutors work a problem more than one way, because the way your teacher showed you is not always the way it lands.",
  },
  {
    id: "science",
    name: "Science",
    blurb:
      "Biology, chemistry, physics, environmental science, psychology, and intro computer science in Java or Python.",
  },
  {
    id: "humanities",
    name: "Humanities",
    blurb:
      "History, English, economics, and language. Bring a thesis that is not working yet, or an essay due Thursday.",
  },
  {
    id: "speech",
    name: "Speech & Debate",
    blurb:
      "Case writing, rebuttals, cross-ex, and delivery. Most of our tutors compete, so they have judged the round you are prepping for.",
  },
];

export const COURSES: Course[] = [
  // Math
  { slug: "pre-algebra", name: "Pre-Algebra", core: "math" },
  { slug: "algebra-1", name: "Algebra 1", core: "math" },
  { slug: "geometry", name: "Geometry", core: "math" },
  { slug: "algebra-2-trig", name: "Algebra 2 / Trigonometry", core: "math", aka: ["trig"] },
  { slug: "precalculus", name: "Precalculus", core: "math", aka: ["pre-calc", "precalc"] },
  { slug: "ap-precalculus", name: "AP Precalculus", core: "math", aka: ["pre-calc", "precalc"] },
  { slug: "ap-calculus-ab", name: "AP Calculus AB", core: "math", aka: ["calc"] },
  { slug: "ap-calculus-bc", name: "AP Calculus BC", core: "math", aka: ["calc"] },
  { slug: "ap-statistics", name: "AP Statistics", core: "math", aka: ["stats"] },
  { slug: "multivariable-calculus", name: "Multivariable Calculus", core: "math", aka: ["calc 3", "multivar"] },

  // Science
  { slug: "biology", name: "Biology", core: "science", aka: ["bio"] },
  { slug: "ap-biology", name: "AP Biology", core: "science", aka: ["bio"] },
  { slug: "chemistry", name: "Chemistry", core: "science", aka: ["chem"] },
  { slug: "ap-chemistry", name: "AP Chemistry", core: "science", aka: ["chem"] },
  { slug: "honors-physics", name: "Honors Physics", core: "science" },
  { slug: "ap-physics-1-2", name: "AP Physics 1 & 2", core: "science" },
  { slug: "ap-physics-c", name: "AP Physics C", core: "science", aka: ["mechanics", "e&m"] },
  { slug: "ap-environmental-science", name: "AP Environmental Science", core: "science", aka: ["apes"] },
  { slug: "computer-science", name: "Computer Science", core: "science", aka: ["java", "python", "csa", "cs"] },
  { slug: "ap-psychology", name: "AP Psychology", core: "science", aka: ["psych"] },

  // Humanities
  { slug: "world-history", name: "World History", core: "humanities" },
  { slug: "ap-world-history", name: "AP World History", core: "humanities", aka: ["whap"] },
  { slug: "us-history", name: "US History", core: "humanities", aka: ["apush", "ush"] },
  { slug: "ap-european-history", name: "AP European History", core: "humanities", aka: ["euro"] },
  { slug: "english-lit-comp", name: "English Literature & Composition", core: "humanities", aka: ["ap lit", "english"] },
  { slug: "ap-english-language", name: "AP English Language", core: "humanities", aka: ["ap lang", "english"] },
  { slug: "spanish", name: "Spanish, levels 1 through AP", core: "humanities" },
  { slug: "french", name: "French, levels 1 through AP", core: "humanities" },
  { slug: "economics", name: "Macro & Microeconomics", core: "humanities", aka: ["econ"] },

  // Speech & Debate
  { slug: "extemporaneous-speaking", name: "Extemporaneous Speaking", core: "speech", aka: ["extemp"] },
  { slug: "lincoln-douglas", name: "Lincoln-Douglas Debate", core: "speech", aka: ["ld"] },
  { slug: "public-forum", name: "Public Forum Debate", core: "speech", aka: ["pf"] },
  { slug: "world-schools", name: "World Schools Debate", core: "speech", aka: ["wsd"] },
  { slug: "original-oratory", name: "Original Oratory", core: "speech", aka: ["oo"] },
  { slug: "congressional-debate", name: "Congressional Debate", core: "speech", aka: ["congress"] },
  { slug: "dramatic-interpretation", name: "Dramatic Interpretation", core: "speech", aka: ["di"] },
];

export const CORE_BY_ID = Object.fromEntries(CORES.map((c) => [c.id, c])) as Record<CoreId, Core>;

export function coursesInCore(core: CoreId): Course[] {
  return COURSES.filter((c) => c.core === core);
}

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
