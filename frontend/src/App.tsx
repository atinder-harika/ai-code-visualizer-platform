import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

interface AnalysisResult {
  analysisId: string;
  status: string;
  aiDocumentation?: string;
  complexityMetrics?: {
    totalFiles: number;
    cyclomaticComplexity: number;
    averageMethodLength: number;
  };
  patterns?: string[];
  processingTime: {
    aiAnalysis: number;
    concurrentAnalysis: number;
    total: number;
  };
}

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        repositoryUrl: repoUrl,
        branch,
        options: {
          generateDocs: true,
          analyzeComplexity: true,
          detectPatterns: true
        }
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀 AI Code Visualizer</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Intelligent code analysis powered by AI and concurrent processing
        </p>
      </header>

      <form onSubmit={handleAnalyze} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                fontSize: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={{ 
                width: '200px', 
                padding: '0.75rem', 
                fontSize: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              backgroundColor: loading ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Repository'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee', 
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ 
          border: '2px solid #0066cc', 
          borderRadius: '12px', 
          padding: '2rem',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{ marginTop: 0 }}>Analysis Results</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>Status</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                ✅ {result.status}
              </p>
            </div>

            {result.complexityMetrics && (
              <>
                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>Total Files</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    {result.complexityMetrics.totalFiles}
                  </p>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>Complexity</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    {result.complexityMetrics.cyclomaticComplexity}
                  </p>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>Processing Time</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    {result.processingTime.total}ms
                  </p>
                </div>
              </>
            )}
          </div>

          {result.aiDocumentation && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#0066cc' }}>🤖 AI Documentation</h3>
              <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {result.aiDocumentation}
              </p>
            </div>
          )}

          {result.patterns && result.patterns.length > 0 && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: '#0066cc' }}>Detected Patterns</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {result.patterns.map((pattern, idx) => (
                  <span 
                    key={idx}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
