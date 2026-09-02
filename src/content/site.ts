import { COURSES } from "./catalog";

export const SITE = {
  name: "Crementum Teaching",
  shortName: "Crementum",
  tagline: "Free 1-on-1 tutoring.",
  email: "crementumteaching@gmail.com",
  instagram: "https://www.instagram.com/crementumtutoring/",
  instagramHandle: "@crementumtutoring",
  /* Branch count is deliberately not a public stat, the map on /branches is
     the honest answer, and it updates itself when a branch is added. */
  stats: {
    sessions: "1,600+",
    courses: String(COURSES.length),
  },
} as const;

export type Branch = {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  hq?: boolean;
};

export const DEFAULT_BRANCHES: Branch[] = [
  { id: "hq", city: "Redlands", region: "California", country: "USA", lat: 34.0556, lng: -117.1825, hq: true },
  { id: "oc", city: "Orange County", region: "California", country: "USA", lat: 33.7175, lng: -117.8311 },
  { id: "sea", city: "Seattle", region: "Washington", country: "USA", lat: 47.6062, lng: -122.3321 },
  { id: "den", city: "Denver", region: "Colorado", country: "USA", lat: 39.7392, lng: -104.9903 },
  { id: "chi", city: "Chicago", region: "Illinois", country: "USA", lat: 41.8781, lng: -87.6298 },
  { id: "nyc", city: "New York", region: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { id: "mia", city: "Miami", region: "Florida", country: "USA", lat: 25.7617, lng: -80.1918 },
  { id: "atl", city: "Atlanta", region: "Georgia", country: "USA", lat: 33.749, lng: -84.388 },
  { id: "aus", city: "Austin", region: "Texas", country: "USA", lat: 30.2672, lng: -97.7431 },
  { id: "phx", city: "Phoenix", region: "Arizona", country: "USA", lat: 33.4484, lng: -112.074 },
  { id: "ldn", city: "London", region: "England", country: "UK", lat: 51.5074, lng: -0.1278 },
  { id: "tor", city: "Toronto", region: "Ontario", country: "Canada", lat: 43.6532, lng: -79.3832 },
];

export const RECOGNITION = [
  "US House of Representatives",
  "California State Assembly",
  "501(c)(3) nonprofit",
];

/**
 * Leadership. Slots with an empty `name` render as a blank frame, fill in the
 * name, bio and a photo under /public/team/ as each one is confirmed.
 */
export type TeamMember = {
  name: string;
  role: string;
  photo: string;
  /** CSS object-position, for photos whose subject is off-centre. */
  focus?: string;
  bio: string[];
};

export const TEAM: TeamMember[] = [
  {
    name: "Mani Momeni",
    role: "Chief Executive Officer",
    photo: "",
    bio: [
      "Hello everyone, my name is Mani Momeni and I am the CEO of Crementum Teaching. I am thrilled to be working with every one of you as we build Crementum across the nation, even at your own school.",
      "I am an upcoming senior, and my strengths lie in science, math, and mock trial. I've taken AP Biology, AP Statistics, AP Chemistry, AP Calculus BC, and AP Precalculus, and I've done research at UCI, Loma Linda, and Clear Labs, which gave me real experience in the sciences and deepened my understanding of chemistry and biology.",
      "I've been on a mock trial team since middle school. My team won our tournament this school year and advanced to the state championship, where we placed 11th. I started as both attorney and witness, and taught a lot of underclassmen the art of mock trial along the way.",
      "I also have a history of teaching: at Mathnasium I tutored students in everything from 1st-grade math up to AP Calculus BC. That taught me every person approaches learning differently, especially in math, but every approach has a pattern, and teaching someone is never impossible.",
      "Whether it's for tutoring or starting a new branch at your school, don't hesitate to reach out. I'm always one email away, and I can't wait to meet and talk with you all.",
    ],
  },
  {
    name: "Sai Patlola",
    role: "Chief Operating Officer",
    photo: "/team/sai-patlola.jpg",
    bio: [
      "Hi everyone! My name is Sai Patlola, and I am proud to be your Chief Operating Officer at Crementum. I'm always happy to meet new people and listen to new ideas and perspectives. My main goal is making free tutoring nationally accessible by expanding Crementum's reach across the country.",
      "I am a junior at Redlands High School and have earned 5s on multiple AP tests, including Precalculus and European History, and I have taught middle schoolers subjects like Python and math through programs I am involved in. Outside academics, I've built systems and improved efficiency at multiple nonprofits, and I've competed on my school's speech and debate team since freshman year, qualifying for both the NSDA National Tournament and the State tournament twice.",
      "As Chief Operating Officer I oversee how the organization runs day to day, and work on scaling it without making the tutoring experience any worse. Looking forward to meeting and working with everyone.",
    ],
  },
  {
    name: "Ansh Dwivedi",
    role: "Chief Operating Officer",
    photo: "/team/ansh-dwivedi.jpg",
    bio: [
      "Hello! My name is Ansh Dwivedi and I am proud to be a member of Crementum Tutoring, serving as co-Chief Operating Officer. I am honored to work alongside everyone as this organization keeps growing and reaching more schools across the nation.",
      "I am an upcoming senior, enthusiastic about serving my community. Throughout high school I've challenged myself with AP courses, scoring 5s on AP Calculus BC, AP Language, AP U.S. History, and AP Psychology. I'm on our mock trial team as the best pretrial attorney in our county, and I've competed at the state level. I also volunteer at a local hospital and work at Kumon, tutoring children in math and English.",
      "Through that work inside and outside the classroom I've built my confidence and teamwork, and connected with a lot of people across my community.",
      "As Chief Operating Officer my goal is to strengthen how the organization runs. I'll be looking after the daily activities at Crementum to make sure everything works properly, and I want to speak with everyone here to learn more about them and make sure our plans come together. I'm excited to meet everyone, whether you're already part of this program or planning to join. Feel free to ask me any questions.",
    ],
  },
  {
    name: "Palash Rakshit",
    role: "Chief Technology Officer",
    photo: "/team/palash-rakshit.jpg",
    focus: "88% 20%",
    bio: [
      "Hi everyone! My name is Palash Rakshit and I serve as Chief Technology Officer at Crementum Teaching. I build and look after the tools behind this organization, from the booking system to the site you are reading right now, so that asking for help is never the hard part.",
      "Over this past summer I built a machine learning system that predicts whether a patient needs an allergist referral, and presented it to faculty from MIT and Harvard, and to professionals from companies including Amgen and Johnson & Johnson, at MIT's campus. I also work on OncoVision AI, a full-stack web application that reads standard patient blood panels and flags multi-cancer risk, which I built as a research project with a pediatric oncologist at UCI Children's cancer hospital. I have also qualified for and competed at the NSDA National Tournament.",
      "I have scored multiple 5s on multiple AP exams, such as AP Biology, AP European History, and AP Precalculus. I also volunteer at a local hospital. If something on this site is broken, slow, or just annoying, tell me and I will fix it. I am always one email away.",
    ],
  },
  {
    name: "Alexander Volk",
    role: "Chief Marketing Officer",
    photo: "/team/alexander-volk.jpg",
    bio: [
      "Hello everyone! My name is Alexander Volk, and I am honored to serve as the Chief Marketing Officer at Crementum. My goal is to help more students discover what Crementum has to offer while building a stronger, more connected community.",
      "I am an upcoming senior with a passion for leadership, communication, and community involvement. I've earned scores of 5 on AP European History, AP U.S. History, AP Calculus BC, AP Precalculus, AP Computer Science A, and AP Language. Outside the classroom I've competed in Mock Trial at the state level, attended California Boys State, and worked as a lifeguard and swim instructor.",
      "Whether you're interested in starting a branch, growing an existing one, or simply learning more about Crementum, I would love to help. I'm always just an email away.",
    ],
  },
  { name: "", role: "Chief Technology Officer", photo: "", bio: [] },
  { name: "", role: "Chief Financial Officer", photo: "", bio: [] },
  { name: "", role: "Chief Revenue Officer", photo: "", bio: [] },
];

export const FAQ = [
  { q: "Where do I go to book a session?", a: "The Book a Session tab." },
] as const;

/* The logo links home, so it needs no nav slot. Start a Chapter lives on the
   Branches page. */
export const NAV = [
  { href: "/book", label: "Book a Session" },
  { href: "/subjects", label: "Subjects" },
  { href: "/branches", label: "Branches" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
