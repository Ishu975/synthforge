"use client";
import { useState } from "react";

export default function Home() {
  const [usernameInput, setUsernameInput] = useState("");
  const [activeUser, setActiveUser] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // The base URL without a trailing slash
  const API_BASE = "https://synthforge-api-o628.onrender.com";

  const fetchHistory = async (user: string) => {
    try {
      // Matches @app.get("/api/history/{username}")
      const response = await fetch(`${API_BASE}/api/history/${user}`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error("Could not load history", error);
      setHistory([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUser(usernameInput);
      fetchHistory(usernameInput);
    }
  };

  const handleLogout = () => {
    setActiveUser("");
    setHistory([]);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      // Matches @app.post("/api/annotate")
      const response = await fetch(`${API_BASE}/api/annotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Matches AnnotationRequest(username, raw_text)
        body: JSON.stringify({ raw_text: inputText, username: activeUser }),
      });
      await response.json();
      fetchHistory(activeUser);
      setInputText("");
    } catch (error) {
      console.error("Text analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    if (!batchFile) return;
    setBatchLoading(true);
    const formData = new FormData();
    formData.append("file", batchFile);
    formData.append("user", activeUser);

    try {
      // Matches @app.post("/api/batch")
      const response = await fetch(`${API_BASE}/api/batch`, {
        method: "POST",
        body: formData,
      });
      await response.json();
      fetchHistory(activeUser);
      setBatchFile(null);
    } catch (error) {
      console.error("Batch processing failed", error);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleImage = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("user", activeUser);

    try {
      // Matches @app.post("/api/vision")
      const response = await fetch(`${API_BASE}/api/vision`, {
        method: "POST",
        body: formData,
      });
      await response.json();
      fetchHistory(activeUser);
      setImageFile(null);
    } catch (error) {
      console.error("Vision analysis failed", error);
    } finally {
      setImageLoading(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] max-w-md w-full">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 text-center">
            SynthForge OS
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Workspace ID..."
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-3 text-cyan-50 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-medium py-3 rounded-lg transition-all"
            >
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              SynthForge Enterprise
            </h1>
            <p className="text-sm text-gray-400 mt-1">Active Workspace: <span className="text-cyan-400">{activeUser}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
          >
            Terminate Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Text Extraction */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Live NLP Extraction</h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter raw text payload..."
                className="w-full bg-gray-950/50 border border-gray-800 rounded-lg p-3 text-sm h-32 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText}
                className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Run Analysis"}
              </button>
            </div>

            {/* Batch Upload */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Batch Processing (.txt)</h2>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setBatchFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
              />
              <button
                onClick={handleBatch}
                disabled={batchLoading || !batchFile}
                className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {batchLoading ? "Uploading..." : "Process Batch"}
              </button>
            </div>

            {/* Vision AI */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4">Multimodal Vision AI</h2>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
              />
              <button
                onClick={handleImage}
                disabled={imageLoading || !imageFile}
                className="w-full mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {imageLoading ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
          </div>

          {/* Data Output Column */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl h-full min-h-[600px]">
              <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center justify-between">
                <span>Structured Data Log</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Live Sync</span>
              </h2>
              
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {(!history || history.length === 0) ? (
                  <div className="text-center text-gray-500 mt-20">
                    No extraction history found for this workspace.
                  </div>
                ) : (
                  history.slice().map((item, i) => (
                    <div key={i} className="bg-gray-950 p-4 rounded-lg border border-gray-800 border-l-4 border-l-cyan-500 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>ID: {item.id}</span>
                        <span className="uppercase bg-gray-800 px-2 py-1 rounded">{item.type}</span>
                      </div>
                      <div className="text-sm text-gray-300 border-b border-gray-800 pb-2">{item.input_data}</div>
                      <pre className="bg-black/50 p-3 rounded text-xs text-green-400 overflow-x-auto border border-gray-800 whitespace-pre-wrap">
                        {typeof item.ai_result === 'string' 
                          ? item.ai_result 
                          : JSON.stringify(item.ai_result, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    