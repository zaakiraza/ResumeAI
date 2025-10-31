import React from 'react';
import './AIProviderBadge.css';

/**
 * Badge component to show which AI provider is being used
 * @param {Object} props
 * @param {string} props.provider - 'chrome' or 'openai' or null
 * @param {boolean} props.isLoading - Whether AI operation is in progress
 */
const AIProviderBadge = ({ provider, isLoading }) => {
  if (!provider && !isLoading) return null;

  const getBadgeConfig = () => {
    if (isLoading) {
      return {
        text: 'Processing...',
        icon: '⏳',
        className: 'loading'
      };
    }

    if (provider === 'chrome') {
      return {
        text: 'Chrome AI',
        icon: '🚀',
        className: 'chrome',
        tooltip: 'Using free on-device AI (Chrome Canary)'
      };
    }

    if (provider === 'openai') {
      return {
        text: 'Cloud AI',
        icon: '🌐',
        className: 'openai',
        tooltip: 'Using cloud-based AI (OpenAI)'
      };
    }

    return null;
  };

  const config = getBadgeConfig();
  if (!config) return null;

  return (
    <div 
      className={`ai-provider-badge ${config.className}`}
      title={config.tooltip}
    >
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-text">{config.text}</span>
    </div>
  );
};

export default AIProviderBadge;
