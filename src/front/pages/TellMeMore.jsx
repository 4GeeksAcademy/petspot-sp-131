import React, { useState, useRef, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const TellMeMore = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleFileInput = (e) => handleFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze-pet`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Analysis failed");
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .tm-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          font-family: 'Inter', sans-serif;
          padding: 60px 20px;
          color: #fff;
        }

        .tm-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .tm-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 50px;
          padding: 6px 18px;
          font-size: 13px;
          color: #c4b5fd;
          font-weight: 500;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .tm-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .tm-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.6);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .tm-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .tm-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 24px;
        }

        .tm-dropzone {
          border: 2px dashed rgba(139, 92, 246, 0.4);
          border-radius: 16px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(139, 92, 246, 0.04);
          position: relative;
          overflow: hidden;
        }

        .tm-dropzone.dragging {
          border-color: #a78bfa;
          background: rgba(139, 92, 246, 0.12);
          transform: scale(1.01);
        }

        .tm-dropzone:hover {
          border-color: rgba(139, 92, 246, 0.7);
          background: rgba(139, 92, 246, 0.08);
        }

        .tm-dropzone-icon {
          font-size: 56px;
          margin-bottom: 16px;
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .tm-dropzone h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .tm-dropzone p {
          color: rgba(255,255,255,0.45);
          font-size: 0.9rem;
        }

        .tm-browse-btn {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          padding: 10px 24px;
          font-size: 14px;
          margin-top: 16px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .tm-browse-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
        }

        .tm-preview-wrap {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }

        .tm-preview-img {
          width: 240px;
          height: 240px;
          object-fit: cover;
          border-radius: 16px;
          border: 2px solid rgba(139, 92, 246, 0.4);
          flex-shrink: 0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .tm-preview-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
        }

        .tm-preview-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }

        .tm-preview-info p {
          color: rgba(255,255,255,0.5);
          font-size: 0.9rem;
          margin: 0;
        }

        .tm-btn-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tm-analyze-btn {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          padding: 14px 32px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .tm-analyze-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s;
        }

        .tm-analyze-btn:hover::before { left: 100%; }

        .tm-analyze-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(124, 58, 237, 0.5);
        }

        .tm-analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .tm-reset-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          padding: 14px 24px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .tm-reset-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

        .tm-spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .tm-loading-card {
          text-align: center;
          padding: 48px;
        }

        .tm-loading-spinner-big {
          width: 64px;
          height: 64px;
          border: 4px solid rgba(139, 92, 246, 0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        .tm-loading-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .tm-loading-card p {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
        }

        .tm-results {
          animation: fadeInUp 0.5s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tm-results-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .tm-results-avatar {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .tm-results-title h2 {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 4px;
        }

        .tm-mix-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .tm-mix-badge.is-mix {
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: #fbbf24;
        }

        .tm-mix-badge.pure {
          background: rgba(52, 211, 153, 0.15);
          border: 1px solid rgba(52, 211, 153, 0.4);
          color: #34d399;
        }

        .tm-results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .tm-info-block {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s;
        }

        .tm-info-block:hover {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .tm-info-block-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tm-info-block-content {
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tm-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tm-tag {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          color: #c4b5fd;
          font-weight: 500;
        }

        .tm-error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          color: #fca5a5;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }

        @media (max-width: 600px) {
          .tm-card { padding: 24px; }
          .tm-preview-wrap { flex-direction: column; }
          .tm-preview-img { width: 100%; height: 220px; }
        }
      `}</style>

      <div className="tm-page">
        <div className="tm-container">

          {/* Hero */}
          <div className="tm-hero">
            <div className="tm-badge">✨ Powered by Gemini AI</div>
            <h1 className="tm-title">Tell me more about it</h1>
            <p className="tm-subtitle">
              Upload a photo of your pet and let AI tell you its breed, dietary recommendations, care tips, and more.
            </p>
          </div>

          {/* Upload Card */}
          {!preview && (
            <div className="tm-card">
              <div
                className={`tm-dropzone ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="tm-dropzone-icon">🐾</div>
                <h3>Drop your pet's photo here</h3>
                <p>Supports JPG, PNG, WEBP · Max 10MB</p>
                <button className="tm-browse-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse files
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                style={{ display: "none" }}
                id="pet-image-input"
              />
              {error && (
                <div className="tm-error-box">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>
          )}

          {/* Preview + Analyze */}
          {preview && !loading && (
            <div className="tm-card">
              <div className="tm-preview-wrap">
                <img src={preview} alt="Pet preview" className="tm-preview-img" />
                <div className="tm-preview-info">
                  <h3>Ready to analyze</h3>
                  <p>{image?.name}</p>
                  <div className="tm-btn-row">
                    <button className="tm-analyze-btn" onClick={handleAnalyze}>
                      <span>✨</span> Analyze my pet
                    </button>
                    <button className="tm-reset-btn" onClick={handleReset}>
                      Change photo
                    </button>
                  </div>
                  {error && (
                    <div className="tm-error-box">
                      <span>⚠️</span> {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="tm-card tm-loading-card">
              <div className="tm-loading-spinner-big"></div>
              <h3>Analyzing your pet...</h3>
              <p>Gemini AI is identifying the breed and preparing personalized recommendations</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="tm-card tm-results">
              <div className="tm-results-header">
                <img src={preview} alt="Pet" className="tm-results-avatar" />
                <div className="tm-results-title">
                  <h2>{result.breed}</h2>
                  <span className={`tm-mix-badge ${result.is_mix ? "is-mix" : "pure"}`}>
                    {result.is_mix ? "🧬 Mixed breed" : "🏆 Purebred"}
                  </span>
                  {" "}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                    {result.animal_type}
                  </span>
                </div>
              </div>

              <div className="tm-results-grid">

                {result.is_mix && result.mix_description && (
                  <div className="tm-info-block">
                    <div className="tm-info-block-label">🧬 Mix Breakdown</div>
                    <div className="tm-info-block-content">{result.mix_description}</div>
                  </div>
                )}

                <div className="tm-info-block">
                  <div className="tm-info-block-label">🐶 Personality</div>
                  <div className="tm-info-block-content">{result.personality}</div>
                </div>

                <div className="tm-info-block">
                  <div className="tm-info-block-label">🍗 Recommended Food</div>
                  <div className="tm-tag-list">
                    {(result.recommended_food || []).map((f, i) => (
                      <span className="tm-tag" key={i}>{f}</span>
                    ))}
                  </div>
                </div>

                <div className="tm-info-block">
                  <div className="tm-info-block-label">🩺 Care Tips</div>
                  <div className="tm-tag-list">
                    {(result.care_tips || []).map((tip, i) => (
                      <span className="tm-tag" key={i}>{tip}</span>
                    ))}
                  </div>
                </div>

                <div className="tm-info-block">
                  <div className="tm-info-block-label">💡 Fun Fact</div>
                  <div className="tm-info-block-content">{result.fun_facts}</div>
                </div>

              </div>

              <div className="tm-btn-row" style={{ marginTop: 8 }}>
                <button className="tm-reset-btn" onClick={handleReset}>
                  🔄 Try another photo
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
