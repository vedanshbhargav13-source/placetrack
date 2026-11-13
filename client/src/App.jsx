import { useCallback, useEffect, useMemo, useState } from "react";
import { matchesOpportunitySearch } from "./search.js";
import Icon from "./Icon.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STATUSES = ["Saved", "Applied", "OA Scheduled", "Interview", "Selected", "Rejected"];
const navGroups = [
  { label: "Journey", items: [
    { id: "today", label: "Today", icon: "today" },
    { id: "discover", label: "Discover", icon: "discover" },
    { id: "applications", label: "Applications", icon: "applications" },
  ] },
  { label: "Plan & prepare", items: [
    { id: "planner", label: "Deadline planner", icon: "planner" },
    { id: "followups", label: "Follow-ups", icon: "followups" },
    { id: "interviews", label: "Rounds & debriefs", icon: "interviews" },
    { id: "questions", label: "Question bank", icon: "questions" },
  ] },
  { label: "Decide", items: [
    { id: "compare", label: "Compare", icon: "compare" },
  ] },
];
const viewLabels = { today: "Today", discover: "Discover opportunities", applications: "Applications", planner: "Deadline planner", followups: "Follow-ups", interviews: "Rounds & debriefs", questions: "Question bank", profile: "My profile", compare: "Compare opportunities" };
const PREVIEW_TIMESTAMP = Date.now();

function dateLabel(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "No date";
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? "No date" : date.toLocaleDateString(undefined, options);
}
function parseDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}
function localDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = number => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function initials(value = "P") { return value.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase(); }
function dueTone(value) {
  if (!value) return "muted";
  const due = parseDate(value);
  const today = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.round((dueDay - todayDay) / 86400000);
  return days < 0 ? "danger" : days <= 3 ? "soon" : "muted";
}

