import { useState } from 'react';
import './ChromeAIStatus.css';

const ChromeAIStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const checkAPIs = () => {
    const status = {
      windowAI: typeof window.ai,
      windowTranslation: typeof window.translation,
      globalWriter: typeof window.Writer,
      globalProofreader: typeof window.Proofreader,
      aiAPIs: {},
      translationAPIs: {},
      globalAPIs: {}
    };
    
    // Check AI APIs (window.ai.*)
    if (window.ai) {
      const aiMethods = ['languageModel', 'summarizer', 'rewriter'];
      aiMethods.forEach(method => {
        status.aiAPIs[method] = typeof window.ai[method];
      });
    }
    
    // Check Translation APIs
    if (window.translation) {
      const translationMethods = ['canTranslate', 'createTranslator', 'createDetector'];
      translationMethods.forEach(method => {
        status.translationAPIs[method] = typeof window.translation[method];
      });
    }
    
    // Check Global APIs
    if (window.Writer) {
      status.globalAPIs.Writer = typeof window.Writer;
    }
    if (window.Proofreader) {
      status.globalAPIs.Proofreader = typeof window.Proofreader;
    }
    
    return status;
  };
  
  const status = checkAPIs();
  const isAvailable = status.windowAI !== 'undefined' || status.globalWriter !== 'undefined' || status.globalProofreader !== 'undefined';
  
  return (
    <div className="chrome-ai-status">
      <button 
        className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Click to view Chrome AI API status"
      >
        {isAvailable ? '✅' : '⚠️'} Chrome AI
      </button>
      
      {isOpen && (
        <div className="status-panel">
          <div className="status-header">
            <h3>Chrome AI API Status</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="status-content">
            <div className="status-section">
              <h4>Base APIs:</h4>
              <div className="status-item">
                <span className="label">window.ai:</span>
                <span className={`value ${status.windowAI !== 'undefined' ? 'success' : 'error'}`}>
                  {status.windowAI}
                </span>
              </div>
              <div className="status-item">
                <span className="label">window.translation:</span>
                <span className={`value ${status.windowTranslation !== 'undefined' ? 'success' : 'error'}`}>
                  {status.windowTranslation}
                </span>
              </div>
            </div>
            
            <div className="status-section">
              <h4>Global APIs:</h4>
              <div className="status-item">
                <span className="label">window.Writer:</span>
                <span className={`value ${status.globalWriter !== 'undefined' ? 'success' : 'error'}`}>
                  {status.globalWriter}
                </span>
              </div>
              <div className="status-item">
                <span className="label">window.Proofreader:</span>
                <span className={`value ${status.globalProofreader !== 'undefined' ? 'success' : 'error'}`}>
                  {status.globalProofreader}
                </span>
              </div>
            </div>
            
            {window.ai && (
              <div className="status-section">
                <h4>AI Methods:</h4>
                {Object.entries(status.aiAPIs).map(([method, type]) => (
                  <div key={method} className="status-item">
                    <span className="label">{method}:</span>
                    <span className={`value ${type === 'function' ? 'success' : 'warning'}`}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {window.translation && (
              <div className="status-section">
                <h4>Translation Methods:</h4>
                {Object.entries(status.translationAPIs).map(([method, type]) => (
                  <div key={method} className="status-item">
                    <span className="label">{method}:</span>
                    <span className={`value ${type === 'function' ? 'success' : 'warning'}`}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {(window.Writer || window.Proofreader) && Object.keys(status.globalAPIs).length > 0 && (
              <div className="status-section">
                <h4>Global API Methods:</h4>
                {Object.entries(status.globalAPIs).map(([method, type]) => (
                  <div key={method} className="status-item">
                    <span className="label">{method}:</span>
                    <span className={`value ${type === 'function' ? 'success' : 'warning'}`}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {!isAvailable && (
              <div className="status-section instructions">
                <h4>⚠️ How to Enable:</h4>
                <ol>
                  <li>Open <code>chrome://flags/</code></li>
                  <li>Enable these flags:
                    <ul>
                      <li>#optimization-guide-on-device-model</li>
                      <li>#prompt-api-for-gemini-nano</li>
                      <li>#writer-api-for-gemini-nano</li>
                      <li>#proofreader-api-for-gemini-nano</li>
                      <li>#summarization-api-for-gemini-nano</li>
                      <li>#rewriter-api-for-gemini-nano</li>
                      <li>#translation-api</li>
                    </ul>
                  </li>
                  <li>Restart Chrome completely</li>
                  <li>Go to <code>chrome://components/</code></li>
                  <li>Find "Optimization Guide On Device Model"</li>
                  <li>Click "Check for update" and wait (~1-2GB)</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChromeAIStatus;
