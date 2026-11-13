const glyphs = {
  today: <><rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.5 3.5v4M16.5 3.5v4M4 9.5h16M8 14h3m-3 3h7"/></>,
  discover: <><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.4 4.4M8.5 10.8h4.6m-2.3-2.3v4.6"/></>,
  applications: <><rect x="4" y="4.5" width="16" height="15" rx="2.5"/><path d="M8 8.5h8M8 12h8M8 15.5h5"/></>,
  planner: <><rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M7.5 3.5v4M16.5 3.5v4M4 9.5h16m-11 4.5 1.5 1.5 3-3"/></>,
  followups: <><path d="M20 8v5h-5M4 16v-5h5"/><path d="M6.1 8.5a6.8 6.8 0 0 1 11.5-1.3L20 10M4 14l2.3 2.8a6.8 6.8 0 0 0 11.5-1.3"/></>,
  interviews: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-2 2v-5.2A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></>,
  compare: <><path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/></>,
  questions: <><path d="M7.5 8.5c0-1.5 1-2.5 2.5-2.5 1.4 0 2.3.8 2.3 2.1 0 2-2.7 2-2.7 4.4m.1 3.3h.01"/><path d="M5 3.5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/></>,
  profile: <><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/></>,
  add: <><path d="M12 5v14M5 12h14"/></>,
  external: <><path d="M13 5h6v6M19 5l-9 9"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  check: <><path d="m5 12 4.2 4.2L19 6.5"/></>,
  chevron: <><path d="m9 18 6-6-6-6"/></>,
  left: <><path d="m15 18-6-6 6-6M9 12h10"/></>,
  right: <><path d="m9 18 6-6-6-6M5 12h10"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.4-.6a7.8 7.8 0 0 1-1.6.9l-.2 1.5h-2.4l-.2-1.5a7.8 7.8 0 0 1-1.7-.9l-1.3.6-1.2-2.1 1.2-.9a7.5 7.5 0 0 1 0-1.9l-1.2-.9 1.2-2.1 1.3.6a7.8 7.8 0 0 1 1.7-.9l.2-1.5h2.4l.2 1.5a7.8 7.8 0 0 1 1.6.9l1.4-.6 1.2 2.1-1.2.9a7.5 7.5 0 0 1-.1 1.8Z" transform="translate(-1 -1) scale(.97)"/></>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></>,
  spark: <><path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
  warning: <><path d="M10.3 4.8 2.9 17.6A1.7 1.7 0 0 0 4.4 20h15.2a1.7 1.7 0 0 0 1.5-2.4L13.7 4.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 3h.01"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  moon: <><path d="M20.3 15.3A8.5 8.5 0 0 1 8.7 3.7 8.5 8.5 0 1 0 20.3 15.3Z"/></>,
};

export default function Icon({ name, size = 22, className = "", ...props }) {
  return <svg className={`icon ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{glyphs[name] || glyphs.spark}</svg>;
}
