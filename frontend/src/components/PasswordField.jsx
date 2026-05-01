import { useState } from "react";

function EyeIcon({ crossed = false }) {
  return crossed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.61 6.61C4.24 8.24 2.44 10.39 1.5 12c1.77 3.02 5.98 7 10.5 7 1.42 0 2.78-.27 4.06-.77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 4.24A11.6 11.6 0 0 1 12 4c4.52 0 8.73 3.98 10.5 7-.7 1.19-1.66 2.48-2.8 3.67" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function PasswordField({
  value,
  onChange,
  placeholder,
  className,
  style,
  inputClassName,
  inputStyle,
  name,
  id,
  required,
  minLength,
  maxLength,
  pattern,
  title,
  autoComplete,
  disabled,
  onBlur,
  onFocus,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", ...(style || {}) }} className={className}>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
        style={{ paddingRight: "2.8rem", ...(inputStyle || {}) }}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
        autoComplete={autoComplete}
        disabled={disabled}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: "0.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          border: "none",
          background: "transparent",
          color: "#64748b",
          cursor: "pointer",
          padding: "0.25rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EyeIcon crossed={visible} />
      </button>
    </div>
  );
}
