import React, { useState } from "react";

const UploadAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOutput("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setOutput("");

    const formData = new FormData();
    formData.append("zipFile", file); // key should match multer field name

    try {
      const res = await fetch("http://localhost:3001/upload-analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.result);
      } else {
        setOutput("❌ Error: " + data.error);
      }
    } catch (err) {
      setOutput("⚠️ Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-cyan-100 to-sky-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-sky-700">📦 Upload Analyzer</h1>

        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="block w-full px-4 py-2 border border-gray-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-600 file:text-white hover:file:bg-sky-700"
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "🚀 Analyze Project"}
        </button>

        {output && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-xl text-sm whitespace-pre-wrap text-gray-800">
            {output}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAnalyzer;
