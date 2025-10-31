import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenFancy, 
  faSpinner, 
  faCheckCircle, 
  faExclamationTriangle,
  faMagic,
  faRedo,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './AIWriter.css';

const AIWriter = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('formal');
  const [length, setLength] = useState('medium');
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Trigger model download
  const handleTriggerDownload = async () => {
    setIsDownloading(true);
    try {
      toast.loading('Triggering AI model download... This may take 5-10 minutes.');
      
      // Try to create a writer session which will trigger download
      const writer = await window.ai.writer.create();
      
      toast.success('Model download initiated! Please wait 5-10 minutes and refresh the page.');
      
      // Clean up
      writer.destroy();
    } catch (err) {
      console.error('Error triggering download:', err);
      toast.error(`Error: ${err.message}. Try the manual steps in the instructions.`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if Writer API is supported
  useEffect(() => {
    const checkSupport = async () => {
      console.log('Checking Writer API (global Writer object)...');
      console.log('Writer in self:', 'Writer' in self);
      
      if (!('Writer' in self)) {
        setIsSupported(false);
        setError('Writer API is not available. Please enable the "Writer API for Gemini Nano" flag at chrome://flags/#writer-api-for-gemini-nano, restart Chrome Canary completely, and try again.');
        return;
      }

      try {
        const availability = await Writer.availability();
        console.log('Writer API availability:', availability);
        
        if (availability === 'readily' || availability === 'available') {
          setIsSupported(true);
          setError(null);
        } else if (availability === 'after-download') {
          setIsSupported(false);
          setError('The AI model needs to be downloaded. Click "Generate" to trigger the download, then wait a few minutes and refresh the page.');
        } else {
          setIsSupported(false);
          setError(`Writer API is not available. Status: ${availability}`);
        }
      } catch (err) {
        console.error('Error checking Writer API:', err);
        setIsSupported(false);
        setError(`Failed to check Writer API: ${err.message}`);
      }
    };

    checkSupport();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      console.log('Creating Writer session...');
      
      // Create writer with options
      const writer = await Writer.create({
        tone: tone,
        format: 'plain-text',
        length: length,
        sharedContext: context || undefined,
        expectedInputLanguages: ['en'],
        expectedContextLanguages: ['en'],
        outputLanguage: 'en',
      });

      console.log('Writer session created, generating text...');

      // Generate text (non-streaming)
      const result = await writer.write(prompt);
      
      console.log('Generated text:', result);
      setGeneratedText(result);
      toast.success('Text generated successfully!');

      // Clean up
      writer.destroy();
    } catch (err) {
      console.error('Error generating text:', err);
      
      if (err.message.includes('after-download') || err.message.includes('download')) {
        setError('Model needs to be downloaded. This was triggered automatically. Please wait 5-10 minutes and refresh the page.');
        toast.error('Model downloading in background...');
      } else {
        setError(err.message || 'Failed to generate text. Please try again.');
        toast.error('Failed to generate text');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
      toast.success('Copied to clipboard!');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setContext('');
    setGeneratedText('');
    setError(null);
    setTone('formal');
    setLength('medium');
  };

  const handleDiagnostic = async () => {
    console.log('=== Chrome Writer API Diagnostic ===');
    console.log('1. Writer in self:', 'Writer' in self);
    console.log('2. Writer object:', self.Writer);
    
    if ('Writer' in self) {
      try {
        const availability = await Writer.availability();
        console.log('3. Writer.availability():', availability);
        
        if (availability === 'readily' || availability === 'available') {
          toast.success('✅ Writer API is ready to use!');
          console.log('✅ You can use the Writer API immediately');
        } else if (availability === 'after-download') {
          toast.warning('⚠️ Model needs to be downloaded. Try clicking Generate to trigger download.');
          console.log('⚠️ Model download required');
        } else {
          toast.error(`❌ Writer API not available: ${availability}`);
          console.log('❌ Status:', availability);
        }
      } catch (err) {
        console.error('Error checking Writer API:', err);
        toast.error('Error: ' + err.message);
      }
    } else {
      console.log('❌ Writer API not found');
      toast.error('Writer API not loaded. Enable chrome://flags/#writer-api-for-gemini-nano');
    }
    
    console.log('=== Diagnostic Complete ===');
  };

  // Example prompts
  const examplePrompts = [
    'Write a professional summary for a software engineer with 5 years of experience',
    'Create a cover letter introduction for a marketing position',
    'Write a brief description of project management skills',
    'Compose a thank you note after a job interview',
  ];

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  return (
    <div className="ai-writer-container">
      <div className="ai-writer-header">
        <div className="ai-writer-title">
          <FontAwesomeIcon icon={faPenFancy} className="ai-writer-icon" />
          <div>
            <h1>AI Writer</h1>
            <p>Generate professional content using Chrome's AI Writer API</p>
          </div>
        </div>

        {/* API Status */}
        <div className={`api-status ${isSupported ? 'supported' : 'unsupported'}`}>
          <FontAwesomeIcon 
            icon={isSupported ? faCheckCircle : faExclamationTriangle} 
          />
          <span>{isSupported ? 'API Available' : 'API Not Available'}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && !isSupported && (
        <div className="ai-writer-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <div>
            <h3>Writer API Not Available</h3>
            <p>{error}</p>
            
            <button
              className="download-trigger-btn"
              onClick={handleDiagnostic}
              style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              🔍 Run Diagnostic Test
            </button>
            
            <div className="setup-instructions">
              <h4>Setup Instructions for localhost:</h4>
              <ol>
                <li>Go to <code>chrome://flags/#writer-api-for-gemini-nano</code></li>
                <li>Set it to <strong>Enabled</strong></li>
                <li>Search for: <code>Experimental Web Platform features</code></li>
                <li>Set it to <strong>Enabled</strong></li>
                <li>Click <strong>Relaunch</strong> button at the bottom</li>
                <li>After Chrome restarts, come back to this page</li>
                <li>Click the diagnostic button above to check status</li>
                <li>If model needs download, click Generate to trigger it (takes 5-10 minutes)</li>
              </ol>
              
              <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>Testing the API manually:</h4>
                <p style={{ margin: '5px 0', color: '#78350f' }}>
                  Open DevTools (F12) → Console tab → Run these commands:
                </p>
                <code style={{ display: 'block', padding: '10px', background: '#fef3c7', borderRadius: '4px', margin: '10px 0', fontSize: '12px' }}>
                  'Writer' in self  // Should return: true
                  <br/>
                  await Writer.availability()  // Should return: 'readily' or 'after-download'
                </code>
                <p style={{ margin: '5px 0', color: '#78350f' }}>
                  If you see 'after-download', click the Generate button to trigger model download.
                </p>
                
                <p style={{ margin: '15px 0 5px 0', color: '#78350f' }}>
                  <strong>Note:</strong> This requires Chrome 137+ with the Writer API flag enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ai-writer-content">
        {/* Input Section */}
        <div className="ai-writer-input-section">
          <div className="input-group">
            <label htmlFor="prompt">
              <FontAwesomeIcon icon={faMagic} /> Writing Prompt *
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter what you want to write (e.g., 'Write a professional summary for a software engineer')"
              rows={4}
              disabled={!isSupported}
            />
          </div>

          <div className="input-group">
            <label htmlFor="context">
              Context (Optional)
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any context that will help generate better content (e.g., 'Experienced in React, Node.js, and cloud technologies')"
              rows={3}
              disabled={!isSupported}
            />
          </div>

          <div className="settings-row">
            <div className="input-group">
              <label htmlFor="tone">Tone</label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={!isSupported}
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="length">Length</label>
              <select
                id="length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={!isSupported}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!isSupported || isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Generating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagic} />
                  Generate Text
                </>
              )}
            </button>

            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faRedo} />
              Reset
            </button>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="example-prompts-section">
          <h3>Example Prompts</h3>
          <div className="example-prompts-grid">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="example-prompt-btn"
                onClick={() => handleExampleClick(example)}
                disabled={!isSupported || isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Output Section */}
        {generatedText && (
          <div className="ai-writer-output-section">
            <div className="output-header">
              <h3>Generated Text</h3>
              <button
                className="copy-btn"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <FontAwesomeIcon icon={faCopy} />
                Copy
              </button>
            </div>
            <div className="output-content">
              {generatedText}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && isSupported && (
          <div className="ai-writer-error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="ai-writer-info">
        <h3>About Chrome Writer API</h3>
        <p>
          The Writer API is an experimental Chrome feature that provides AI-powered writing assistance 
          directly in the browser. It uses on-device AI models to generate text based on your prompts.
        </p>
        <ul>
          <li><strong>Privacy-First:</strong> All processing happens on your device</li>
          <li><strong>Fast:</strong> No network requests needed</li>
          <li><strong>Customizable:</strong> Control tone, length, and context</li>
          <li><strong>Experimental:</strong> Currently in Chrome Origin Trial</li>
        </ul>
      </div>
    </div>
  );
};

export default AIWriter;
