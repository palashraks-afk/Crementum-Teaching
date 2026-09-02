"use client";

import { useActionState, useState } from "react";
import { removeBranch, saveBranch } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import type { DbBranch } from "@/server/db";
import styles from "./BranchAdmin.module.css";

const BLANK: DbBranch = {
  id: "",
  city: "",
  region: "",
  country: "USA",
  lat: 0,
  lng: 0,
  hq: false,
  school: null,
  lead: null,
  contactEmail: null,
  founded: null,
  about: null,
};

export function BranchAdmin({ branches }: { branches: DbBranch[] }) {
  const [state, formAction, pending] = useActionState(saveBranch, EMPTY_STATE);
  const [deleteState, deleteAction] = useActionState(removeBranch, EMPTY_STATE);
  const [editing, setEditing] = useState<DbBranch>(BLANK);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupNote, setLookupNote] = useState<string | null>(null);

  const isNew = editing.id === "";

  /** Fills lat/lng from the city + region so coordinates never have to be typed. */
  async function lookupCoords() {
    const q = [editing.city, editing.region, editing.country].filter(Boolean).join(", ");
    if (!q.trim() || lookupBusy) return;

    setLookupBusy(true);
    setLookupNote(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } },
      );
      const hits = (await res.json()) as { lat: string; lon: string }[];
      if (!hits.length) {
        setLookupNote(`No coordinates found for “${q}”.`);
        return;
      }
      setEditing((prev) => ({ ...prev, lat: Number(hits[0].lat), lng: Number(hits[0].lon) }));
      setLookupNote("Coordinates filled in.");
    } catch {
      setLookupNote("Lookup failed — enter coordinates by hand.");
    } finally {
      setLookupBusy(false);
    }
  }

  function field(key: keyof DbBranch) {
    return {
      value: (editing[key] ?? "") as string | number,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditing((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        <div className={styles.listHead}>
          <h2 className={styles.listTitle}>Branches · {branches.length}</h2>
          <button type="button" className="btn" onClick={() => setEditing(BLANK)}>
            New
          </button>
        </div>

        <ul className={styles.items}>
          {branches.map((branch) => (
            <li key={branch.id}>
              <button
                type="button"
                className={styles.item}
                data-active={editing.id === branch.id || undefined}
                onClick={() => setEditing(branch)}
              >
                <span className={styles.itemCity}>
                  {branch.city}
                  {branch.hq ? <span className={styles.hq}>HQ</span> : null}
                </span>
                <span className={styles.itemRegion}>{branch.region}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form action={formAction} className={styles.form}>
        <h2 className={styles.formTitle}>{isNew ? "Add a branch" : `Edit ${editing.city}`}</h2>

        {/* Blank on a new branch, so the server slugifies city + region. */}
        <input type="hidden" name="id" value={editing.id} />

        <div className={styles.row}>
          <label className={styles.field}>
            <span>City</span>
            <input name="city" required {...field("city")} />
            {state.errors.city ? <em>{state.errors.city}</em> : null}
          </label>
          <label className={styles.field}>
            <span>Region / State</span>
            <input name="region" required {...field("region")} />
            {state.errors.region ? <em>{state.errors.region}</em> : null}
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Country</span>
            <input name="country" {...field("country")} />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              name="hq"
              checked={editing.hq}
              onChange={(e) => setEditing((p) => ({ ...p, hq: e.target.checked }))}
            />
            <span>Headquarters</span>
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Latitude</span>
            <input name="lat" required {...field("lat")} />
            {state.errors.lat ? <em>{state.errors.lat}</em> : null}
          </label>
          <label className={styles.field}>
            <span>Longitude</span>
            <input name="lng" required {...field("lng")} />
            {state.errors.lng ? <em>{state.errors.lng}</em> : null}
          </label>
        </div>

        <div className={styles.lookupRow}>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={lookupCoords}
            disabled={lookupBusy}
          >
            {lookupBusy ? "Looking up…" : "Find coordinates from city"}
          </button>
          {lookupNote ? <span className={styles.lookupNote}>{lookupNote}</span> : null}
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>School</span>
            <input name="school" {...field("school")} />
          </label>
          <label className={styles.field}>
            <span>Branch lead</span>
            <input name="lead" {...field("lead")} />
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Contact email</span>
            <input name="contactEmail" type="email" {...field("contactEmail")} />
          </label>
          <label className={styles.field}>
            <span>Founded</span>
            <input name="founded" placeholder="2024" {...field("founded")} />
          </label>
        </div>

        <label className={styles.field}>
          <span>About</span>
          <textarea name="about" rows={3} {...field("about")} />
        </label>

        {state.message ? <p className={styles.error}>{state.message}</p> : null}
        {state.ok ? <p className={styles.ok}>Saved.</p> : null}
        {deleteState.ok ? <p className={styles.ok}>Deleted.</p> : null}

        <div className={styles.actions}>
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Saving…" : isNew ? "Add branch" : "Save changes"}
          </button>
          {!isNew ? (
            <button
              type="submit"
              formAction={deleteAction}
              className={styles.delete}
              onClick={() => setEditing(BLANK)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
