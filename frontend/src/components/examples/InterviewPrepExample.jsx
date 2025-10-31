import React, { useState } from 'react';
import useInterviewPrep from '../../hooks/useInterviewPrep';
import AIProviderBadge from '../AIProviderBadge/AIProviderBadge';
import './InterviewPrepExample.css';

/**
 * Example component showing how to use Interview Prep features
 * This demonstrates the hybrid AI approach (Chrome AI + OpenAI fallback)
 */
const InterviewPrepExample = () => {
  const [resumeData, setResumeData] = useState({
    jobTitle: 'Software Engineer',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    experience: '3 years'
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  
  const {
    questions,
    isGeneratingQuestions,
    isGeneratingAnswer,
    error,
    generateQuestions,
    generateAnswer,
    clearQuestions
  } = useInterviewPrep();

  const handleGenerateQuestions = async () => {
    try {
      await generateQuestions(resumeData, 10);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    }
  };

  const handleGenerateAnswer = async (question) => {
    try {
      setSelectedQuestion(question);
      const answer = await generateAnswer(question, resumeData);
      setGeneratedAnswer(answer);
    } catch (err) {
      console.error('Failed to generate answer:', err);
    }
  };

  return (
    <div className="interview-prep-example">
      <h2>🎯 Interview Prep Assistant</h2>
      
      {/* Resume Data Input */}
      <div className="resume-input-section">
        <h3>Your Resume Info</h3>
        <input
          type="text"
          placeholder="Job Title"
          value={resumeData.jobTitle}
          onChange={(e) => setResumeData({ ...resumeData, jobTitle: e.target.value })}
        />
        <input
          type="text"
          placeholder="Skills (comma-separated)"
          value={resumeData.skills.join(', ')}
          onChange={(e) => setResumeData({ 
            ...resumeData, 
            skills: e.target.value.split(',').map(s => s.trim()) 
          })}
        />
        <input
          type="text"
          placeholder="Experience (e.g., 3 years)"
          value={resumeData.experience}
          onChange={(e) => setResumeData({ ...resumeData, experience: e.target.value })}
        />
        
        <button 
          onClick={handleGenerateQuestions}
          disabled={isGeneratingQuestions}
          className="generate-btn"
        >
          {isGeneratingQuestions ? '⏳ Generating...' : '✨ Generate Interview Questions'}
        </button>
        
        {isGeneratingQuestions && (
          <AIProviderBadge provider={null} isLoading={true} />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="questions-section">
          <div className="section-header">
            <h3>📋 Generated Questions ({questions.length})</h3>
            <button onClick={clearQuestions} className="clear-btn">Clear</button>
          </div>
          
          <div className="questions-list">
            {questions.map((question, index) => (
              <div key={index} className="question-item">
                <div className="question-number">{index + 1}</div>
                <div className="question-text">{question}</div>
                <button 
                  onClick={() => handleGenerateAnswer(question)}
                  disabled={isGeneratingAnswer}
                  className="answer-btn"
                >
                  {isGeneratingAnswer && selectedQuestion === question 
                    ? '⏳' 
                    : '💡 Get Answer'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Display */}
      {generatedAnswer && (
        <div className="answer-section">
          <h3>💬 Suggested Answer</h3>
          <div className="question-display">
            <strong>Q:</strong> {selectedQuestion}
          </div>
          <div className="answer-display">
            <strong>A:</strong> {generatedAnswer}
          </div>
          
          {isGeneratingAnswer && (
            <AIProviderBadge provider={null} isLoading={true} />
          )}
          
          <div className="answer-tips">
            <p><strong>💡 Tips:</strong></p>
            <ul>
              <li>Customize this answer with your own experiences</li>
              <li>Use the STAR method: Situation, Task, Action, Result</li>
              <li>Practice delivering your answer out loud</li>
              <li>Keep your answer concise (2-3 minutes)</li>
            </ul>
          </div>
        </div>
      )}

      {/* AI Info */}
      <div className="ai-info">
        <p>
          <strong>🤖 How it works:</strong> This feature uses Chrome AI when available 
          (fast, free, on-device) and automatically falls back to OpenAI (reliable, cloud-based) 
          when Chrome AI is unavailable.
        </p>
        <p>
          <strong>🚀 Chrome AI:</strong> Available in Chrome Canary with downloaded models<br />
          <strong>🌐 Cloud AI:</strong> Always available, uses OpenAI GPT-3.5
        </p>
      </div>
    </div>
  );
};

export default InterviewPrepExample;
