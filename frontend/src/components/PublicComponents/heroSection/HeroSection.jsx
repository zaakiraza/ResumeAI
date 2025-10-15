import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Create Your Perfect Resume with AI in Minutes",
      subtitle: "Generate, Proofread, and Customize Your Resume Effortlessly",
      ctaText: "Get Started",
      ctaLink: "/signup",
      background: "gradient-1",
    },
    {
      id: 2,
      title: "AI-Powered Content Generation",
      subtitle:
        "Write impactful job descriptions, skills, and education in seconds.",
      ctaText: "Learn More",
      ctaLink: "/about",
      background: "gradient-2",
    },
    {
      id: 3,
      title: "Create Resumes in Multiple Languages",
      subtitle: "Reach a global job market with multilingual resume options.",
      ctaText: "Try for Free",
      ctaLink: "/signin",
      background: "gradient-3",
    },
    {
      id: 4,
      title: "Perfect Your Resume with Real-Time Grammar Checks",
      subtitle:
        "Let AI fix errors and suggest improvements for flawless resumes.",
      ctaText: "Start Now",
      ctaLink: "/signup",
      background: "gradient-4",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <div
      className="hero-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slider Container */}
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${slide.background} ${
              index === currentSlide
                ? "active"
                : index === currentSlide - 1 ||
                  (currentSlide === 0 && index === slides.length - 1)
                ? "prev"
                : "next"
            }`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
            }}
          >
            <div className="slide-content">
              <div className="slide-text">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <Link to={slide.ctaLink} className="cta-btn">
                  {slide.ctaText}
                  <span className="cta-arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className="slider-nav prev-btn"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      <button
        className="slider-nav next-btn"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="9,6 15,12 9,18"></polyline>
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="slider-pagination">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`pagination-dot ${
              index === currentSlide ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

export default HeroSection;
