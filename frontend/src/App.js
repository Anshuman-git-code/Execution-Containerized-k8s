import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const languages = ["python", "javascript", "c", "cpp", "java"];

  const handleRunCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/run", {
        code,
        language,
        stdin,
      });
      setOutput(response.data);
    } catch (error) {
      setOutput({ error: "Failed to execute code" });
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

      <textarea
        placeholder="Input (optional)"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
      />

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
