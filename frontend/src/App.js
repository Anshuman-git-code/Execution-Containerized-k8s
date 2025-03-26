import React, { useState } from 'react';
import axios from 'axios';

function CodeExecutionApp() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const supportedLanguages = [
    'python', 
    'javascript', 
    'c', 
    'cpp', 
    'java'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/run', {
        code,
        language,
        stdin
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-center text-gray-900">
                  Code Execution Service
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      {supportedLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Code
                    </label>
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={6}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your code here..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Standard Input (Optional)
                    </label>
                    <textarea 
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter input for your code (optional)"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Executing...' : 'Run Code'}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
                    <p>{error}</p>
                  </div>
                )}

                {result && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded">
                    <h3 className="text-lg font-semibold mb-2">Execution Result</h3>
                    <div className="space-y-2">
                      <div>
                        <strong>Status:</strong> {result.status}
                      </div>
                      {result.stdout && (
                        <div>
                          <strong>Output:</strong>
                          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                            {result.stdout}
                          </pre>
                        </div>
                      )}
                      {result.stderr && (
                        <div>
                          <strong>Error:</strong>
                          <pre className="bg-red-50 p-2 rounded text-red-800 overflow-x-auto">
                            {result.stderr}
                          </pre>
                        </div>
                      )}
                      <div>
                        <strong>Exit Code:</strong> {result.exit_code}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeExecutionApp;