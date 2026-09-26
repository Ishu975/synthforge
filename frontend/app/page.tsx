"use client";
import { useState, useEffect } from "react";

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

  const fetchHistory = async (user: string) => {
    try {
      const response = await fetch(`https://synthforge-api-o628.onrender.com/`);
      const data = await response.json();
      setHistory(data.history);
    } catch (error) {
      console.error("Could not load history");
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

  const handleAnnotateText = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/api/annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: inputText, username: activeUser }),
      });
      fetchHistory(activeUser);
      setInputText("");
    } catch (error) {
      alert("Error connecting to backend.");
    }
    setLoading(false);
  };

  const handleBatchUpload = async () => {
    if (!batchFile) return;
    setBatchLoading(true);
    const formData = new FormData();
    formData.append("file", batchFile);
    formData.append("username", activeUser);
    try {
      await fetch("http://localhost:8000/api/batch", { method: "POST", body: formData });
      fetchHistory(activeUser);
    } catch (error) {
      alert("Batch upload failed.");
    }
    setBatchLoading(false);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("username", activeUser);
    try {
      await fetch("http://localhost:8000/api/annotate-image", { method: "POST", body: formData });
      fetchHistory(activeUser);
    } catch (error) {
      alert("Image upload failed.");
    }
    setImageLoading(false);
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center font-sans text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0f] to-[#0a0a0f]"></div>
        <div className="relative z-10 bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.8)]">
              <span className="text-3xl font-black text-white">S</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2 text-center tracking-tight">SynthForge</h1>
          <p className="text-blue-200/60 text-center mb-8 font-mono text-sm tracking-widest uppercase">System Initialization</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-blue-300 mb-2 uppercase tracking-wider">Access Credentials</label>
              <input
                type="text"
                required
                className="w-full bg-black/50 border border-blue-500/30 rounded-lg p-4 text-cyan-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono placeholder:text-blue-900/50"
                placeholder="Enter workspace ID..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-4 rounded-lg font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
              Initialize Connection
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 p-4 md:p-10 font-sans relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
              <span className="text-2xl font-black text-white">S</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">SynthForge API</h1>
              <p className="text-blue-300/60 font-mono text-xs mt-1">OPERATIVE: {activeUser} // STATUS: ONLINE</p>
            </div>
          </div>
          <div className="space-x-4 mt-6 md:mt-0 flex">
            <button 
              onClick={() => window.open(`http://localhost:8000/api/export?username=${activeUser}`, "_blank")}
              className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-lg font-mono text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
            >
              <span>[ EXPORT .CSV ]</span>
            </button>
            <button onClick={handleLogout} className="bg-rose-500/10 border border-rose-500/50 hover:bg-rose-500/20 text-rose-400 px-6 py-2 rounded-lg font-mono text-sm transition-all">
              TERMINATE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)] relative overflow-hidden group hover:border-blue-400/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
            <h2 className="text-lg font-bold text-blue-400 mb-1 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)]"></span>
              <span>NLP Node</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono mb-4 border-b border-white/5 pb-4">Single string payload extraction</p>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-cyan-50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm font-mono transition-all resize-none"
              rows={4}
              placeholder="Inject string payload..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button onClick={handleAnnotateText} disabled={loading} className="mt-4 w-full bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-300 py-3 rounded-lg font-mono text-sm tracking-wider uppercase transition-all disabled:opacity-50">
              {loading ? "Processing..." : "Execute >"}
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)] relative overflow-hidden group hover:border-purple-400/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all"></div>
            <h2 className="text-lg font-bold text-purple-400 mb-1 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,1)]"></span>
              <span>Batch Node</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono mb-4 border-b border-white/5 pb-4">Multi-line .txt file ingestion</p>
            <div className="h-24 border border-dashed border-white/20 rounded-lg flex items-center justify-center bg-black/30 hover:bg-white/5 transition-all mt-4 relative">
              <input type="file" accept=".txt" onChange={(e) => setBatchFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="font-mono text-sm text-purple-300/60">{batchFile ? batchFile.name : "Select Payload File"}</span>
            </div>
            <button onClick={handleBatchUpload} disabled={batchLoading || !batchFile} className="mt-4 w-full bg-purple-600/20 border border-purple-500/50 hover:bg-purple-600/40 text-purple-300 py-3 rounded-lg font-mono text-sm tracking-wider uppercase transition-all disabled:opacity-50">
              {batchLoading ? "Processing..." : "Execute >"}
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 shadow-[0_0_30px_-10px_rgba(249,115,22,0.15)] relative overflow-hidden group hover:border-orange-400/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all"></div>
            <h2 className="text-lg font-bold text-orange-400 mb-1 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,1)]"></span>
              <span>Vision Node</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono mb-4 border-b border-white/5 pb-4">Image parsing & OCR</p>
            <div className="h-24 border border-dashed border-white/20 rounded-lg flex items-center justify-center bg-black/30 hover:bg-white/5 transition-all mt-4 relative">
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="font-mono text-sm text-orange-300/60">{imageFile ? imageFile.name : "Select Image Payload"}</span>
            </div>
            <button onClick={handleImageUpload} disabled={imageLoading || !imageFile} className="mt-4 w-full bg-orange-600/20 border border-orange-500/50 hover:bg-orange-600/40 text-orange-300 py-3 rounded-lg font-mono text-sm tracking-wider uppercase transition-all disabled:opacity-50">
              {imageLoading ? "Scanning..." : "Execute >"}
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                <span>Vector Database Log</span>
              </h2>
              <p className="text-xs font-mono text-gray-500 mt-1">Live feed of annotated structural data.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="font-mono text-gray-500 text-sm">AWAITING INGESTION...</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-[#0f111a] p-5 rounded-xl border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:border-white/10 transition-all">
                  <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/5 pb-4 lg:pb-0 lg:pr-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-gray-500">ID: {item.id}</span>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.type === 'vision' ? 'bg-orange-500/20 text-orange-400' :
                        item.type === 'batch_text' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{item.type}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.input_data}</p>
                  </div>
                  <div className="lg:col-span-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-xs text-emerald-400 font-bold">STRUCTURAL OUTPUT</span>
                    </div>
                    <pre className="bg-black p-4 rounded-lg border border-white/5 overflow-x-auto">
                      <code className="text-emerald-300/90 font-mono text-[11px] leading-[1.6]">
                        {item.ai_result}
                      </code>
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
    