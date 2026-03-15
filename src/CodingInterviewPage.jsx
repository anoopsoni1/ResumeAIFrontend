import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiPlay, FiCheck, FiX, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CodingEditor, { STARTER_CODE } from "./CodingEditor";

import { API_BASE } from "./config.js";
import { useToast } from "./context/ToastContext";

const QUESTION_COUNT = 15;

export default function CodingInterviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
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
  const [showInfoPage, setShowInfoPage] = useState(true);
  const [showEndSummary, setShowEndSummary] = useState(false);
  const hasShownTabWarningRef = useRef(false);

  // Resizable panel widths (px). Question | Code | Output
  const [questionWidth, setQuestionWidth] = useState(400);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);
  const [resizing, setResizing] = useState(null); // "left" | "right" | null
  const containerRef = useRef(null);
  const QUESTION_MIN = 280;
  const QUESTION_MAX = 560;
  const RIGHT_MIN = 280;
  const RIGHT_MAX = 500;
  const [isLg, setIsLg] = useState(typeof window !== "undefined" && window.innerWidth >= 1024);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onMatch = (e) => setIsLg(e.matches);
    mql.addEventListener("change", onMatch);
    return () => mql.removeEventListener("change", onMatch);
  }, []);

  const handleEnterFullscreen = useCallback(async () => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    } catch (e) {
      // ignore fullscreen errors; continue interview
    }
  }, []);

  const handleStartInterview = useCallback(async () => {
    await handleEnterFullscreen();
    setShowInfoPage(false);
  }, [handleEnterFullscreen]);

  const question = questions[currentIndex] ?? null;

  useEffect(() => {
    if (!searchParams.get("role")) navigate("/coding-interview/start", { replace: true });
  }, [searchParams, navigate]);

  // Fetch 15 questions only after user clicks Start on info page (triggered by showInfoPage -> false)
  useEffect(() => {
    if (showInfoPage) return;
    let cancelled = false;
    async function fetchQuestions() {
      setLoadingQuestions(true);
      setQuestionError(null);
      try {
        const res = await fetch(`${API_BASE}/interview-questions`, {
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
  }, [role, difficulty, showInfoPage]);

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

  // Resize panels: drag left or right handle
  useEffect(() => {
    if (!resizing) return;
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const total = rect.width;
      if (resizing === "left") {
        const w = Math.max(QUESTION_MIN, Math.min(QUESTION_MAX, x));
        setQuestionWidth(w);
      } else {
        const w = Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, rect.right - e.clientX));
        setRightPanelWidth(w);
      }
    };
    const onUp = () => setResizing(null);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing]);

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
        const res = await fetch(`${API_BASE}/coding-interview`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ attempts, status: "submitted" }),
        });
        if (res.status === 429) {
          const json = await res.json().catch(() => ({}));
          toast.error(json?.message || json?.error || "Daily coding interview limit reached (5/day). Try again tomorrow.");
        }
      } catch (_) {}
    }
    navigate("/coding-interview/start", { replace: true });
  }, [questions, navigate, toast]);

  // Warn once when user leaves tab, then next time auto save+quit. Always warn on unload.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Leaving will save your progress and exit the interview.";
    };
    const onVisibilityChange = () => {
      if (document.hidden && questions.length > 0) {
        if (!hasShownTabWarningRef.current) {
          hasShownTabWarningRef.current = true;
          window.alert(
            "Warning: If you leave this tab again, your progress will be saved and you will automatically exit the interview."
          );
          return;
        }
        saveAndQuit();
      }
    };
    document.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [saveAndQuit, questions.length]);

  const handleRunCode = async () => {
    if (!question?.testCases?.length) return;
    setRunning(true);
    setRunResult(null);
    setActiveRightTab("output");
    try {
      const res = await fetch(`${API_BASE}/run-code`, {
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
      const res = await fetch(`${API_BASE}/code-review`, {
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
      const res = await fetch(`${API_BASE}/follow-up`, {
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
      const res = await fetch(`${API_BASE}/coding-interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ attempts, status: "submitted" }),
      });
      const json = await res.json();
      if (res.ok) setSaveMessage("Session saved.");
      else {
        const msg = json?.message || json?.error || "Save failed.";
        setSaveMessage(msg);
        if (res.status === 429) toast.error(msg);
      }
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

  // End-of-interview summary: attempted, correct, wrong (from run results)
  const getSummaryStats = useCallback(() => {
    let attempted = 0;
    let correct = 0;
    const perQuestion = [];
    for (let i = 0; i < questions.length; i++) {
      const r = runResultByIndexRef.current[i];
      const total = r?.total ?? 0;
      const passed = r?.passed ?? 0;
      if (total > 0) {
        attempted++;
        if (passed === total) correct++;
        perQuestion.push({ index: i + 1, title: questions[i]?.title, passed, total, status: passed === total ? "correct" : "wrong" });
      } else {
        perQuestion.push({ index: i + 1, title: questions[i]?.title, passed: 0, total: 0, status: "not-attempted" });
      }
    }
    const wrong = attempted - correct;
    const notAttempted = questions.length - attempted;
    return { attempted, correct, wrong, notAttempted, total: questions.length, perQuestion };
  }, [questions]);

  // Information / details page before interview starts
  if (showInfoPage) {
    return (
      <div className="h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col fixed inset-0 w-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2">Coding Interview</h2>
            <p className="text-slate-400 text-sm mb-6">
              {role} · {difficulty}
            </p>
            <ul className="space-y-3 text-sm text-slate-300 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-white">{QUESTION_COUNT} questions</strong> — solve each in the code editor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-white">Full screen</strong> — interview runs in full screen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-white">Do not switch tab</strong> — leaving this tab will show a warning, then your progress will be saved and you will exit the interview.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Use <strong className="text-white">Run Code</strong> to test against cases; <strong className="text-white">Save</strong> to store your session (when logged in).</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={handleStartInterview}
              className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <FiPlay className="w-5 h-5" />
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col fixed inset-0 w-full">
      {/* Full-screen blur loader while questions are loading */}
      {loadingQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-amber-500/30 border-t-amber-400 animate-spin" />
            <p className="text-white font-semibold">Loading {QUESTION_COUNT} questions…</p>
            <p className="text-slate-400 text-sm">Please wait.</p>
          </div>
        </div>
      )}

      {/* End of interview summary */}
      {showEndSummary && questions.length > 0 && (() => {
        const stats = getSummaryStats();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
            <div className="max-w-lg w-full rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-sm p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Interview Summary</h2>
              <p className="text-slate-400 text-sm mb-6">
                Here’s how you did in this session.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3 text-center">
                  <div className="text-2xl font-bold text-white tabular-nums">{stats.total}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Total</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3 text-center">
                  <div className="text-2xl font-bold text-white tabular-nums">{stats.attempted}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Attempted</div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-300 tabular-nums">{stats.correct}</div>
                  <div className="text-xs text-emerald-400/80 uppercase tracking-wider">Correct</div>
                </div>
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                  <div className="text-2xl font-bold text-rose-300 tabular-nums">{stats.wrong}</div>
                  <div className="text-xs text-rose-400/80 uppercase tracking-wider">Wrong</div>
                </div>
              </div>
              {stats.notAttempted > 0 && (
                <p className="text-slate-500 text-sm mb-4">
                  {stats.notAttempted} question{stats.notAttempted !== 1 ? "s" : ""} not attempted.
                </p>
              )}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-slate-800/30 p-3 space-y-1.5 mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Per question</div>
                {stats.perQuestion.map((q) => (
                  <div key={q.index} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-6">#{q.index}</span>
                    {q.status === "correct" && <FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {q.status === "wrong" && <FiX className="w-4 h-4 text-rose-400 shrink-0" />}
                    {q.status === "not-attempted" && <span className="w-4 h-4 shrink-0 rounded-full border border-slate-500" />}
                    <span className="text-slate-300 truncate flex-1">{q.title || `Question ${q.index}`}</span>
                    {q.total > 0 && (
                      <span className={`text-xs tabular-nums ${q.status === "correct" ? "text-emerald-400" : "text-rose-400"}`}>
                        {q.passed}/{q.total}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndSummary(false)}
                  className="flex-1 rounded-xl border border-white/20 bg-slate-700/50 py-3 font-semibold text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all"
                >
                  Continue Interview
                </button>
                <button
                  type="button"
                  onClick={() => saveAndQuit()}
                  className="flex-1 rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Start
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <header className="shrink-0 border-b border-white/10 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-4 py-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEndSummary(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
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

      <div
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden"
      >
        {/* Left: Question (resizable) */}
        <div
          className="hidden lg:flex flex-col min-h-0 bg-slate-900/50 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 shrink-0"
          style={{ width: questionWidth }}
        >
          <div className="px-4 py-3 border-b border-white/10 bg-slate-800/30 shrink-0">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Problem
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">
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
                <h3 className="text-lg font-bold text-white leading-snug">{question.title}</h3>
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
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{question.description}</div>
                {question.examples?.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Examples</h4>
                    <div className="space-y-4">
                      {question.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg bg-slate-800/60 p-3 text-sm border border-white/5 space-y-1.5">
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Example {i + 1}</p>
                          <p className="text-slate-200 font-mono text-xs break-all">
                            <span className="text-slate-500 font-sans">Input: </span>{ex.input}
                          </p>
                          <p className="text-slate-200 font-mono text-xs break-all">
                            <span className="text-slate-500 font-sans">Output: </span>{ex.output}
                          </p>
                          {ex.explanation && (
                            <p className="text-slate-400 text-xs italic mt-1.5">
                              <span className="text-slate-500 font-sans">Explanation: </span>{ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {question.constraints?.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-1.5">
                      {question.constraints.map((c, i) => (
                        <li key={i} className="leading-relaxed">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {question.testCases?.length > 0 && (
                  <p className="text-slate-500 text-xs">
                    {question.testCases.length} test case{question.testCases.length !== 1 ? "s" : ""} — use <strong className="text-amber-400/90">Run Code</strong> to check your solution.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Resize handle: Question | Code (desktop only) */}
        <div
          role="separator"
          aria-label="Resize question panel"
          onMouseDown={(e) => { e.preventDefault(); setResizing("left"); }}
          className={`hidden lg:block w-1.5 shrink-0 bg-slate-700/50 hover:bg-amber-500/40 transition-colors cursor-col-resize ${resizing === "left" ? "bg-amber-500/50" : ""}`}
        />

        {/* Center: Editor + mobile question */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-900/30 shrink">
          {/* Mobile: collapsible question panel (same content as left sidebar) */}
          <div className="lg:hidden shrink-0 border-b border-white/10 bg-slate-900/50">
            <details className="group">
              <summary className="px-4 py-3 border-b border-white/10 bg-slate-800/30 text-xs font-bold text-amber-400 uppercase tracking-widest cursor-pointer list-none flex items-center justify-between">
                Problem
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="max-h-64 overflow-y-auto scrollbar-hide p-4 space-y-4">
                {question && (
                  <>
                    <h3 className="text-base font-bold text-white">{question.title}</h3>
                    {(question.dataStructure || question.algorithm) && (
                      <div className="flex flex-wrap gap-2">
                        {question.dataStructure && <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-xs text-amber-300">{question.dataStructure}</span>}
                        {question.algorithm && <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-xs text-indigo-300">{question.algorithm}</span>}
                      </div>
                    )}
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{question.description}</p>
                    {question.examples?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Examples</h4>
                        {question.examples.map((ex, i) => (
                          <div key={i} className="rounded-lg bg-slate-800/60 p-2 text-xs text-slate-300">
                            <p><span className="text-slate-500">Input:</span> {ex.input}</p>
                            <p><span className="text-slate-500">Output:</span> {ex.output}</p>
                            {ex.explanation && <p className="italic text-slate-400 mt-1">{ex.explanation}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.constraints?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Constraints</h4>
                        <ul className="list-disc list-inside text-slate-400 text-xs space-y-0.5">{question.constraints.map((c, j) => <li key={j}>{c}</li>)}</ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </details>
          </div>
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

        {/* Resize handle: Code | Output */}
        <div
          role="separator"
          aria-label="Resize output panel"
          onMouseDown={(e) => { e.preventDefault(); setResizing("right"); }}
          className={`hidden lg:block w-1.5 shrink-0 bg-slate-700/50 hover:bg-amber-500/40 transition-colors cursor-col-resize ${resizing === "right" ? "bg-amber-500/50" : ""}`}
        />

        {/* Right: Output / Feedback (resizable) */}
        <div
          className="w-full lg:shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-0 bg-slate-900/50 overflow-hidden"
          style={isLg ? { width: rightPanelWidth } : undefined}
        >
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
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 text-sm">
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
