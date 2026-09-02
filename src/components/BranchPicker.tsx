"use client";

import { useActionState, useEffect, useState } from "react";
import { chooseBranch } from "@/server/actions";
import { EMPTY_STATE } from "@/server/schema";
import type { DbBranch } from "@/server/db";
import styles from "./BranchPicker.module.css";

type Props = {
  branches: DbBranch[];
  current: string | null;
};

export function BranchPicker({ branches, current }: Props) {
  const [state, formAction, pending] = useActionState(chooseBranch, EMPTY_STATE);
  const [selected, setSelected] = useState(current ?? "");
  const [editing, setEditing] = useState(!current);

  // `editing` is local state, so it does not fall back to false on its own when
  // the server action revalidates and sends a new `current` down.
  useEffect(() => {
    if (state.ok && current) setEditing(false);
  }, [state.ok, current]);

  const chosen = branches.find((b) => b.id === (current ?? ""));

  if (!editing && chosen) {
    return (
      <div className={styles.settled}>
        <div>
          <p className={styles.settledLabel}>Your branch</p>
          <p className={styles.settledName}>
            {chosen.city}, {chosen.region}
          </p>
        </div>
        <button type="button" className={styles.change} onClick={() => setEditing(true)}>
          Change
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <p className={styles.prompt}>Which branch is closest to you?</p>

      <div className={styles.grid}>
        {branches.map((branch) => (
          <label
            key={branch.id}
            className={styles.option}
            data-selected={selected === branch.id || undefined}
          >
            <input
              type="radio"
              name="branchId"
              value={branch.id}
              checked={selected === branch.id}
              onChange={() => setSelected(branch.id)}
              className="visually-hidden"
            />
            <span className={styles.city}>{branch.city}</span>
            <span className={styles.region}>{branch.region}</span>
          </label>
        ))}
      </div>

      {state.errors.branchId ? (
        <p className={styles.error}>{state.errors.branchId}</p>
      ) : null}
      {state.message ? <p className={styles.error}>{state.message}</p> : null}

      <div className={styles.actions}>
        <button type="submit" className="btn" disabled={pending || !selected}>
          {pending ? "Saving…" : "Save"}
        </button>
        {chosen ? (
          <button type="button" className={styles.change} onClick={() => setEditing(false)}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
