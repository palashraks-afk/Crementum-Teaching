"use client";

import { useId } from "react";
import styles from "./Form.module.css";

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  defaultValue?: string;
};

function useFieldIds(name: string, error?: string) {
  const uid = useId();
  const id = `${name}-${uid}`;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = `${id}-hint`;
  return { id, errorId, hintId };
}

function Shell({
  id,
  label,
  optional,
  hint,
  hintId,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  hintId: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </label>
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  type = "text",
  placeholder,
  autoComplete,
  min,
  ...props
}: BaseProps & {
  type?: "text" | "email" | "date" | "datetime-local";
  placeholder?: string;
  autoComplete?: string;
  min?: string;
}) {
  const { id, errorId, hintId } = useFieldIds(props.name, props.error);
  return (
    <Shell id={id} hintId={hintId} errorId={errorId} {...props}>
      <input
        id={id}
        name={props.name}
        type={type}
        min={min}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={props.defaultValue}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={[props.hint ? hintId : null, errorId].filter(Boolean).join(" ") || undefined}
        className={`${styles.control} ${props.error ? styles.invalid : ""}`}
      />
    </Shell>
  );
}

export function TextArea({
  placeholder,
  ...props
}: BaseProps & { placeholder?: string }) {
  const { id, errorId, hintId } = useFieldIds(props.name, props.error);
  return (
    <Shell id={id} hintId={hintId} errorId={errorId} {...props}>
      <textarea
        id={id}
        name={props.name}
        placeholder={placeholder}
        defaultValue={props.defaultValue}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={[props.hint ? hintId : null, errorId].filter(Boolean).join(" ") || undefined}
        className={`${styles.control} ${props.error ? styles.invalid : ""}`}
      />
    </Shell>
  );
}

export function SelectField({
  options,
  placeholder,
  ...props
}: BaseProps & {
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const { id, errorId, hintId } = useFieldIds(props.name, props.error);
  return (
    <Shell id={id} hintId={hintId} errorId={errorId} {...props}>
      <select
        id={id}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={[props.hint ? hintId : null, errorId].filter(Boolean).join(" ") || undefined}
        className={`${styles.control} ${props.error ? styles.invalid : ""}`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

/** Off-screen input that only automated submitters will fill in. */
export function Honeypot() {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor="website">Leave this empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
