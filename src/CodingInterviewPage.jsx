import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { FiPlay, FiCheck, FiX, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CodingEditor, { STARTER_CODE } from "./CodingEditor";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";
const QUESTION_COUNT = 15;

export default function CodingInterviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "Frontend Developer";
  const difficulty = searchParams.get("difficulty") || "Beginner";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState(null);

  const [code, setCode] = useState(STARTER_CODE.javascript);
  const [language, setLanguage] = useState("javascript");
  const codeByIndexRef = useRef({});
  const runResultByIndexRef = useRef({});
  const languageByIndexRef = useRef({});

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpQuestionText, setFollowUpQuestionText] = useState(null);
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState("output");
  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const question = questions[currentIndex] ?? null;

  useEffect(() => {
    if (!searchParams.get("role")) navigate("/coding-interview/start", { replace: true });
  }, [searchParams, navigate]);

  // Auth check: redirect to login if not authorized
  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      setAuthChecking(true);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (cancelled) return;
        if (!res.ok && res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (!accessToken && !res.ok) {
          navigate("/login", { replace: true });
          return;
        }
        if (res.ok) setAuthorized(true);
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [navigate]);

  // Fetch 15 questions on load (only after authorized)
  useEffect(() => {
    if (!authorized || authChecking) return;
    let cancelled = false;
    async function fetchQuestions() {
      setLoadingQuestions(true);
      setQuestionError(null);
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/interview-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, difficulty, count: QUESTION_COUNT }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setQuestionError(json?.message || "Failed to load questions");
          return;
        }
        const data = json?.data ?? json;
        const list = data?.questions ?? [];
        setQuestions(Array.isArray(list) ? list : []);
        setCurrentIndex(0);
      } catch (e) {
        if (!cancelled) setQuestionError(e?.message || "Network error");
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    }
    fetchQuestions();
    return () => { cancelled = true; };
  }, [role, difficulty, authorized, authChecking]);

  // Persist code/language/runResult for current index when they change
  useEffect(() => {
    if (questions.length === 0) return;
    codeByIndexRef.current[currentIndex] = code;
    languageByIndexRef.current[currentIndex] = language;
  }, [code, language, currentIndex, questions.length]);

  useEffect(() => {
    if (questions.length === 0) return;
    runResultByIndexRef.current[currentIndex] = runResult;
  }, [runResult, currentIndex, questions.length]);

  // When switching question, load that question's code/result/language
  useEffect(() => {
    if (questions.length === 0) return;
    const lang = languageByIndexRef.current[currentIndex] ?? "javascript";
    const savedCode = codeByIndexRef.current[currentIndex];
    setLanguage(lang);
    setCode(savedCode ?? (STARTER_CODE[lang] || STARTER_CODE.javascript));
    setRunResult(runResultByIndexRef.current[currentIndex] ?? null);
    setAiReview(null);
    setFollowUpQuestionText(null);
    setFollowUpHistory([]);
  }, [currentIndex, questions]);

  // Tab visibility: save and quit when user switches tab
  const saveAndQuit = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    const attempts = questions.map((q, i) => ({
      question: q,
      code: codeByIndexRef.current[i] ?? "",
      language: languageByIndexRef.current[i] ?? "javascript",
      score: runResultByIndexRef.current[i]?.score ?? 0,
      passed: runResultByIndexRef.current[i]?.passed ?? 0,
      totalTests: runResultByIndexRef.current[i]?.total ?? 0,
    }));
    if (token && attempts.length > 0) {
      try {
        await fetch(`${API_BASE}/api/v1/user/coding-interview`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ attempts, status: "submitted" }),
        });
      } catch (_) {}
    }
    navigate("/coding-interview/start", { replace: true });
  }, [questions, navigate]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) saveAndQuit();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [saveAndQuit]);

  const handleRunCode = async () => {
    if (!question?.testCases?.length) return;
    setRunning(true);
    setRunResult(null);
    setActiveRightTab("output");
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/run-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases: question.testCases,
        }),
      });
      const json = await res.json();
      const data = json?.data ?? json;
      setRunResult(data);
    } catch (e) {
      setRunResult({ status: "error", message: e?.message || "Run failed" });
    } finally {
      setRunning(false);
    }
  };

  const handleGetReview = async () => {
    setReviewLoading(true);
    setAiReview(null);
    setActiveRightTab("feedback");
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/code-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemDescription: question?.description || "",
          userCode: code,
        }),
      });
      const json = await res.json();
      const data = json?.data ?? json;
      setAiReview(data);
    } catch (e) {
      setAiReview({ quality: "Error", suggestions: [e?.message || "Request failed"] });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleGetFollowUp = async () => {
    setFollowUpLoading(true);
    setFollowUpQuestionText(null);
    setActiveRightTab("feedback");
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: question?.title || "",
          userCode: code,
          previousQuestions: followUpHistory,
        }),
      });
      const json = await res.json();
      const data = json?.data ?? json;
      const q = data?.question || "No question generated.";
      setFollowUpQuestionText(q);
      setFollowUpHistory((prev) => [...prev, q]);
    } catch (e) {
      setFollowUpQuestionText("Could not load follow-up question.");
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleSaveSession = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setSaveMessage("Login to save your session.");
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    const attempts = questions.map((q, i) => ({
      question: q,
      code: codeByIndexRef.current[i] ?? "",
      language: languageByIndexRef.current[i] ?? "javascript",
      score: runResultByIndexRef.current[i]?.score ?? 0,
      passed: runResultByIndexRef.current[i]?.passed ?? 0,
      totalTests: runResultByIndexRef.current[i]?.total ?? 0,
    }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/coding-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attempts, status: "submitted" }),
      });
      const json = await res.json();
      if (res.ok) setSaveMessage("Session saved.");
      else setSaveMessage(json?.message || "Save failed.");
    } catch (e) {
      setSaveMessage(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const rightTabs = [
    { id: "output", label: "Output" },
    { id: "feedback", label: "AI Feedback" },
  ];

  if (authChecking || !authorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 text-center">
          <p className="text-white font-semibold">Checking authorization…</p>
          <p className="mt-1 text-sm text-slate-400">Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col fixed inset-0 w-full">
      <header className="shrink-0 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-4 py-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <Link
            to="/coding-interview/start"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Link>
          {questions.length > 0 && (
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-800/50 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="min-w-28 text-center text-sm font-semibold text-white">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300">
            {role}
          </span>
          <span className="rounded-full bg-slate-600/50 border border-slate-500/30 px-3 py-1 text-xs font-medium text-slate-300">
            {difficulty}
          </span>
          <span className="hidden sm:inline text-xs text-slate-500">Switch tab → auto-save & exit</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Question */}
        <div className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col min-h-0 bg-slate-900/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-slate-800/30">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Problem
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
            {loadingQuestions && (
              <div className="flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Loading {QUESTION_COUNT} questions…
              </div>
            )}
            {questionError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {questionError}
              </div>
            )}
            {question && !loadingQuestions && (
              <>
                <h3 className="text-base font-bold text-white leading-snug">{question.title}</h3>
                {(question.dataStructure || question.algorithm) && (
                  <div className="flex flex-wrap gap-2">
                    {question.dataStructure && (
                      <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-300">
                        {question.dataStructure}
                      </span>
                    )}
                    {question.algorithm && (
                      <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {question.algorithm}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{question.description}</p>
                {question.examples?.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examples</h4>
                    <ul className="space-y-2">
                      {question.examples.map((ex, i) => (
                        <li key={i} className="rounded-lg bg-slate-800/60 p-2.5 text-xs text-slate-300 font-mono border border-white/5">
                          <span className="text-slate-500 font-sans">Input:</span> {ex.input}
                          <br />
                          <span className="text-slate-500 font-sans">Output:</span> {ex.output}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.constraints?.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/40 p-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                      {question.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-900/30">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-800/40 shrink-0">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={running || !question?.testCases?.length}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <FiPlay className="w-4 h-4" />
              {running ? "Running…" : "Run Code"}
            </button>
            <button
              type="button"
              onClick={handleGetReview}
              disabled={reviewLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50 disabled:opacity-50 transition-all"
            >
              {reviewLoading ? "…" : "Get AI Review"}
            </button>
            <button
              type="button"
              onClick={handleGetFollowUp}
              disabled={followUpLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 disabled:opacity-50 transition-all"
            >
              {followUpLoading ? "…" : "Follow-up Q"}
            </button>
            <button
              type="button"
              onClick={handleSaveSession}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-slate-700/50 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-600/50 hover:text-white disabled:opacity-50 transition-all"
            >
              {saving ? "…" : "Save"}
            </button>
          </div>
          {saveMessage && (
            <p className={`px-4 py-2 text-xs border-b border-white/5 ${saveMessage.startsWith("Login") ? "text-amber-400 bg-amber-500/5" : "text-slate-400 bg-slate-800/30"}`}>
              {saveMessage}
            </p>
          )}
          <div className="flex-1 min-h-0 overflow-hidden p-2">
            <CodingEditor
              code={code}
              onCodeChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              height="100%"
            />
          </div>
        </div>

        {/* Right: Output / Feedback */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-0 bg-slate-900/50 overflow-hidden">
          <div className="flex border-b border-white/10 bg-slate-800/30">
            {rightTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRightTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeRightTab === tab.id
                    ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-sm">
            {activeRightTab === "output" && (
              <div className="space-y-4">
                {runResult == null && (
                  <p className="text-slate-500 text-center py-6">Run your code to see results.</p>
                )}
                {runResult?.status === "error" && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300">
                    {runResult.message}
                  </div>
                )}
                {runResult?.passed != null && (
                  <>
                    <div className="rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Score</span>
                      <span className="text-2xl font-bold text-white tabular-nums">
                        {runResult.score}<span className="text-slate-500 font-normal text-lg">/{runResult.maxScore ?? 10}</span>
                      </span>
                      <span className="text-slate-500 text-xs">
                        {runResult.passed}/{runResult.total} passed
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {runResult.results?.map((r, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                            r.passed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {r.passed ? <FiCheck className="w-5 h-5 shrink-0" /> : <FiX className="w-5 h-5 shrink-0" />}
                          <span className="font-medium">Test {i + 1}</span>
                          {!r.passed && (
                            <span className="text-xs truncate ml-auto opacity-90">
                              got: {String(r.actual)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {activeRightTab === "feedback" && (
              <div className="space-y-4">
                {aiReview && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/50 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Review</h4>
                    {aiReview.quality && (
                      <p className="text-slate-300">
                        <strong>Quality:</strong>{" "}
                        {typeof aiReview.quality === "object" && aiReview.quality !== null
                          ? JSON.stringify(aiReview.quality)
                          : String(aiReview.quality)}
                      </p>
                    )}
                    {aiReview.complexity && (
                      <p className="text-slate-300">
                        <strong>Complexity:</strong>{" "}
                        {typeof aiReview.complexity === "object" && aiReview.complexity !== null
                          ? [aiReview.complexity.time && `Time: ${aiReview.complexity.time}`, aiReview.complexity.space && `Space: ${aiReview.complexity.space}`]
                              .filter(Boolean)
                              .join(" · ") || JSON.stringify(aiReview.complexity)
                          : String(aiReview.complexity)}
                      </p>
                    )}
                    {aiReview.suggestions?.length > 0 && (
                      <ul className="list-disc list-inside text-amber-200/90 text-xs space-y-1">
                        {aiReview.suggestions.map((s, i) => (
                          <li key={i}>{typeof s === "object" && s !== null ? JSON.stringify(s) : String(s)}</li>
                        ))}
                      </ul>
                    )}
                    {aiReview.edgeCasesMissed?.length > 0 && (
                      <p className="text-slate-400 text-xs">
                        <strong>Edge cases missed:</strong>{" "}
                        {aiReview.edgeCasesMissed.map((e, i) => (typeof e === "object" && e !== null ? JSON.stringify(e) : String(e))).join(", ")}
                      </p>
                    )}
                  </div>
                )}
                {followUpQuestionText && (
                  <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Follow-up</h4>
                    <p className="text-white text-sm leading-relaxed">{followUpQuestionText}</p>
                  </div>
                )}
                {!aiReview && !followUpQuestionText && (
                  <p className="text-slate-500 text-center py-8">Get AI Review or Follow-up Q to see feedback here.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