function App() {
  const previewParams = new URLSearchParams(window.location.search);
  const fontPreview = previewParams.get("design-preview") === "fonts";
  const previewDashboard = fontPreview && previewParams.get("screen") === "dashboard";
  const previewDate = offset => new Date(PREVIEW_TIMESTAMP + offset * 86400000).toISOString();
  const previewApplications = [
    { application_id: 101, company_name: "Northstar Labs", job_title: "Product Design Intern", status: "Interview", deadline: previewDate(3), location: "Bengaluru", source: "Company site", updated_at: previewDate(-1), created_at: previewDate(-18) },
    { application_id: 102, company_name: "Moss & Metric", job_title: "UX Research Intern", status: "OA Scheduled", deadline: previewDate(5), location: "Remote", source: "College portal", updated_at: previewDate(-2), created_at: previewDate(-12) },
    { application_id: 103, company_name: "Fieldnote", job_title: "Associate Product Intern", status: "Applied", deadline: previewDate(8), location: "Pune", source: "Referral", updated_at: previewDate(-3), created_at: previewDate(-8) },
    { application_id: 104, company_name: "Canopy Systems", job_title: "Frontend Engineering Intern", status: "Selected", deadline: null, location: "Hyderabad", source: "Company site", updated_at: previewDate(-1), created_at: previewDate(-22) },
  ];
  const [token, setToken] = useState(() => previewDashboard ? "design-preview" : localStorage.getItem("placetrack-token") || "");
  const [user, setUser] = useState(() => previewDashboard ? { name: "Maya Chen", email: "maya@example.test" } : JSON.parse(localStorage.getItem("placetrack-user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [view, setView] = useState("today");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("placetrack-sidebar-collapsed") === "true");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("placetrack-theme") === "dark");
  const [applicationLayout, setApplicationLayout] = useState("list");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => Boolean(!previewDashboard && localStorage.getItem("placetrack-token") && !localStorage.getItem("placetrack-onboarded")));
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [fontVariant, setFontVariant] = useState(() => new URLSearchParams(window.location.search).get("font") === "alt" ? "alt" : "primary");
  const [applications, setApplications] = useState(() => previewDashboard ? previewApplications : []);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: previewDashboard ? previewApplications.length : 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [planner, setPlanner] = useState(() => previewDashboard ? [
    { item_id: 201, application_id: 101, item_type: "round", title: "Product design conversation", company_name: "Northstar Labs", detail: "Recruiter", due_at: previewDate(1), state: "open" },
    { item_id: 202, application_id: 102, item_type: "deadline", title: "Submit product thinking assessment", company_name: "Moss & Metric", due_at: previewDate(2), state: "open" },
    { item_id: 203, application_id: 103, item_type: "action", title: "Send a short follow-up", company_name: "Fieldnote", detail: "Recruiter response", due_at: previewDate(3), state: "waiting" },
  ] : []);
  const [followUps, setFollowUps] = useState(() => previewDashboard ? [{ application_id: 103, company_name: "Fieldnote", job_title: "Associate Product Intern", days_waiting: 5, follow_up_due_at: previewDate(1) }] : []);
  const [questions, setQuestions] = useState(() => previewDashboard ? [{ id: 301, question: "Tell me about a time you simplified a complex workflow.", topic: "Product design", difficulty: "medium", notes: "Use the campus onboarding redesign as the example.", created_at: previewDate(-4) }] : []);
  const [stats, setStats] = useState(() => previewDashboard ? { activeApplications: 3, interviews: 1, offers: 1 } : {});
  const [profileForm, setProfileForm] = useState({ college: "", branch: "", graduation_year: "", cgpa: "", skills: [], github_url: "", linkedin_url: "" });
  const [preferences, setPreferences] = useState(null);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverJobs, setDiscoverJobs] = useState([]);
  const [discoverBusy, setDiscoverBusy] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [savedDiscoverIds, setSavedDiscoverIds] = useState(() => new Set());
  const [statusFilter, setStatusFilter] = useState("All stages");
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [actions, setActions] = useState([]);
  const [compare, setCompare] = useState(null);
  const [modal, setModal] = useState("");
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [appForm, setAppForm] = useState({ company: "", role: "", source: "college", location: "", work_type: "", apply_url: "", deadline: "", status: "Saved", context: "", note: "" });
  const [roundForm, setRoundForm] = useState({ round_type: "Online assessment", scheduled_at: "", status: "Pending", notes: "" });
  const [actionForm, setActionForm] = useState({ title: "", kind: "task", state: "open", due_at: "", deadline_offset_days: "", waiting_on: "", details: "" });
  const [questionForm, setQuestionForm] = useState({ question: "", topic: "", difficulty: "medium", notes: "" });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deadlineForm, setDeadlineForm] = useState("");
  const [questionQuery, setQuestionQuery] = useState("");
  const [priorityForm, setPriorityForm] = useState({ priority_weights: { skills: 30, role: 25, work_type: 15, location: 15, stipend: 10, deadline: 5 }, preferred_work_types: [], preferred_locations: [] });
  const [todayLabel] = useState(() => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));

  const request = useCallback(async (path, options = {}) => {
    if (previewDashboard) throw new Error("This sample workspace is read-only. Sign in to change your opportunities.");
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    if (response.status === 204) return null;
    const type = response.headers.get("content-type") || "";
    const body = type.includes("application/json") ? await response.json() : await response.text();
    if (response.status === 401 && token) {
      localStorage.removeItem("placetrack-token"); localStorage.removeItem("placetrack-user"); setToken(""); setUser(null);
    }
    if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
    return body;
  }, [previewDashboard, token]);

  const loadData = useCallback(async () => {
    if (!token || previewDashboard) return;
    setPageError("");
    try {
      const [apps, dash, plan, follow, qbank, pref, prof] = await Promise.all([
        request(`/applications?limit=50&page=${currentPage}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ""}${statusFilter !== "All stages" ? `&status=${encodeURIComponent(statusFilter)}` : ""}`), request("/dashboard/stats"), request("/dashboard/planner"),
        request("/dashboard/follow-ups"), request("/questions"), request("/profile/priorities"),
        request("/profile").catch(error => error.message.includes("Profile not found") ? null : Promise.reject(error)),
      ]);
      setApplications(apps.data || []); setStats(dash.data || {}); setPlanner(plan.data || []);
      setPageInfo(apps.pagination || { page: 1, totalPages: 1, total: apps.data?.length || 0 });
      setFollowUps(follow.data || []); setQuestions(qbank.data || []); setPreferences(pref.data);
      if (prof?.data) setProfileForm({ college: prof.data.college || "", branch: prof.data.branch || "", graduation_year: prof.data.graduation_year || "", cgpa: prof.data.cgpa || "", skills: prof.data.skills || [], github_url: prof.data.github_url || "", linkedin_url: prof.data.linkedin_url || "" });
    } catch (error) { setPageError(error.message); }
  }, [token, request, currentPage, searchTerm, statusFilter, previewDashboard]);

  useEffect(() => { const timer = setTimeout(() => { void loadData(); }, 0); return () => clearTimeout(timer); }, [loadData]);
  useEffect(() => { const timer = setTimeout(() => { setSearchTerm(query.trim()); setCurrentPage(1); }, 280); return () => clearTimeout(timer); }, [query]);
  useEffect(() => { if (!toast) return undefined; const id = setTimeout(() => setToast(""), 3400); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    const handleShortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("placetrack-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => {
    document.documentElement.dataset.font = fontVariant;
  }, [fontVariant]);
  useEffect(() => {
    localStorage.setItem("placetrack-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  async function submitAuth(event) {
    event.preventDefault(); setBusy(true); setPageError("");
    try {
      const result = await request(`/auth/${authMode === "signup" ? "signup" : "login"}`, { method: "POST", body: JSON.stringify(authForm) });
      const auth = result.data; localStorage.setItem("placetrack-token", auth.token); localStorage.setItem("placetrack-user", JSON.stringify(auth.user));
      setToken(auth.token); setUser(auth.user); setToast(authMode === "signup" ? "Your PlaceTrack space is ready." : "Welcome back.");
      if (!localStorage.getItem("placetrack-onboarded")) setShowWelcome(true);
    } catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }

  function logout() { localStorage.removeItem("placetrack-token"); localStorage.removeItem("placetrack-user"); setToken(""); setUser(null); setApplications([]); }
  async function saveOpportunity(event) {
    event.preventDefault(); setBusy(true);
    try {
      await request("/opportunities", { method: "POST", body: JSON.stringify({ company: appForm.company, role: appForm.role, source: appForm.source, location: appForm.location || null, work_type: appForm.work_type || null, apply_url: appForm.apply_url || null, deadline: appForm.deadline || null, status: appForm.status, context: appForm.context || null, note: appForm.note || null }) });
      setModal(""); setAppForm({ company: "", role: "", source: "college", location: "", work_type: "", apply_url: "", deadline: "", status: "Saved", context: "", note: "" });
      await loadData(); setToast("Opportunity added to your tracker.");
    } catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }

  async function searchDiscover(event, nextQuery = discoverQuery) {
    event?.preventDefault(); setDiscoverBusy(true); setDiscoverError(""); setPageError("");
    try {
      const result = await request(`/discovery/jobs?q=${encodeURIComponent(nextQuery.trim())}`);
      setDiscoverJobs(result.data || []);
    } catch (error) { setDiscoverError(error.message); }
    finally { setDiscoverBusy(false); }
  }

  async function saveDiscoveredOpportunity(item) {
    setBusy(true); setPageError("");
    try {
      await request("/opportunities", { method: "POST", body: JSON.stringify({
        company: item.company, role: item.title, source: "other", location: item.location,
        work_type: "remote", apply_url: item.url, status: "Saved",
        context: `Found on Remotive · ${item.category || "Remote listing"}. Check the original listing for eligibility and deadline.`,
        note: item.summary,
      }) });
      setSavedDiscoverIds(current => new Set(current).add(item.id));
      await loadData(); setToast("Listing added to your saved opportunities.");
    } catch (error) { setPageError(error.message); }
    finally { setBusy(false); }
  }

  async function openDetail(application) {
    setDetail(application); setCompare(null);
    setDeadlineForm(application.deadline ? String(application.deadline).slice(0, 10) : "");
    try {
      const [roundResult, actionResult] = await Promise.all([request(`/applications/${application.application_id}/interviews`), request(`/applications/${application.application_id}/actions`)]);
      setRounds(roundResult.data || []); setActions(actionResult.data || []);
    } catch (error) { setPageError(error.message); }
  }
  async function changeStatus(applicationId, status) {
    try { await request(`/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); const from = applications.find(app => app.application_id === applicationId)?.status; await loadData(); if (detail?.application_id === applicationId) setDetail(current => ({ ...current, status, timeline: [...(current.timeline || []), { event_type: "status_change", from_status: from, to_status: status, created_at: new Date().toISOString() }] })); setToast("Application stage updated."); }
    catch (error) { setPageError(error.message); }
  }
  async function changeDeadline(event) {
    event.preventDefault(); if (!detail) return; setBusy(true);
    try {
      await request(`/jobs/${detail.job_id}`, { method: "PUT", body: JSON.stringify({
        title: detail.job_title, company_id: Number(detail.company_id), jd_text: detail.jd_text || "",
        source: detail.source || "other", source_context: detail.source_context || null, apply_url: detail.apply_url || null,
        location: detail.location || "", work_type: detail.work_type || undefined,
        stipend: detail.stipend === null ? undefined : Number(detail.stipend), deadline: deadlineForm || null,
      }) });
      const previousDeadline = detail.deadline;
      setDetail(current => ({ ...current, deadline: deadlineForm || null, timeline: [...(current.timeline || []), { event_type: "deadline_changed", note: `Application deadline changed from ${previousDeadline || "not set"} to ${deadlineForm || "not set"}; linked action dates were recalculated.`, created_at: new Date().toISOString() }] })); await loadData(); setToast("Deadline updated. Relative action dates moved with it.");
    } catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }
  async function addRecoveryAction() {
    if (!detail) return;
    try {
      await request(`/applications/${detail.application_id}/actions`, { method: "POST", body: JSON.stringify({ title: "Check whether a late application or next opening is possible", kind: "recovery", state: "open" }) });
      await openDetail(detail); await loadData(); setToast("A recovery step was added to your planner.");
    } catch (error) { setPageError(error.message); }
  }
  async function deleteApplication(applicationId) {
    if (!window.confirm("Remove this application and its rounds and actions?")) return;
    try { await request(`/applications/${applicationId}`, { method: "DELETE" }); setDetail(null); await loadData(); setToast("Application removed."); }
    catch (error) { setPageError(error.message); }
  }
  async function saveRound(event) {
    event.preventDefault(); if (!detail) return; setBusy(true);
    try {
      await request(`/applications/${detail.application_id}/interviews`, { method: "POST", body: JSON.stringify({ ...roundForm, scheduled_at: roundForm.scheduled_at ? new Date(roundForm.scheduled_at).toISOString() : null }) });
      setRoundForm({ round_type: "Online assessment", scheduled_at: "", status: "Pending", notes: "" }); setModal(""); await openDetail(detail); await loadData(); setToast("Round added to the timeline.");
    } catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }
  async function saveDebrief(round, debrief, feedback) {
    try { await request(`/applications/${detail.application_id}/interviews/${round.id}`, { method: "PUT", body: JSON.stringify({ debrief, feedback }) }); await openDetail(detail); setToast("Round debrief saved."); }
    catch (error) { setPageError(error.message); }
  }
  async function saveAction(event) {
    event.preventDefault(); setBusy(true);
    try {
      const payload = { ...actionForm, due_at: actionForm.due_at ? new Date(`${actionForm.due_at}T09:00:00`).toISOString() : null, deadline_offset_days: actionForm.deadline_offset_days === "" ? null : Number(actionForm.deadline_offset_days) };
      await request(`/applications/${detail.application_id}/actions`, { method: "POST", body: JSON.stringify(payload) });
      setActionForm({ title: "", kind: "task", state: "open", due_at: "", deadline_offset_days: "", waiting_on: "", details: "" }); await openDetail(detail); await loadData(); setToast("Next step saved.");
    } catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }
  async function updateAction(action, patch) {
    try { await request(`/applications/${detail.application_id}/actions/${action.id}`, { method: "PATCH", body: JSON.stringify(patch) }); await openDetail(detail); await loadData(); }
    catch (error) { setPageError(error.message); }
  }
  async function scheduleFollowUp(application, dueAt, waitingOn) {
    try { await request(`/applications/${application.application_id}/follow-up`, { method: "PUT", body: JSON.stringify({ follow_up_due_at: dueAt ? new Date(dueAt).toISOString() : null, last_response_at: application.last_response_at || null, waiting_on: waitingOn || null }) }); await loadData(); setToast(dueAt ? "Follow-up reminder set." : "Follow-up cleared."); }
    catch (error) { setPageError(error.message); }
  }
  async function addQuestion(event) {
    event.preventDefault(); setBusy(true);
    try {
      const payload = { ...questionForm };
      if (detail && !editingQuestionId) payload.application_id = detail.application_id;
      await request(editingQuestionId ? `/questions/${editingQuestionId}` : "/questions", { method: editingQuestionId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setQuestionForm({ question: "", topic: "", difficulty: "medium", notes: "" }); setEditingQuestionId(null); setModal(""); await loadData(); setToast(editingQuestionId ? "Question updated." : "Question saved to your personal bank.");
    }
    catch (error) { setPageError(error.message); } finally { setBusy(false); }
  }
  async function startCompare() {
    if (selected.length < 2 || selected.length > 4) { setToast("Select two to four applications to compare."); return; }
    try { const result = await request(`/applications/compare?ids=${selected.join(",")}`); setCompare(result.data); setView("compare"); }
    catch (error) { setPageError(error.message); }
  }
  async function savePreferences(event) {
    event.preventDefault();
    try { const saved = await request("/profile/priorities", { method: "PUT", body: JSON.stringify(priorityForm) }); setPreferences(saved.data); setPriorityForm(saved.data); setModal(""); setToast("Comparison priorities saved."); }
    catch (error) { setPageError(error.message); }
  }
  async function saveProfile(event) {
    event.preventDefault();
    try {
      const payload = { ...profileForm, graduation_year: profileForm.graduation_year ? Number(profileForm.graduation_year) : null, cgpa: profileForm.cgpa === "" ? null : Number(profileForm.cgpa), skills: profileForm.skills };
      const saved = await request("/profile", { method: "PUT", body: JSON.stringify(payload) });
      setProfileForm({ ...saved.data, graduation_year: saved.data.graduation_year || "", cgpa: saved.data.cgpa || "", skills: saved.data.skills || [] }); setToast("Profile saved. Your comparisons can use your skills and study path.");
    } catch (error) { setPageError(error.message); }
  }
  async function exportCalendar() {
    try {
      if (previewDashboard) throw new Error("This sample workspace is read-only. Sign in to export your calendar.");
      const response = await fetch(`${API}/calendar.ics`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) { const error = await response.json(); throw new Error(error.message || "Calendar export failed"); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "placetrack-calendar.ics"; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500); setToast("Calendar file downloaded. Import the .ics file into your calendar.");
    } catch (error) { setPageError(error.message); }
  }

  const filtered = useMemo(() => applications.filter(app => {
    const text = `${app.company_name} ${app.job_title} ${app.location || ""}`;
    return matchesOpportunitySearch(text, searchTerm) && (statusFilter === "All stages" || app.status === statusFilter);
  }), [applications, searchTerm, statusFilter]);
  const urgentItems = planner.filter(item => item.due_at && dueTone(item.due_at) !== "muted").slice(0, 5);
  const openCount = planner.filter(item => item.state !== "done").length;
  const greetingName = user?.name?.split(" ")[0] || "there";
  const commandItems = [
    ...navGroups.flatMap(group => group.items.map(item => ({ label: item.label, detail: `Go to ${group.label.toLowerCase()}`, icon: item.icon, view: item.id }))),
    { label: "Save a new opportunity", detail: "Capture a role or link", icon: "add", action: "opportunity" },
    { label: "Export calendar", detail: "Download your PlaceTrack dates", icon: "planner", action: "calendar" },
    { label: "Edit comparison priorities", detail: "Choose what matters to you", icon: "compare", action: "priorities" },
  ];
  const visibleCommands = commandItems.filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(commandQuery.trim().toLowerCase()));
  function runCommand(item) {
    if (item.view) { setView(item.view); if (item.view === "applications") setStatusFilter("All stages"); }
    if (item.action === "opportunity") { setPageError(""); setModal("opportunity"); }
    if (item.action === "calendar") void exportCalendar();
    if (item.action === "priorities") { setPriorityForm(preferences); setModal("priorities"); }
    setCommandOpen(false); setCommandQuery("");
  }
  function finishWelcome() { localStorage.setItem("placetrack-onboarded", "true"); setShowWelcome(false); }

  if (!token) return <div className="auth-shell">
    <section className="auth-art">
      <div className="brand"><span className="brand-mark">P</span><span>placetrack</span></div>
      <div className="auth-story">
        <p className="auth-kicker">A steadier placement season</p>
        <h1>Keep the next step<br/>in sight.</h1>
        <p className="auth-lede">A link from a group chat. A date from a form. A round you want to remember. Keep the whole trail in one place.</p>
      </div>
      <div className="auth-flow" aria-label="Opportunity stages">
        {[{ label: "Saved", icon: "applications" }, { label: "Applied", icon: "check" }, { label: "Assessment", icon: "planner" }, { label: "Interview", icon: "interviews" }, { label: "Offer", icon: "spark" }].map((step, index) => <div className={`auth-flow-step ${index < 2 ? "complete" : ""}`} key={step.label}><span className="auth-flow-node"><Icon name={step.icon} size={20}/></span><b>{step.label}</b>{index < 4 && <span className="auth-flow-connector"/>}</div>)}
      </div>
      <div className="auth-note-panel"><Icon name="clock" size={20}/><p><b>Remember what happens next.</b><span>Deadlines, waiting-on reminders, and round notes stay attached to the opportunity.</span></p></div>
      <p className="auth-foot">Your applications stay private to your account.</p>
    </section>
    <main className="auth-panel">
      <div className="auth-mobile-brand"><span className="brand-mark">P</span><span>placetrack</span></div>
      <div className="auth-card">
        <p className="auth-kicker">{authMode === "login" ? "YOUR PLACE TRACKER" : "START WITH ONE OPPORTUNITY"}</p>
        <h2>{authMode === "login" ? "Welcome back." : "Make a little room to focus."}</h2>
        <p className="subtle">{authMode === "login" ? "Pick up where your placement journey paused." : "Save opportunities, remember your next move, and come back to it when you’re ready."}</p>
        <form onSubmit={submitAuth} className="stack-form">
          {authMode === "signup" && <label>Your name<input autoComplete="name" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} required maxLength={100} placeholder="e.g. Avery Patel"/></label>}
          <label>Email address<input type="email" autoComplete="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required placeholder="you@college.edu"/></label>
          <label>Password<input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required minLength={authMode === "login" ? 1 : 8} maxLength={72} placeholder={authMode === "login" ? "Enter your password" : "At least 8 characters"}/></label>
          {pageError && <div className="error-box" role="alert">{pageError}</div>}
          <button className="button button-primary button-wide" disabled={busy}>{busy ? "Checking your space…" : authMode === "login" ? "Sign in" : "Create account"}<Icon name="right" size={19}/></button>
        </form>
        <p className="auth-switch">{authMode === "login" ? "New to PlaceTrack?" : "Already have an account?"} <button onClick={() => { setPageError(""); setAuthMode(authMode === "login" ? "signup" : "login"); }}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p>
        <div className="auth-privacy"><Icon name="profile" size={18}/> Your opportunities and notes are private to your account.</div>
      </div>
      {fontPreview && <FontPreviewControl value={fontVariant} onChange={setFontVariant}/>}
    </main>
  </div>;

  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand-row"><button className="brand" onClick={() => setView("today")} aria-label="PlaceTrack home"><span className="brand-mark">P</span><span className="brand-name">placetrack</span></button><button className="sidebar-toggle" onClick={() => setSidebarCollapsed(value => !value)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}><Icon name="left" size={18}/></button></div>
      <div className="workspace-chip"><span className="workspace-mark">{initials(user?.name)}</span><span className="workspace-label">{user?.name ? `${user.name.split(" ")[0]}’s workspace` : "Personal workspace"}</span><Icon className="workspace-caret" name="chevron" size={15}/></div>
      <nav className="side-nav" aria-label="Main navigation">{navGroups.map(group => <div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map(item => <button key={item.id} className={`nav-link ${view === item.id ? "active" : ""}`} onClick={() => { setView(item.id); if (item.id !== "compare") setCompare(null); }} title={item.label} aria-current={view === item.id ? "page" : undefined}><Icon className="nav-icon" name={item.icon} size={22}/><span className="nav-label">{item.label}</span>{item.id === "planner" && openCount > 0 && <span className="nav-count">{openCount}</span>}{item.id === "followups" && followUps.length > 0 && <span className="nav-count">{followUps.length}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom">
        <button className={`nav-link ${view === "profile" ? "active" : ""}`} onClick={() => setView("profile")} title={sidebarCollapsed ? "My profile" : undefined} aria-current={view === "profile" ? "page" : undefined}><Icon className="nav-icon" name="profile" size={22}/><span className="nav-label">My profile</span></button>
        <button className="nav-link theme-toggle" onClick={() => setDarkMode(value => !value)} title={darkMode ? "Use light appearance" : "Use dark appearance"} aria-label={darkMode ? "Use light appearance" : "Use dark appearance"}><Icon className="nav-icon" name={darkMode ? "sun" : "moon"} size={22}/><span className="nav-label">{darkMode ? "Light appearance" : "Dark appearance"}</span></button>
        <button className="nav-link signout-link" onClick={logout} title="Sign out" aria-label="Sign out"><Icon className="nav-icon" name="external" size={22}/><span className="nav-label">Sign out</span></button>
        <div className="user-card"><div className="avatar">{initials(user?.name)}</div><div className="user-meta"><b>{user?.name || "Student"}</b><small>Personal workspace</small></div></div>
      </div>
    </aside>

    <main className="main-area" id="main-content" tabIndex={-1}>
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={15}/><strong>{viewLabels[view] || "PlaceTrack"}</strong></div><div className="top-actions"><label className="global-search"><Icon name="search" size={20}/><input aria-label="Search saved opportunities" placeholder="Search your saved opportunities" value={query} onChange={e => { setQuery(e.target.value); setCurrentPage(1); if (view === "today") setView("applications"); }}/><kbd>Ctrl K</kbd></label><button className="button button-primary top-add" onClick={() => { setPageError(""); setModal("opportunity"); }}><Icon name="add" size={19}/><span>Save opportunity</span></button></div></header>
      <div className="content-wrap">
        {previewDashboard && <div className="preview-banner"><Icon name="info" size={18}/><span><b>Font comparison preview</b> · Sample opportunities shown; changes are disabled.</span></div>}
        {pageError && <div className="page-error"><span>{pageError}</span><button onClick={() => setPageError("")}>×</button></div>}
        {view === "today" && <>
          <section className="welcome-row"><div><div className="date-kicker">{todayLabel}</div><h1>Good to see you, {greetingName}.</h1><p>Start with the next action that will move one opportunity along.</p></div><div className="welcome-actions"><button className="button button-soft" onClick={exportCalendar}><Icon name="planner" size={19}/> Add dates to calendar</button><button className="button button-primary" onClick={() => setModal("opportunity")}><Icon name="add" size={19}/> Save opportunity</button></div></section>
          <section className="panel journey-panel"><div className="journey-heading"><div><span className="section-kicker">YOUR APPLICATION PATH</span><h2>See where each opportunity stands</h2></div><button className="text-button" onClick={() => { setView("applications"); setApplicationLayout("board"); }}>Open pipeline <Icon name="right" size={17}/></button></div><div className="journey-ribbon">{[{ label: "Saved", status: "Saved" }, { label: "Applied", status: "Applied" }, { label: "Assessment", status: "OA Scheduled" }, { label: "Interview", status: "Interview" }, { label: "Offer", status: "Selected" }].map((stage, index) => { const count = applications.filter(app => app.status === stage.status).length; return <button className={`journey-stage stage-${stage.status.toLowerCase().replaceAll(" ", "-")}`} key={stage.status} onClick={() => { setStatusFilter(stage.status); setView("applications"); }} aria-label={`${stage.label}, ${count} opportunities`}><span className="journey-node">{count > 0 ? count : <span className="journey-node-index">{index + 1}</span>}</span><b>{stage.label}</b></button>; })}<span className="journey-connector" aria-hidden="true"/></div><div className="journey-foot"><span>{applications.length} opportunities tracked</span><span><span className="journey-legend-dot"/>{applications.filter(app => !["Selected", "Rejected"].includes(app.status)).length} in progress</span><button className="quiet-link" onClick={() => { setView("applications"); setApplicationLayout("board"); }}>View all stages <Icon name="right" size={16}/></button></div></section>
          <div className="dashboard-grid"><section className="panel attention-panel"><div className="panel-heading"><div><span className="section-kicker">NEXT UP</span><h2>What needs your attention?</h2><p>Dates and next steps, ordered by urgency.</p></div><button className="text-button" onClick={() => setView("planner")}>Open planner <Icon name="right" size={17}/></button></div>{urgentItems.length ? <div className="attention-list">{urgentItems.map((item, index) => <button className="attention-item" key={`${item.item_type}-${item.item_id || item.application_id}-${index}`} onClick={() => { const app = applications.find(a => a.application_id === item.application_id); if (app) openDetail(app); }}><span className={`attention-mark ${item.item_type}`}><Icon name={item.item_type === "deadline" ? "planner" : item.item_type === "round" ? "interviews" : "followups"} size={20}/></span><span className="attention-copy"><b>{item.title}</b><small>{item.company_name} · {item.item_type === "deadline" ? "Application deadline" : item.item_type === "round" ? "Upcoming round" : item.state === "waiting" ? `Waiting on ${item.detail || "someone"}` : "Next step"}</small></span><span className={`date-chip ${dueTone(item.due_at)}`}>{dateLabel(item.due_at)}</span></button>)}</div> : <EmptyInline title="You have room to focus" body="Add a deadline or a concrete next step and it will show up here when it needs attention."/>}<div className="attention-footer"><span className="pulse-dot"/> Only your own reminders. No noisy notifications.</div></section>
            <section className="panel snapshot-panel"><div className="panel-heading"><div><span className="section-kicker">AT A GLANCE</span><h2>Your placement season</h2></div></div><div className="overview-metrics"><div><b>{stats.activeApplications ?? applications.filter(a => !["Selected", "Rejected"].includes(a.status)).length}</b><span>active</span></div><div><b>{stats.interviews ?? 0}</b><span>upcoming rounds</span></div><div><b>{stats.offers ?? applications.filter(a => a.status === "Selected").length}</b><span>offers</span></div></div><div className="snapshot-divider"/><p className="snapshot-copy">Your details help PlaceTrack show which opportunities fit your priorities.</p><button className="quiet-link" onClick={() => setView("compare")}>Compare opportunities <Icon name="right" size={16}/></button></section></div>
          <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recent opportunities</h2></div><button className="text-button" onClick={() => setView("applications")}>All applications <span>→</span></button></div><ApplicationTable apps={applications.slice(0, 5)} selected={selected} setSelected={setSelected} onOpen={openDetail} onStatus={changeStatus}/></section>
          <div className="dashboard-bottom"><button className="soft-callout" onClick={() => setView("followups")}><span className="callout-icon"><Icon name="followups" size={22}/></span><span><b>Waiting to hear back?</b><small>Put a check-in date beside the opportunity.</small></span><Icon name="right" size={18}/></button><button className="question-count" onClick={() => setView("questions")}><span className="question-icon"><Icon name="questions" size={22}/></span><span><b>{questions.length} notes in your question bank</b><small>Useful questions and lessons from past rounds.</small></span><Icon name="right" size={18}/></button></div>
        </>}

        {view === "discover" && <>
          <section className="page-title-row"><div><div className="eyebrow">FIND THE NEXT POSSIBILITY</div><h1>Discover opportunities</h1><p>Search current remote listings, then save the ones worth following up.</p></div><span className="source-stamp">LIVE LISTINGS · REMOTIVE</span></section>
          <section className="discover-intro"><div><span className="discover-kicker">A wider starting point</span><h2>What are you looking for?</h2><p>Try “design internship”, “data analyst” or a skill such as “Python”.</p></div><form className="discover-search" onSubmit={searchDiscover}><Icon name="search" size={21}/><input aria-label="Search public opportunities" value={discoverQuery} onChange={event => setDiscoverQuery(event.target.value)} placeholder="Role, skill, company, or internship" maxLength={120}/><button className="button button-primary" disabled={discoverBusy}>{discoverBusy ? "Searching…" : "Search"}</button></form><div className="discover-shortcuts"><button onClick={() => { setDiscoverQuery("internship"); searchDiscover(null, "internship"); }}>Internships</button><button onClick={() => { setDiscoverQuery("design"); searchDiscover(null, "design"); }}>Design</button><button onClick={() => { setDiscoverQuery("software"); searchDiscover(null, "software"); }}>Software</button><a href={`https://www.google.com/search?q=${encodeURIComponent(`${discoverQuery || "internships"} opportunities`)}`} target="_blank" rel="noreferrer">Search wider on Google ↗</a></div></section>
          <div className="discover-results-heading"><div><span className="eyebrow">PUBLIC REMOTE LISTINGS</span><h2>{discoverJobs.length ? `${discoverJobs.length} matches` : "Start with a search"}</h2></div>{discoverJobs.length > 0 && <span className="results-note">Sorted by source recency</span>}</div>
          {discoverError && <div className="page-error"><span>{discoverError}</span><button onClick={() => setDiscoverError("")}>×</button></div>}
          {discoverBusy ? <div className="discover-loading">Looking through public listings…</div> : discoverJobs.length ? <div className="discover-grid">{discoverJobs.map(item => { const alreadySaved = savedDiscoverIds.has(item.id) || applications.some(app => app.apply_url === item.url); return <article className="discover-card" key={item.id}><div className="discover-card-meta"><span>{item.category || "Opportunity"}</span><span>{item.published_at ? `Posted ${dateLabel(item.published_at, { month: "short", day: "numeric" })}` : "Remotive listing"}</span></div><h3>{item.title}</h3><div className="discover-company">{item.company}<span>·</span>{item.location}</div><div className="discover-chips"><span>{item.job_type?.replaceAll("_", " ") || "Remote"}</span>{item.salary && <span>{item.salary}</span>}<span>via Remotive</span></div>{item.summary && <p>{item.summary}</p>}<div className="discover-card-foot"><a href={item.url} target="_blank" rel="noreferrer">View original ↗</a><button className={`button ${alreadySaved ? "button-saved" : "button-primary"}`} disabled={alreadySaved || busy} onClick={() => saveDiscoveredOpportunity(item)}>{alreadySaved ? "Saved ✓" : "＋ Save to PlaceTrack"}</button></div></article>; })}</div> : !discoverError && <div className="discover-empty"><span className="empty-orbit">↗</span><h3>{discoverQuery ? `No public matches for “${discoverQuery}”` : "Search beyond your saved list"}</h3><p>{discoverQuery ? "Try another role or skill, or search the wider web. Listings here come from a remote-only source and may not cover every internship or placement." : "Public listings appear here. Save a result to create a tracked opportunity, then add your own deadline and next step."}</p>{discoverQuery ? <a className="button button-primary" href={`https://www.google.com/search?q=${encodeURIComponent(`${discoverQuery} internship OR placement opportunities`)}`} target="_blank" rel="noreferrer">Search these terms on Google ↗</a> : <button className="button button-soft" onClick={() => searchDiscover()}>Show recent listings</button>}</div>}
          <p className="discover-disclaimer">Listings come from Remotive and may be delayed by up to 24 hours. Confirm location, eligibility, deadlines, and application details on the original posting. <a href="https://remotive.com" target="_blank" rel="noreferrer">About Remotive ↗</a></p>
        </>}

        {view === "applications" && <>
          <section className="page-title-row"><div><p className="section-kicker">YOUR OPPORTUNITIES</p><h1>Applications <span className="muted-count">{pageInfo.total}</span></h1><p>Move each opportunity forward, one clear step at a time.</p></div><button className="button button-soft" onClick={exportCalendar}><Icon name="planner" size={19}/> Add dates to calendar</button></section>
          <div className="application-controls"><div className="stage-tabs" role="group" aria-label="Filter applications by stage">{["All stages", ...STATUSES].map(status => <button key={status} className={statusFilter === status ? "selected" : ""} onClick={() => { setStatusFilter(status); setCurrentPage(1); }}>{status}{status === "All stages" && <small>{pageInfo.total}</small>}</button>)}</div><div className="application-tools">{selected.length > 0 && <button className="button button-primary compare-button" onClick={startCompare}>Compare {selected.length}<Icon name="right" size={17}/></button>}<div className="view-toggle" role="group" aria-label="Application view"><button className={applicationLayout === "list" ? "selected" : ""} aria-pressed={applicationLayout === "list"} onClick={() => setApplicationLayout("list")}><Icon name="applications" size={18}/>List</button><button className={applicationLayout === "board" ? "selected" : ""} aria-pressed={applicationLayout === "board"} onClick={() => setApplicationLayout("board")}><Icon name="planner" size={18}/>Pipeline</button></div><span className="sort-label">Sorted by recent</span></div></div>
          {applicationLayout === "board" ? <PipelineBoard applications={filtered} onOpen={openDetail} onStatus={changeStatus}/> : <section className="panel applications-panel"><ApplicationTable apps={filtered} selected={selected} setSelected={setSelected} onOpen={openDetail} onStatus={changeStatus} empty="Nothing in this view yet. Try another stage or save an opportunity."/></section>}
          {pageInfo.totalPages > 1 && <div className="pagination-bar"><span>Page {pageInfo.page} of {pageInfo.totalPages} · {pageInfo.total} opportunities</span><div><button className="button button-soft" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}><Icon name="left" size={17}/>Previous</button><button className="button button-soft" disabled={currentPage >= pageInfo.totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next<Icon name="right" size={17}/></button></div></div>}
        </>}

        {view === "planner" && <><section className="page-title-row"><div><div className="eyebrow">A LITTLE STRUCTURE, A LOT LESS TO REMEMBER</div><h1>Your planner</h1><p>Deadlines, follow-ups, rounds, and small steps in one view.</p></div><button className="button button-primary" onClick={exportCalendar}>↗ Add to calendar</button></section><div className="planner-columns"><section className="panel planner-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR TIMELINE</span><h2>Upcoming & overdue</h2></div><span className="soft-count">{planner.length} items</span></div>{planner.length ? <div className="planner-list">{planner.map((item, index) => { const app = applications.find(a => a.application_id === item.application_id); return <button key={`${item.item_type}-${item.item_id || item.application_id}-${index}`} className="planner-item" onClick={() => app && openDetail(app)}><span className={`planner-icon ${item.item_type}`}><Icon name={item.item_type === "deadline" ? "planner" : item.item_type === "round" ? "interviews" : "followups"} size={20}/></span><span className="planner-info"><b>{item.title}</b><small>{item.company_name} · {item.item_type === "action" && item.state === "waiting" ? `Waiting on ${item.detail || "a response"}` : item.item_type}</small></span><span className={`date-chip ${dueTone(item.due_at)}`}>{dateLabel(item.due_at, { month: "short", day: "numeric", year: "numeric" })}</span></button>; })}</div> : <EmptyInline title="Your planner is clear" body="Add a round, reminder, or deadline to see it here."/>}</section><section className="panel follow-panel"><div className="panel-heading"><div><span className="eyebrow">NO RESPONSE YET</span><h2>Follow-up planner</h2></div><span className="follow-count">{followUps.length}</span></div><p className="panel-intro">Keep a kind reminder for opportunities still waiting on someone else.</p>{followUps.length ? <div className="follow-list">{followUps.map(item => <FollowUpRow key={item.application_id} item={item} onOpen={() => openDetail(applications.find(a => a.application_id === item.application_id))} onSchedule={() => openDetail(applications.find(a => a.application_id === item.application_id))}/>)}</div> : <EmptyInline title="No follow-ups to track" body="Choose an application and set a date to check back."/>}</section></div><div className="planner-tip"><span>↗</span><p><b>Deadline ripple planner</b> keeps relative action dates connected to an application deadline. When the deadline moves, linked actions move with it, and the timeline records the change.</p></div></>}

        {view === "followups" && <>
          <section className="page-title-row"><div><p className="section-kicker">CLOSE THE LOOP</p><h1>Follow-ups</h1><p>Keep track of who you’re waiting on and when you want to check back.</p></div><span className="soft-count">{followUps.length} reminders</span></section>
          <section className="panel followups-page"><div className="panel-heading"><div><h2>No response yet</h2><p>These dates are personal reminders. PlaceTrack never sends a message for you.</p></div></div>{followUps.length ? <div className="follow-list">{followUps.map(item => { const app = applications.find(a => a.application_id === item.application_id); return <FollowUpRow key={item.application_id} item={item} onOpen={() => app && openDetail(app)}/>; })}</div> : <EmptyInline title="Nothing waiting on a reply" body="Open an application and add a check-in date when you want to follow up."/>}</section>
        </>}
        {view === "interviews" && <>
          <section className="page-title-row"><div><p className="section-kicker">PREPARE, REFLECT, REPEAT</p><h1>Rounds & debriefs</h1><p>Keep assessment and interview dates with the opportunity they belong to.</p></div><button className="button button-soft" onClick={() => setView("questions")}><Icon name="questions" size={18}/>Open question bank</button></section>
          <section className="panel interview-timeline"><div className="panel-heading"><div><h2>Upcoming rounds</h2><p>Open an opportunity to add a round or write a debrief.</p></div><span className="soft-count">{planner.filter(item => item.item_type === "round").length} scheduled</span></div>{planner.filter(item => item.item_type === "round").length ? <div className="round-list">{planner.filter(item => item.item_type === "round").map((item, index) => { const app = applications.find(a => a.application_id === item.application_id); return <button className="round-list-item" key={item.item_id || `${item.application_id}-${index}`} onClick={() => app && openDetail(app)}><span className="round-date"><b>{dateLabel(item.due_at, { month: "short" })}</b><strong>{parseDate(item.due_at).getDate()}</strong></span><span className="round-list-copy"><b>{item.title}</b><small>{item.company_name} · {item.detail || "Assessment or interview"}</small></span><span className="round-list-state">{app?.status || "Round"}<Icon name="right" size={17}/></span></button>; })}</div> : <EmptyInline title="No rounds on the calendar yet" body="Add an assessment or interview date from an application to see it here."/>}</section>
          <section className="prep-applications"><div className="section-heading"><div><h2>Applications in progress</h2><p>Pick one to review its rounds, notes, and next steps.</p></div></div><div className="prep-application-list">{applications.filter(app => ["OA Scheduled", "Interview"].includes(app.status)).map(app => <button className="prep-application" key={app.application_id} onClick={() => openDetail(app)}><span className={`stage-marker ${app.status === "OA Scheduled" ? "stage-oa" : "stage-interview"}`}/><span><b>{app.job_title}</b><small>{app.company_name}</small></span><span className={`stage-pill ${app.status === "OA Scheduled" ? "stage-oa" : "stage-interview"}`}>{app.status}</span><Icon name="right" size={18}/></button>)}</div>{!applications.some(app => ["OA Scheduled", "Interview"].includes(app.status)) && <EmptyInline title="Your interview journey will appear here" body="When an opportunity reaches an assessment or interview, its prep details will be one click away."/>}</section>
        </>}
        {view === "questions" && <><section className="page-title-row"><div><div className="eyebrow">LEARN ONCE, REMEMBER IT NEXT TIME</div><h1>Your question bank</h1><p>Keep useful questions and round debriefs for the next conversation.</p></div><button className="button button-primary" onClick={() => { setDetail(null); setEditingQuestionId(null); setQuestionForm({ question: "", topic: "", difficulty: "medium", notes: "" }); setModal("question"); }}>＋ Save a question</button></section><div className="question-toolbar"><label className="question-search"><Icon name="search" size={20}/><input value={questionQuery} onChange={e => setQuestionQuery(e.target.value)} placeholder="Search questions, topics, companies"/></label><span className="soft-count">{questions.length} saved</span></div><div className="question-grid">{questions.filter(q => `${q.question} ${q.topic || ""} ${q.company_name || ""}`.toLowerCase().includes(questionQuery.toLowerCase())).map(q => <article className="question-card" key={q.id}><div className="question-card-top"><span className="question-icon"><Icon name="questions" size={21}/></span><span className={`difficulty ${q.difficulty || "medium"}`}>{q.difficulty || "question"}</span></div><h3>{q.question}</h3><div className="question-tags">{q.topic && <span>{q.topic}</span>}{q.company_name && <span>{q.company_name}</span>}</div>{q.notes && <p className="question-note">{q.notes}</p>}<div className="question-card-foot">Saved {dateLabel(q.created_at)}<div><button onClick={() => { setEditingQuestionId(q.id); setQuestionForm({ question: q.question, topic: q.topic || "", difficulty: q.difficulty || "medium", notes: q.notes || "" }); setDetail(null); setModal("question"); }}>Edit</button><button onClick={async () => { try { await request(`/questions/${q.id}`, { method: "DELETE" }); await loadData(); } catch (error) { setPageError(error.message); } }}>Remove</button></div></div></article>)}{questions.length === 0 && <div className="empty-panel"><span><Icon name="questions" size={22}/></span><h3>Keep a question for future you</h3><p>Save a practice question or a useful prompt after an interview round.</p><button className="button button-soft" onClick={() => setModal("question")}>Save a question</button></div>}</div></>}

        {view === "profile" && <><section className="page-title-row"><div><div className="eyebrow">REUSABLE DETAILS, READY WHEN YOU NEED THEM</div><h1>Your profile</h1><p>A private prep pocket for personal priorities and comparison context.</p></div><span className="soft-count">Private to your account</span></section><section className="panel profile-panel"><div className="profile-panel-intro"><div className="avatar large">{initials(user?.name)}</div><div><h2>{user?.name}</h2><p>{user?.email}</p></div></div><form className="modal-form" onSubmit={saveProfile}><div className="form-grid"><label>College<input maxLength={150} value={profileForm.college} onChange={e => setProfileForm({ ...profileForm, college: e.target.value })} placeholder="Your college"/></label><label>Branch / study area<input maxLength={100} value={profileForm.branch} onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })} placeholder="e.g. Computer science"/></label><label>Graduation year<input type="number" min="2020" max="2100" value={profileForm.graduation_year} onChange={e => setProfileForm({ ...profileForm, graduation_year: e.target.value })} placeholder="2027"/></label><label>CGPA (optional)<input type="number" min="0" max="10" step="0.01" value={profileForm.cgpa} onChange={e => setProfileForm({ ...profileForm, cgpa: e.target.value })} placeholder="8.4"/></label></div><label>Skills, separated by commas<input value={profileForm.skills.join(", ")} onChange={e => setProfileForm({ ...profileForm, skills: e.target.value.split(",").map(skill => skill.trim()).filter(Boolean) })} placeholder="React, SQL, Figma"/></label><div className="form-grid"><label>GitHub profile<input type="url" value={profileForm.github_url} onChange={e => setProfileForm({ ...profileForm, github_url: e.target.value })} placeholder="https://github.com/you"/></label><label>LinkedIn profile<input type="url" value={profileForm.linkedin_url} onChange={e => setProfileForm({ ...profileForm, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/you"/></label></div><div className="profile-note"><span><Icon name="spark" size={19}/></span><p>Your skill list helps opportunity comparisons show which role details overlap with your experience. It does not predict hiring outcomes.</p></div><div className="modal-actions"><button className="button button-primary">Save profile →</button></div></form></section></>}

        {view === "compare" && <><section className="page-title-row"><div><div className="eyebrow">MAKE THE TRADE-OFFS CLEAR</div><h1>Opportunity comparison</h1><p>Personal fit scores use the priorities you chose. They’re a guide, not a prediction.</p></div><button className="button button-soft" onClick={() => setModal("priorities")}><Icon name="settings" size={19}/> Edit priorities</button></section><div className="comparison-grid">{compare?.map((item, index) => <article className={`comparison-card ${index === 0 ? "best-fit" : ""}`} key={item.application_id}><div className="comparison-top"><div className="company-avatar">{initials(item.company_name)}</div><span className="fit-score">{item.priority_score}<small>fit</small></span></div><h2>{item.job_title}</h2><p>{item.company_name}</p><span className="status-pill">{item.status}</span><div className="compare-facts"><Fact label="Deadline" value={dateLabel(item.deadline, { month: "short", day: "numeric", year: "numeric" })}/><Fact label="Work style" value={item.work_type || "Not listed"}/><Fact label="Location" value={item.location || "Not listed"}/><Fact label="Stipend" value={item.stipend ? `₹${Number(item.stipend).toLocaleString()}` : "Not listed"}/><Fact label="Skills match" value={item.matched_skills?.length ? item.matched_skills.join(", ") : "Add profile skills"}/></div><div className="score-breakdown">{Object.entries(item.score_breakdown).map(([key, value]) => value !== null && <div key={key}><span>{key.replace("_", " ")}</span><div><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }}/></div></div>)}</div><button className="text-button" onClick={() => { setView("applications"); const app = applications.find(a => a.application_id === item.application_id); if (app) openDetail(app); }}>View details →</button></article>)}{!compare?.length && <div className="empty-panel"><h3>Choose opportunities to compare</h3><p>Go to Applications and select two to four opportunities.</p><button className="button button-soft" onClick={() => setView("applications")}>Back to applications</button></div>}</div></>}
      </div>
    </main>

    {commandOpen && <CommandPalette items={visibleCommands} query={commandQuery} setQuery={setCommandQuery} onSelect={runCommand} onClose={() => { setCommandOpen(false); setCommandQuery(""); }}/ >}
    {showWelcome && <OnboardingStep step={welcomeStep} onNext={() => welcomeStep < 2 ? setWelcomeStep(step => step + 1) : finishWelcome()} onClose={finishWelcome}/>}
    {fontPreview && <FontPreviewControl value={fontVariant} onChange={setFontVariant} floating/>}

    {detail && <div className="drawer-backdrop" onMouseDown={e => e.target === e.currentTarget && setDetail(null)}><aside className="detail-drawer"><div className="drawer-top"><button className="icon-button" onClick={() => setDetail(null)} aria-label="Back to applications"><Icon name="left" size={20}/></button><span>APPLICATION DETAILS</span><button className="icon-button close-drawer" onClick={() => setDetail(null)} aria-label="Close details"><Icon name="close" size={19}/></button></div><div className="drawer-company"><div className="company-avatar large">{initials(detail.company_name)}</div><div><h2>{detail.job_title}</h2><p>{detail.company_name}{detail.location ? ` · ${detail.location}` : ""}</p></div></div><div className="drawer-meta"><label>Current stage<select value={detail.status} onChange={e => changeStatus(detail.application_id, e.target.value)}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select></label><form className="deadline-edit" onSubmit={changeDeadline}><label>Application deadline<input type="date" value={deadlineForm} onChange={e => setDeadlineForm(e.target.value)}/></label><button disabled={busy || deadlineForm === String(detail.deadline || "").slice(0, 10)}>Update date</button></form></div>{detail.apply_url && <a className="apply-link" href={detail.apply_url} target="_blank" rel="noreferrer">Open application link <Icon name="external" size={17}/></a>}{detail.source_context && <div className="source-note"><span>↳</span><p><b>Source context</b>{detail.source_context}</p></div>}<label className="notes-label">Context for future you<textarea defaultValue={detail.notes || ""} placeholder="Where did you find it? What should you remember?" onBlur={async e => { if (e.target.value !== (detail.notes || "")) { try { await request(`/applications/${detail.application_id}`, { method: "PUT", body: JSON.stringify({ notes: e.target.value }) }); setDetail({ ...detail, notes: e.target.value }); } catch (error) { setPageError(error.message); } } }}/></label>
      <section className="drawer-section activity-section"><div className="drawer-section-head"><div><span className="eyebrow">APPLICATION HISTORY</span><h3>Activity</h3></div></div>{detail.timeline?.length ? [...detail.timeline].reverse().slice(0, 8).map(event => <div className="timeline-item" key={event.id || `${event.event_type}-${event.created_at}`}><span className={`timeline-dot ${event.event_type === "deadline_changed" ? "deadline" : "status"}`}/><div><b>{event.event_type === "deadline_changed" ? "Deadline changed" : event.event_type === "created" ? "Opportunity captured" : `${event.from_status || "Stage"} → ${event.to_status || "updated"}`}</b>{event.note && <p>{event.note}</p>}<small>{dateLabel(event.created_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</small></div></div>) : <EmptyInline title="No activity yet" body="Stage changes and deadline updates will appear here."/>}</section>

      <section className="drawer-section"><div className="drawer-section-head"><div><span className="eyebrow">ROUND BY ROUND</span><h3>Rounds & debriefs</h3></div><button className="text-button" onClick={() => setModal("round")}>＋ Add</button></div>{rounds.map(round => <RoundCard key={round.id} round={round} onSave={saveDebrief}/>)}</section>
      <section className="drawer-section"><div className="drawer-section-head"><div><span className="eyebrow">WHAT HAPPENS NEXT</span><h3>Next steps</h3></div></div>{actions.map(action => <div key={action.id} className={`action-row ${action.state}`}><button className="check-action" aria-label="Mark complete" onClick={() => updateAction(action, { state: action.state === "done" ? "open" : "done" })}>{action.state === "done" ? "✓" : ""}</button><div><b>{action.title}</b><small>{action.state === "waiting" ? `Waiting on ${action.waiting_on || "someone"}` : action.state === "blocked" ? `Blocked · ${action.waiting_on || "needs attention"}` : action.due_at ? dateLabel(action.due_at) : "No due date"}</small></div><span className={`action-state ${action.state}`}>{action.state}</span></div>)}{detail.deadline && dueTone(detail.deadline) === "danger" && !["Selected", "Rejected"].includes(detail.status) && <button className="recovery-prompt" onClick={addRecoveryAction}><span>↗</span><span><b>Missed this deadline?</b><small>Choose a small recovery step</small></span></button>}<form className="compact-form" onSubmit={saveAction}><input required maxLength={180} placeholder="Add a concrete next step" value={actionForm.title} onChange={e => setActionForm({ ...actionForm, title: e.target.value })}/><div className="compact-form-row"><select value={actionForm.kind} onChange={e => setActionForm({ ...actionForm, kind: e.target.value })}><option value="task">Task</option><option value="follow_up">Follow-up</option><option value="prep">Preparation</option><option value="form_resume">Resume a form</option><option value="recovery">Recovery</option></select><select value={actionForm.state} onChange={e => setActionForm({ ...actionForm, state: e.target.value })}><option value="open">Open</option><option value="waiting">Waiting</option><option value="blocked">Blocked</option></select><button className="mini-submit" disabled={busy}>＋</button></div><input type="date" value={actionForm.due_at} onChange={e => setActionForm({ ...actionForm, due_at: e.target.value })}/><input placeholder="Waiting on (optional)" value={actionForm.waiting_on} onChange={e => setActionForm({ ...actionForm, waiting_on: e.target.value })}/><label className="relative-check"><input type="number" min="-365" max="365" placeholder="Days from deadline" value={actionForm.deadline_offset_days} onChange={e => setActionForm({ ...actionForm, deadline_offset_days: e.target.value })}/>Tie action to deadline (days before/after)</label></form></section>
      <section className="drawer-section"><div className="drawer-section-head"><div><span className="eyebrow">NO RESPONSE YET</span><h3>Follow-up reminder</h3></div></div><p className="small-copy">Keep the next check-in on your planner. PlaceTrack won’t send messages for you.</p><FollowUpEditor application={detail} onSave={scheduleFollowUp}/></section>
      <section className="drawer-section"><div className="drawer-section-head"><div><span className="eyebrow">TAKE A NOTE FOR NEXT TIME</span><h3>Question bank</h3></div><button className="text-button" onClick={() => { setEditingQuestionId(null); setModal("question"); }}>＋ Save question</button></div>{rounds.filter(r => r.debrief || r.feedback).map(round => <div className="debrief-snippet" key={round.id}><b>{round.round_type}</b><p>{round.debrief || round.feedback}</p></div>)}</section>
      <button className="delete-link" onClick={() => deleteApplication(detail.application_id)}>Remove application</button></aside></div>}

    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal("")}><section className="modal-card"><div className="modal-heading"><div><span className="eyebrow">{modal === "opportunity" ? "CAPTURE WHILE IT’S FRESH" : modal === "round" ? "KEEP THE JOURNEY TOGETHER" : modal === "question" ? "REMEMBER WHAT YOU LEARN" : "MAKE THE TRADE-OFFS YOURS"}</span><h2>{modal === "opportunity" ? "New opportunity" : modal === "round" ? "Add a round" : modal === "question" ? (editingQuestionId ? "Edit question" : "Save a question") : "Your comparison priorities"}</h2></div><button className="icon-button" onClick={() => setModal("")}>×</button></div>
      {modal === "opportunity" && <form className="modal-form" onSubmit={saveOpportunity}><div className="form-grid"><label>Company<input required maxLength={100} value={appForm.company} onChange={e => setAppForm({ ...appForm, company: e.target.value })} placeholder="Company name"/></label><label>Role or opportunity<input required maxLength={150} value={appForm.role} onChange={e => setAppForm({ ...appForm, role: e.target.value })} placeholder="e.g. Product design intern"/></label><label>Where did you find it?<select value={appForm.source} onChange={e => setAppForm({ ...appForm, source: e.target.value })}><option value="college">College / TPO</option><option value="linkedin">LinkedIn</option><option value="gmail">Email</option><option value="company_site">Company site</option><option value="referral">Referral</option><option value="other">Other</option></select></label><label>Current stage<select value={appForm.status} onChange={e => setAppForm({ ...appForm, status: e.target.value })}>{STATUSES.filter(s => s !== "Rejected" && s !== "Selected").map(status => <option key={status}>{status}</option>)}</select></label><label>Application link<input type="url" value={appForm.apply_url} onChange={e => setAppForm({ ...appForm, apply_url: e.target.value })} placeholder="Paste a link when you have it"/></label><label>Application deadline<input type="date" value={appForm.deadline} onChange={e => setAppForm({ ...appForm, deadline: e.target.value })}/></label><label>Location<input value={appForm.location} onChange={e => setAppForm({ ...appForm, location: e.target.value })} placeholder="City or remote"/></label><label>Work style<select value={appForm.work_type} onChange={e => setAppForm({ ...appForm, work_type: e.target.value })}><option value="">Not sure yet</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label></div><label>Context for future you<textarea value={appForm.context} onChange={e => setAppForm({ ...appForm, context: e.target.value })} placeholder="Where did this come from? What should you remember?"/></label><label>Private application note<textarea value={appForm.note} onChange={e => setAppForm({ ...appForm, note: e.target.value })} placeholder="Anything to pick up when you return"/></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal("")}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : appForm.status === "Saved" ? "Save opportunity" : "Add application"}<span>→</span></button></div></form>}
      {modal === "round" && <form className="modal-form" onSubmit={saveRound}><label>Round name<input required maxLength={50} value={roundForm.round_type} onChange={e => setRoundForm({ ...roundForm, round_type: e.target.value })} placeholder="e.g. Technical interview"/></label><div className="form-grid"><label>Date and time<input type="datetime-local" value={roundForm.scheduled_at} onChange={e => setRoundForm({ ...roundForm, scheduled_at: e.target.value })}/></label><label>Round status<select value={roundForm.status} onChange={e => setRoundForm({ ...roundForm, status: e.target.value })}><option>Pending</option><option>Scheduled</option><option>Completed</option><option>Cancelled</option></select></label></div><label>What to remember<textarea value={roundForm.notes} onChange={e => setRoundForm({ ...roundForm, notes: e.target.value })} placeholder="Meeting link, what to prepare, or context"/></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal("")}>Cancel</button><button className="button button-primary" disabled={busy}>Add round →</button></div></form>}
      {modal === "question" && <form className="modal-form" onSubmit={addQuestion}><label>Question<textarea required minLength={3} maxLength={4000} value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} placeholder="What did they ask? What would you practice again?"/></label><div className="form-grid"><label>Topic<input value={questionForm.topic} maxLength={100} onChange={e => setQuestionForm({ ...questionForm, topic: e.target.value })} placeholder="e.g. Product sense"/></label><label>Difficulty<select value={questionForm.difficulty} onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div><label>Notes<textarea maxLength={3000} value={questionForm.notes} onChange={e => setQuestionForm({ ...questionForm, notes: e.target.value })} placeholder="Your approach, a useful hint, or what to revise"/></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal("")}>Cancel</button><button className="button button-primary" disabled={busy}>{editingQuestionId ? "Save changes" : "Save to question bank"} →</button></div></form>}
      {modal === "priorities" && priorityForm && <form className="modal-form" onSubmit={savePreferences}><p className="subtle">Give each factor a weight. PlaceTrack scores only from the opportunity details and preferences you have saved.</p>{Object.entries(priorityForm.priority_weights).map(([key, value]) => <label className="priority-row" key={key}><span>{key.replace("_", " ")}</span><input type="range" min="0" max="50" value={value} onChange={e => setPriorityForm({ ...priorityForm, priority_weights: { ...priorityForm.priority_weights, [key]: Number(e.target.value) } })}/><b>{value}</b></label>)}<label>Preferred work styles<div className="choice-row">{["remote", "hybrid", "onsite"].map(item => <label className="check-choice" key={item}><input type="checkbox" checked={priorityForm.preferred_work_types.includes(item)} onChange={e => setPriorityForm({ ...priorityForm, preferred_work_types: e.target.checked ? [...priorityForm.preferred_work_types, item] : priorityForm.preferred_work_types.filter(value => value !== item) })}/>{item}</label>)}</div></label><label>Preferred locations<input value={priorityForm.preferred_locations.join(", ")} onChange={e => setPriorityForm({ ...priorityForm, preferred_locations: e.target.value.split(",").map(value => value.trim()).filter(Boolean) })} placeholder="Bengaluru, Remote, Mumbai"/></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={() => setModal("")}>Cancel</button><button className="button button-primary">Save priorities →</button></div></form>}
    </section></div>}
    {toast && <div className="toast" role="status" aria-live="polite"><span aria-hidden="true">✓</span>{toast}</div>}
  </div>;
}

