"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import type { DbBranch } from "@/server/db";
import styles from "./BranchMap.module.css";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className={styles.skeleton} />,
});

export type Focus = { lat: number; lng: number; zoom: number };

/** Great-circle distance in miles, good enough for "which branch is nearest". */
function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function BranchMap({ branches }: { branches: DbBranch[] }) {
  const [view, setView] = useState<"usa" | "world">("usa");
  const [focus, setFocus] = useState<Focus | null>(null);
  const [selected, setSelected] = useState<DbBranch | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<null | "search" | "locate">(null);
  const [note, setNote] = useState<string | null>(null);
  const [nearest, setNearest] = useState<{ branch: DbBranch; miles: number } | null>(null);

  const findNearest = useCallback(
    (lat: number, lng: number) => {
      if (branches.length === 0) return null;
      const ranked = branches
        .map((b) => ({ branch: b, miles: milesBetween(lat, lng, b.lat, b.lng) }))
        .sort((a, b) => a.miles - b.miles);
      return ranked[0];
    },
    [branches],
  );

  /** Free-form place lookup via OpenStreetMap's Nominatim, no API key needed. */
  async function search(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q || busy) return;

    setBusy("search");
    setNote(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const hits = (await res.json()) as { lat: string; lon: string; display_name: string }[];
      if (!hits.length) {
        setNote(`No place found for “${q}”.`);
        return;
      }
      const lat = Number(hits[0].lat);
      const lng = Number(hits[0].lon);
      setFocus({ lat, lng, zoom: 9 });
      const near = findNearest(lat, lng);
      setNearest(near);
      if (near) setNote(`Closest branch: ${near.branch.city}, ${Math.round(near.miles)} mi.`);
    } catch {
      setNote("Search is unavailable right now.");
    } finally {
      setBusy(null);
    }
  }

  /** Triggers the browser's own precise-location prompt. */
  function locate() {
    if (busy) return;
    if (!("geolocation" in navigator)) {
      setNote("This browser can't share a location.");
      return;
    }

    setBusy("locate");
    setNote(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setFocus({ lat, lng, zoom: 9 });
        const near = findNearest(lat, lng);
        setNearest(near);
        if (near) setNote(`Closest branch: ${near.branch.city}, ${Math.round(near.miles)} mi.`);
        setBusy(null);
      },
      (error) => {
        setNote(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Search for a city instead."
            : "Could not get your location.",
        );
        setBusy(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const detail = selected ?? nearest?.branch ?? null;
  const detailMiles = selected && nearest?.branch.id === selected.id ? nearest.miles : null;

  const rows = useMemo(
    () =>
      detail
        ? ([
            ["Region", [detail.region, detail.country].filter(Boolean).join(", ")],
            ["School", detail.school],
            ["Lead", detail.lead],
            ["Founded", detail.founded],
          ].filter(([, v]) => Boolean(v)) as [string, string][])
        : [],
    [detail],
  );

  return (
    <div className={styles.wrap}>
      <form className={styles.toolbar} onSubmit={search}>
        <div className={styles.searchField}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city or ZIP…"
            aria-label="Search for a location"
          />
          <button type="submit" className={styles.searchGo} disabled={busy !== null || !query.trim()}>
            {busy === "search" ? "…" : "Go"}
          </button>
        </div>

        <button type="button" className={styles.locate} onClick={locate} disabled={busy !== null}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="3" fill="currentColor" />
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 0v2M8 14v2M0 8h2M14 8h2" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {busy === "locate" ? "Locating…" : "Use my location"}
        </button>

        <div className={styles.views}>
          {(["usa", "world"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={styles.viewBtn}
              data-active={view === v && !focus ? true : undefined}
              onClick={() => {
                setView(v);
                setFocus(null);
              }}
            >
              {v === "usa" ? "USA" : "World"}
            </button>
          ))}
        </div>
      </form>

      {note ? <p className={styles.note}>{note}</p> : null}

      <LeafletMap
        branches={branches}
        view={view}
        focus={focus}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
      />

      {detail ? (
        <aside className={styles.detail}>
          <div className={styles.detailHead}>
            <div>
              <h3 className={styles.detailCity}>
                {detail.city}
                {detail.hq ? <span className={styles.hqTag}>HQ</span> : null}
              </h3>
              {detailMiles !== null ? (
                <p className={styles.detailNear}>{Math.round(detailMiles)} miles away</p>
              ) : null}
            </div>
            {selected ? (
              <button type="button" className={styles.close} onClick={() => setSelected(null)}>
                Close
              </button>
            ) : null}
          </div>

          <dl className={styles.detailRows}>
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {detail.about ? <p className={styles.detailAbout}>{detail.about}</p> : null}

          {detail.contactEmail ? (
            <a href={`mailto:${detail.contactEmail}`} className="link">
              {detail.contactEmail}
            </a>
          ) : null}
        </aside>
      ) : (
        <p className={styles.hint}>Click a pin to see a branch, or search a city to find the nearest.</p>
      )}
    </div>
  );
}
