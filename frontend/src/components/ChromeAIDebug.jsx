import React, { useEffect, useState } from 'react';

const ChromeAIDebug = () => {
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const checkAPIs = async () => {
      const results = {
        windowAI: typeof window.ai,
        windowTranslation: typeof window.translation,
        aiKeys: window.ai ? Object.keys(window.ai) : [],
        translationKeys: window.translation ? Object.keys(window.translation) : [],
      };

      // Check each AI API
      if (window.ai) {
        const apis = ['writer', 'rewriter', 'proofreader', 'summarizer', 'languageModel'];
        for (const api of apis) {
          if (window.ai[api]) {
            try {
              const availability = await window.ai[api].availability();
              results[`${api}_availability`] = availability;
            } catch (error) {
              results[`${api}_error`] = error.message;
            }
          } else {
            results[`${api}_exists`] = false;
          }
        }
      }

      setDebug(results);
    };

    checkAPIs();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      background: 'white', 
      padding: 20, 
      border: '2px solid #333',
      borderRadius: 8,
      maxWidth: 400,
      maxHeight: 500,
      overflow: 'auto',
      zIndex: 9999,
      fontSize: 12,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Chrome AI Debug</h3>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
};

export default ChromeAIDebug;
