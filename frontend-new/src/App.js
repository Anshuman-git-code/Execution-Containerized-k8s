import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  // Only these four languages
  const languages = ["python", "javascript", "c", "cpp"];

  const handleRunCode = async () => {
    setLoading(true);
    try {
      // Using the API endpoint that works with our nginx proxy
      const response = await axios.post("/api/run", {
        code,
        language,
        stdin: "" // Empty string for stdin to maintain API compatibility
      });
      setOutput(response.data);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput({ 
        error: "Failed to execute code", 
        stdout: "", 
        stderr: error.toString(),
        status: "Error" 
      });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Online Code Executor</h1>
      <label>Language:</label>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Write your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {/* No input field */}

      <button onClick={handleRunCode} disabled={loading}>
        {loading ? "Running..." : "Run Code"}
      </button>

      {output && (
        <div className="output">
          <h3>Output:</h3>
          <pre>{output.stdout || "No output"}</pre>
          <h3>Errors:</h3>
          <pre>{output.stderr || "No errors"}</pre>
          <h3>Status:</h3>
          <pre>{output.status}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
