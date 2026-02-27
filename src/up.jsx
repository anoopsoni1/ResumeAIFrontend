import { useState, useEffect } from "react";
import LightPillar from "./LiquidEther.jsx";

const API_BASE = "https://resumeaibackend-oqcl.onrender.com";
const TEMPLATES_API = `${API_BASE}/api/v1/user/templates`;

// ——— API calls for template.controller.js ———

/** GET all templates */
export async function fetchAllTemplates() {
  const res = await fetch(TEMPLATES_API);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch templates");
  return json.data;
}

/** GET single template by id */
export async function fetchTemplateById(id) {
  const res = await fetch(`${TEMPLATES_API}/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to fetch template");
  return json.data;
}

/** POST create template (name + image file) */
export async function createTemplate(name, imageFile) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("image", imageFile);
  const res = await fetch(TEMPLATES_API, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to create template");
  return json.data;
}

/** DELETE template by id */
export async function deleteTemplate(id) {
  const res = await fetch(`${TEMPLATES_API}/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to delete template");
  return json.data;
}

// ——— Simple UI page using the APIs ———

export default function UpPage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createName, setCreateName] = useState("");
  const [createFile, setCreateFile] = useState(null);
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 768,
    height: typeof window !== "undefined" ? window.innerHeight : 1024,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllTemplates();
      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim() || !createFile) {
      setError("Name and image are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createTemplate(createName.trim(), createFile);
      setCreateName("");
      setCreateFile(null);
      if (document.getElementById("create-image")) {
        document.getElementById("create-image").value = "";
      }
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    setError("");
    try {
      await deleteTemplate(id);
      if (selected?._id === id) setSelected(null);
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelect = async (id) => {
    setError("");
    try {
      const data = await fetchTemplateById(id);
      setSelected(data);
    } catch (err) {
      setError(err.message);
      setSelected(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900">
      {size.width >= 768 && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high" />
        </div>
      )}
      <div className="relative z-10 min-h-screen text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Templates (up.jsx)</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">Create template</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Name</span>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Template name"
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder:text-zinc-500 w-48"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-400 text-sm">Image</span>
            <input
              id="create-image"
              type="file"
              accept="image/*"
              onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !createName.trim() || !createFile}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Uploading…" : "Create"}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">All templates</h2>
        {loading && !templates.length ? (
          <p className="text-zinc-400">Loading…</p>
        ) : templates.length === 0 ? (
          <p className="text-zinc-400">No templates yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t._id}
                className="rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(t._id)}
                  className="w-full text-left block"
                >
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-zinc-400 text-xs truncate">{t.image}</p>
                  </div>
                </button>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected (GET by id) */}
      {selected && (
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
          <h2 className="text-lg font-semibold mb-2">Selected template (GET by id)</h2>
          <p className="text-zinc-400 text-sm mb-2">ID: {selected._id}</p>
          <p className="font-medium mb-2">{selected.name}</p>
          {selected.image && (
            <img
              src={selected.image}
              alt={selected.name}
              className="max-w-sm rounded-lg border border-zinc-600"
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