function PipelineBoard({ applications, onOpen, onStatus }) {
  const columns = STATUSES.map(status => ({ status, label: status === "Selected" ? "Offer" : status === "OA Scheduled" ? "Assessment" : status }));
  function moveCard(event, status) {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData("text/plain"));
    const application = applications.find(item => Number(item.application_id) === id);
    if (application && application.status !== status) onStatus(application.application_id, status);
  }
  return <div className="pipeline-board" aria-label="Application pipeline">
    {columns.map(column => { const entries = applications.filter(item => item.status === column.status); return <section className={`pipeline-column pipeline-${column.status.toLowerCase().replaceAll(" ", "-")}`} key={column.status} onDragOver={event => event.preventDefault()} onDrop={event => moveCard(event, column.status)}><header className="pipeline-column-head"><span className="pipeline-stage-dot"/><h2>{column.label}</h2><span className="pipeline-count">{entries.length}</span></header>{entries.length ? <div className="pipeline-cards">{entries.map(item => <article className="pipeline-card" key={item.application_id} draggable onDragStart={event => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(item.application_id)); }}><button className="pipeline-card-open" onClick={() => onOpen(item)}><span className="company-avatar">{initials(item.company_name)}</span><span className="pipeline-card-title"><b>{item.job_title}</b><small>{item.company_name}</small></span><span className={`date-chip ${dueTone(item.deadline)}`}>{dateLabel(item.deadline)}</span></button><label className="pipeline-move">Move to<select aria-label={`Move ${item.job_title} to another stage`} value={item.status} onChange={event => onStatus(item.application_id, event.target.value)}>{STATUSES.map(status => <option key={status} value={status}>{status === "Selected" ? "Offer" : status}</option>)}</select></label></article>)}</div> : <div className="pipeline-empty">Drop an opportunity here</div>}</section>; })}
  </div>;
}
function CommandPalette({ items, query, setQuery, onSelect, onClose }) {
  const [active, setActive] = useState(0);
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));
  return <div className="command-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Quick navigation"><div className="command-search"><Icon name="search" size={21}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); setActive(index => Math.min(index + 1, items.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive(index => Math.max(index - 1, 0)); } if (event.key === "Enter" && items[activeIndex]) { event.preventDefault(); onSelect(items[activeIndex]); } }} placeholder="Jump to a page or action…"/><kbd>ESC</kbd></div><div className="command-results" role="listbox">{items.length ? items.map((item, index) => <button className={`command-option ${index === activeIndex ? "active" : ""}`} key={`${item.label}-${index}`} role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActive(index)} onClick={() => onSelect(item)}><span className="command-icon"><Icon name={item.icon} size={20}/></span><span><b>{item.label}</b><small>{item.detail}</small></span><Icon name="right" size={17}/></button>) : <div className="command-empty">No matching pages or actions.</div>}</div><div className="command-foot"><span>Navigate PlaceTrack</span><span><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open</span></div></section></div>;
}
function OnboardingStep({ step, onNext, onClose }) {
  const slides = [
    { icon: "applications", title: "Catch the opportunity first.", body: "Save a link or a short note now. Add the role, source, and deadline when you have them." },
    { icon: "planner", title: "Choose one next step.", body: "Add a task, assessment date, or follow-up. PlaceTrack keeps it beside the opportunity." },
    { icon: "interviews", title: "Keep what you learn.", body: "Track each round, write a debrief, and save useful questions for the next conversation." },
  ];
  const content = slides[step];
  return <div className="onboarding-backdrop"><section className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><button className="onboarding-close" onClick={onClose} aria-label="Close introduction"><Icon name="close" size={20}/></button><div className="onboarding-mark"><Icon name={content.icon} size={25}/></div><div className="onboarding-progress">{slides.map((item, index) => <span key={item.title} className={index === step ? "active" : index < step ? "done" : ""}/>)}</div><p className="section-kicker">A QUICK TOUR · {step + 1} OF {slides.length}</p><h2 id="onboarding-title">{content.title}</h2><p>{content.body}</p><div className="onboarding-actions"><button className="quiet-link" onClick={onClose}>Skip tour</button><button className="button button-primary" onClick={onNext}>{step === slides.length - 1 ? "Open my workspace" : "Next"}<Icon name="right" size={18}/></button></div></section></div>;
}
function FontPreviewControl({ value, onChange, floating = false }) {
  return <div className={`font-preview-control ${floating ? "floating" : ""}`}><span>Font preview</span><button type="button" className={value === "primary" ? "selected" : ""} aria-pressed={value === "primary"} onClick={() => onChange("primary")}>Sora + Atkinson</button><button type="button" className={value === "alt" ? "selected" : ""} aria-pressed={value === "alt"} onClick={() => onChange("alt")}>Instrument + Geist</button></div>;
}
function ApplicationTable({ apps, selected, setSelected, onOpen, onStatus, empty = "Your saved opportunities will appear here." }) {
  if (!apps.length) return <div className="empty-table"><span><Icon name="applications" size={22}/></span><b>Nothing here just yet</b><p>{empty}</p></div>;
  return <div className="table-scroll"><table><thead><tr><th className="check-col"></th><th>OPPORTUNITY</th><th>STAGE</th><th>DEADLINE</th><th>LAST UPDATED</th><th></th></tr></thead><tbody>{apps.map(app => <tr key={app.application_id} onClick={() => onOpen(app)}><td className="check-col" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.includes(app.application_id)} onChange={e => setSelected(e.target.checked ? [...selected, app.application_id].slice(-4) : selected.filter(id => id !== app.application_id))}/></td><td><div className="opportunity-cell"><div className="company-avatar">{initials(app.company_name)}</div><div><b>{app.job_title}</b><small>{app.company_name}{app.location ? ` · ${app.location}` : ""}</small></div></div></td><td onClick={e => e.stopPropagation()}><select className={`table-status ${app.status.toLowerCase().replaceAll(" ", "-")}`} value={app.status} onChange={e => onStatus(app.application_id, e.target.value)}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select></td><td><span className={`table-date ${dueTone(app.deadline)}`}>{dateLabel(app.deadline)}</span></td><td className="updated-date">{dateLabel(app.updated_at)}</td><td><button className="row-arrow" aria-label="Open opportunity">↗</button></td></tr>)}</tbody></table></div>;
}
function EmptyInline({ title, body }) { return <div className="empty-inline"><span><Icon name="spark" size={19}/></span><div><b>{title}</b><p>{body}</p></div></div>; }
function FollowUpRow({ item, onOpen }) { return <button className="follow-row" onClick={onOpen}><span className="follow-avatar">{initials(item.company_name)}</span><span className="follow-copy"><b>{item.company_name}</b><small>{item.job_title} · {item.days_waiting} days since last response</small></span><span className={`date-chip ${dueTone(item.follow_up_due_at)}`}>{item.follow_up_due_at ? dateLabel(item.follow_up_due_at) : "Set date"}</span></button>; }
function FollowUpEditor({ application, onSave }) { const [date, setDate] = useState(localDateTimeInput(application.follow_up_due_at)); const [waiting, setWaiting] = useState(application.waiting_on || ""); return <div className="follow-editor"><label>Check back on<input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}/></label><label>Waiting for<input value={waiting} onChange={e => setWaiting(e.target.value)} placeholder="e.g. recruiter response"/></label><button className="button button-soft button-wide" onClick={() => onSave(application, date, waiting)}>{date ? "Save reminder" : "Clear reminder"} <span>→</span></button></div>; }
function RoundCard({ round, onSave }) { const [editing, setEditing] = useState(false); const [debrief, setDebrief] = useState(round.debrief || ""); const [feedback, setFeedback] = useState(round.feedback || ""); return <article className="round-card"><div className="round-card-head"><span className="round-icon"><Icon name="interviews" size={19}/></span><div><b>{round.round_type}</b><small>{round.scheduled_at ? dateLabel(round.scheduled_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Date not set"} · {round.status}</small></div><button className="more-button" onClick={() => setEditing(!editing)}>{editing ? "Done" : "Edit"}</button></div>{round.notes && <p>{round.notes}</p>}{editing ? <div className="debrief-edit"><label>What happened?<textarea value={debrief} onChange={e => setDebrief(e.target.value)} placeholder="What went well? What would you change?"/></label><label>Feedback / follow-up<textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Any feedback or result to remember"/></label><button className="button button-soft" onClick={() => { onSave(round, debrief, feedback); setEditing(false); }}>Save debrief</button></div> : (debrief || feedback) && <div className="round-debrief"><b>Debrief</b><p>{debrief || feedback}</p></div>}</article>; }
function Fact({ label, value }) { return <div><small>{label}</small><b>{value}</b></div>; }

export default App;
