import React, { useState } from 'react';
import {
  FaRobot,
  FaFeatherAlt,
  FaBriefcase,
  FaListUl,
  FaGraduationCap,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { useAITools } from '../../../hooks/useAITools';
import './AITools.css';

const AITools = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const { generateContent: generateAIContent, loading: aiLoading, error: aiError } = useAITools();

  const tools = [
    {
      id: 'summary',
      icon: <FaRobot />,
      title: 'AI Summary Generator',
      description: 'Generate a professional summary for your resume using AI.'
    },
    {
      id: 'experience',
      icon: <FaBriefcase />,
      title: 'Experience Enhancer',
      description: 'Improve your work experience descriptions with AI suggestions.'
    },
    {
      id: 'skills',
      icon: <FaListUl />,
      title: 'Skills Analyzer',
      description: 'Get AI recommendations for relevant skills based on your experience.'
    },
    {
      id: 'education',
      icon: <FaGraduationCap />,
      title: 'Education Formatter',
      description: 'Format your educational background professionally.'
    },
    {
      id: 'cover-letter',
      icon: <FaFeatherAlt />,
      title: 'Cover Letter Assistant',
      description: 'Generate customized cover letters for your job applications.'
    }
  ];

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setInput('');
    setGeneratedContent('');
  };

  const handleCloseModal = () => {
    setSelectedTool(null);
    setInput('');
    setGeneratedContent('');
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      const content = await generateAIContent(selectedTool.id, input);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    }
  };

  return (
    <div className="ai-tools-container">
      <div className="ai-tools-header">
        <h1>AI Resume Tools</h1>
        <p>Enhance your resume with our AI-powered tools. Select a tool to get started.</p>
      </div>

      <div className="ai-tools-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="ai-tool-card">
            <div className="ai-tool-icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <button
              className="ai-tool-button"
              onClick={() => handleToolSelect(tool)}
            >
              Use Tool
            </button>
          </div>
        ))}
      </div>

      {selectedTool && (
        <div className="ai-modal">
          <div className="ai-modal-content">
            <div className="ai-modal-header">
              <h2>{selectedTool.title}</h2>
              <button className="ai-modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="ai-input-group">
              <label>
                {selectedTool.id === 'summary'
                  ? 'Enter your work experience and key achievements:'
                  : selectedTool.id === 'experience'
                  ? 'Enter your job description to enhance:'
                  : selectedTool.id === 'skills'
                  ? 'Enter your job titles and experience:'
                  : selectedTool.id === 'education'
                  ? 'Enter your education details:'
                  : 'Enter job description and your qualifications:'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text here..."
              />
            </div>

            <button
              className="ai-tool-button"
              onClick={handleSubmit}
              disabled={aiLoading || !input.trim()}
            >
              {aiLoading ? (
                <>
                  <FaSpinner className="loading-spinner" /> Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>

            {generatedContent && (
              <div className="ai-generated-content">
                <h3>Generated Content:</h3>
                <p>{generatedContent}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITools;
