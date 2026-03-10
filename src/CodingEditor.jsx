import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
];

const STARTER_CODE = {
  javascript: "function solve(input) {\n  // Your code here\n  return input;\n}\n",
  python: "def solve(input):\n    # Your code here\n    return input\n",
  java: "public class Main {\n    public static String solve(String input) {\n        // Your code here\n        return input;\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nstring solve(string input) {\n    // Your code here\n    return input;\n}\n",
  go: "package main\n\nfunc solve(input string) string {\n\t// Your code here\n\treturn input\n}\n",
};

export default function CodingEditor({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  theme = "vs-dark",
  height = "100%",
}) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const monacoLanguage = {
    javascript: "javascript",
    python: "python",
    java: "java",
    cpp: "cpp",
    go: "go",
  }[language] || "javascript";

  return (
    <div className="flex flex-col h-full rounded-xl border border-white/10 bg-[#1e1e1e] overflow-hidden shadow-xl shadow-black/30">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-slate-800/60">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm font-medium text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-colors"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-slate-800">
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-h-[200px]" style={{ height }}>
        <Editor
          height={height}
          defaultLanguage="javascript"
          language={monacoLanguage}
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
          }}
          loading={<div className="flex items-center justify-center h-full text-slate-400">Loading editor…</div>}
        />
      </div>
    </div>
  );
}

export { LANGUAGES, STARTER_CODE };
