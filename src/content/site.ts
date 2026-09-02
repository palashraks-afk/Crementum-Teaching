import { COURSES } from "./catalog";

export const SITE = {
  name: "Crementum Teaching",
  shortName: "Crementum",
  tagline: "Free 1-on-1 tutoring.",
  email: "crementumteaching@gmail.com",
  instagram: "https://www.instagram.com/crementumtutoring/",
  instagramHandle: "@crementumtutoring",
  /* Branch count is deliberately not a public stat — the map on /branches is
     the honest answer, and it updates itself when a branch is added. */
  stats: {
    sessions: "1,500+",
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
 * Leadership slots. Names and portraits are intentionally blank — fill `name`
 * and drop a photo in /public/team/<file> when the team signs off on them.
 */
export const TEAM = [
  { role: "Chief Executive Officer", name: "", photo: "" },
  { role: "Chief Operating Officer", name: "", photo: "" },
  { role: "Chief Operating Officer", name: "", photo: "" },
  { role: "Chief Technology Officer", name: "", photo: "" },
  { role: "Chief Technology Officer", name: "", photo: "" },
  { role: "Chief Financial Officer", name: "", photo: "" },
  { role: "Chief Revenue Officer", name: "", photo: "" },
] as const;

export const FAQ = [
  { q: "Where do I go to book a session?", a: "The Dashboard." },
] as const;

/* The logo links home and the Book button links to the dashboard, so neither
   needs a nav slot. Start a Chapter lives on the Branches page. */
export const NAV = [
  { href: "/subjects", label: "Subjects" },
  { href: "/branches", label: "Branches" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
] as const;
