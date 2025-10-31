import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLanguageModel from '../../../hooks/useLanguageModel';
import { FaBrain, FaQuestionCircle, FaLightbulb, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';
import './InterviewPrep.css';

const InterviewPrep = () => {
  const navigate = useNavigate();
  const {
    generateInterviewQuestions,
    promptStreaming,
    isProcessing,
    streamingResponse,
    clear
  } = useLanguageModel();

  const [jobRole, setJobRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Parse generated questions
  const parseQuestions = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsedQuestions = [];
    
    lines.forEach(line => {
      // Match patterns like "1. ", "Q1:", "Question 1:", etc.
      const match = line.match(/^(?:\d+[\.\)]\s*|Q\d+:?\s*|Question\s+\d+:?\s*)?(.+)/i);
      if (match && match[1].trim().length > 10) {
        parsedQuestions.push(match[1].trim());
      }
    });

    return parsedQuestions.slice(0, 10); // Limit to 10 questions
  };

  // Generate questions
  const handleGenerateQuestions = async () => {
    if (!jobRole.trim()) {
      alert('Please enter a job role');
      return;
    }

    clear();
    setQuestions([]);
    setSelectedQuestion(null);
    setUserAnswer('');
    setFeedback('');

    try {
      const resumeData = {
        experience: experience || 'No experience provided',
        skills: skills || 'No skills provided',
        education: education || 'No education provided'
      };

      const response = await generateInterviewQuestions(resumeData, jobRole);
      const parsedQuestions = parseQuestions(response);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please make sure Chrome AI is available.');
    }
  };

  // Get feedback on user's answer
  const handleGetFeedback = async () => {
    if (!userAnswer.trim()) {
      alert('Please write an answer first');
      return;
    }

    setLoadingFeedback(true);
    setFeedback('');

    try {
      const prompt = `You are an interview coach. A candidate answered this interview question: "${questions[selectedQuestion]}"\n\nTheir answer: "${userAnswer}"\n\nProvide constructive feedback on their answer, including:\n1. What was good about the answer\n2. What could be improved\n3. Suggestions for a better response\n\nBe encouraging but honest.`;

      let fullFeedback = '';
      await promptStreaming(prompt, {
        context: 'Interview feedback and coaching',
        temperature: 0.7
      }, (chunk) => {
        fullFeedback = chunk;
        setFeedback(chunk);
      });

    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Failed to get feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="interview-prep-page">
      <div className="interview-prep-hero">
        <div className="interview-prep-container">
          <h1>
            <FaBrain /> AI Interview Preparation
          </h1>
          <p>Generate personalized interview questions and practice with AI-powered feedback</p>
        </div>
      </div>

      <div className="interview-prep-container">
        {/* Input Section */}
        <div className="interview-prep-input-section">
          <h2>
            <FaLightbulb /> Tell Us About Yourself
          </h2>
          
          <div className="form-group">
            <label htmlFor="jobRole">
              Target Job Role <span className="required">*</span>
            </label>
            <input
              id="jobRole"
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Frontend Developer, Product Manager, Data Analyst"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Work Experience</label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Briefly describe your work experience (optional but recommended)"
              rows="3"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Key Skills</label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Python, Project Management, Communication"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="education">Education Background</label>
            <input
              id="education"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g., BS in Computer Science, MBA"
              className="form-input"
            />
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerateQuestions}
            disabled={isProcessing || !jobRole.trim()}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="spinner" /> Generating Questions...
              </>
            ) : (
              <>
                <FaBrain /> Generate Interview Questions
              </>
            )}
          </button>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="interview-prep-questions-section">
            <h2>
              <FaQuestionCircle /> Your Interview Questions
            </h2>
            <p className="section-subtitle">
              Click on any question to practice and get AI feedback on your answer
            </p>

            <div className="questions-list">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className={`question-card ${selectedQuestion === index ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedQuestion(index);
                    setUserAnswer('');
                    setFeedback('');
                  }}
                >
                  <div className="question-number">Q{index + 1}</div>
                  <div className="question-text">{question}</div>
                  {selectedQuestion === index && (
                    <FaChevronUp className="chevron" />
                  )}
                  {selectedQuestion !== index && (
                    <FaChevronDown className="chevron" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Section */}
        {selectedQuestion !== null && (
          <div className="interview-prep-practice-section">
            <h2>Practice Your Answer</h2>
            <div className="selected-question">
              <strong>Question:</strong> {questions[selectedQuestion]}
            </div>

            <div className="form-group">
              <label htmlFor="userAnswer">Your Answer</label>
              <textarea
                id="userAnswer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="6"
                className="form-textarea"
              />
            </div>

            <button
              className="feedback-btn"
              onClick={handleGetFeedback}
              disabled={loadingFeedback || !userAnswer.trim()}
            >
              {loadingFeedback ? (
                <>
                  <FaSpinner className="spinner" /> Analyzing Your Answer...
                </>
              ) : (
                <>
                  <FaBrain /> Get AI Feedback
                </>
              )}
            </button>

            {/* Feedback Display */}
            {feedback && (
              <div className="feedback-section">
                <h3>
                  <FaLightbulb /> AI Feedback
                </h3>
                <div className="feedback-content">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && !isProcessing && (
          <div className="empty-state">
            <FaQuestionCircle className="empty-icon" />
            <h3>Ready to Practice?</h3>
            <p>
              Fill in your job role and background information above, then click "Generate Interview Questions" 
              to get personalized questions based on your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
