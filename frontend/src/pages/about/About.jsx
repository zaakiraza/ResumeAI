import React from "react";
import Footer from "../../components/footer/Footer";
import "./About.css";

const About = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="about-page-hero">
        <div className="about-page-container">
          <div className="about-page-hero-content">
            <h1 className="about-page-hero-title">
              Our Story – Empowering Job Seekers to Succeed with AI
            </h1>
            <p className="about-page-hero-subtitle">
              At ResumeAI, we leverage cutting-edge AI technology to help job seekers create 
              professional resumes quickly and easily. We're passionate about making job 
              applications easier for everyone.
            </p>
            <button className="about-page-cta-btn">
              Start Building Your Resume
            </button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-page-mission">
        <div className="about-page-container">
          <div className="about-page-mission-grid">
            <div className="about-page-mission-card">
              <h2 className="about-page-card-title">Our Mission</h2>
              <p className="about-page-card-text">
                Our mission is to empower job seekers with the tools they need to craft 
                standout resumes in minutes using AI technology. We aim to make resume 
                creation easy, fast, and effective for everyone, no matter their industry 
                or experience level.
              </p>
            </div>
            <div className="about-page-vision-card">
              <h2 className="about-page-card-title">Our Vision</h2>
              <p className="about-page-card-text">
                We envision a world where every job seeker has the opportunity to present 
                their best professional self, quickly and efficiently. Our goal is to reach 
                millions of professionals globally and help them secure their dream jobs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Story of ResumeAI */}
      <section className="about-page-story">
        <div className="about-page-container">
          <h2 className="about-page-section-title">The Story of ResumeAI</h2>
          <div className="about-page-story-content">
            <div>
              <p className="about-page-story-text">
                ResumeAI was founded by a team of passionate tech professionals who wanted to 
                simplify the job application process. Recognizing the challenges job seekers 
                face in creating tailored and error-free resumes, we developed an AI-powered 
                platform that helps them generate, proofread, and customize their resumes in 
                just a few clicks.
              </p>
              <p className="about-page-story-text">
                Our goal was to democratize the resume-building process and ensure anyone, 
                anywhere could create a standout resume with ease. We believe that everyone 
                deserves the opportunity to present their professional story in the best 
                possible way.
              </p>
            </div>
            <div className="about-page-story-visual">
              <h4>Powered by AI & Data</h4>
              <div className="about-page-story-stats">
                <div className="about-page-story-stat">AI-powered content generation</div>
                <div className="about-page-story-stat">Real-time grammar checking</div>
                <div className="about-page-story-stat">Industry-specific templates</div>
                <div className="about-page-story-stat">ATS optimization</div>
                <div className="about-page-story-stat">Multi-format exports</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="about-page-team">
        <div className="about-page-container">
          <h2 className="about-page-section-title">Meet the Team</h2>
          <p className="about-page-team-intro">
            Meet the passionate team behind ResumeAI – a group of AI enthusiasts, engineers, 
            and designers working together to revolutionize job applications.
          </p>
          <div className="about-page-team-grid">
            <div className="about-page-team-member">
              <div className="about-page-member-photo">
                <div className="about-page-photo-placeholder">JD</div>
              </div>
              <h3 className="about-page-member-name">John Doe</h3>
              <p className="about-page-member-role">Co-Founder & CEO</p>
              <p className="about-page-member-quote">
                "I've always believed that technology should work for people. At ResumeAI, 
                we're doing just that!"
              </p>
            </div>
            <div className="about-page-team-member">
              <div className="about-page-member-photo">
                <div className="about-page-photo-placeholder">JS</div>
              </div>
              <h3 className="about-page-member-name">Jane Smith</h3>
              <p className="about-page-member-role">Head of Product</p>
              <p className="about-page-member-quote">
                "Creating tools that truly help people get hired is what drives me. Every 
                line of code is focused on making resume-building easier for you."
              </p>
            </div>
            <div className="about-page-team-member">
              <div className="about-page-member-photo">
                <div className="about-page-photo-placeholder">MJ</div>
              </div>
              <h3 className="about-page-member-name">Mike Johnson</h3>
              <p className="about-page-member-role">Lead AI Engineer</p>
              <p className="about-page-member-quote">
                "Building AI that genuinely helps people succeed in their careers is incredibly 
                rewarding. We're making dreams come true, one resume at a time."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-page-values">
        <div className="about-page-container">
          <h2 className="about-page-section-title">Our Core Values</h2>
          <div className="about-page-values-grid">
            <div className="about-page-value-card">
              <div className="about-page-value-icon">�</div>
              <h3 className="about-page-value-title">Innovation</h3>
              <p className="about-page-value-text">
                We continuously improve our platform to provide the most advanced AI tools 
                for resume building and career advancement.
              </p>
            </div>
            <div className="about-page-value-card">
              <div className="about-page-value-icon">🎯</div>
              <h3 className="about-page-value-title">Customer Focus</h3>
              <p className="about-page-value-text">
                Our users are at the center of everything we do. We listen and evolve to 
                meet their needs and exceed expectations.
              </p>
            </div>
            <div className="about-page-value-card">
              <div className="about-page-value-icon">⭐</div>
              <h3 className="about-page-value-title">Quality</h3>
              <p className="about-page-value-text">
                We believe in providing top-tier quality in every resume generated through 
                our platform with attention to detail.
              </p>
            </div>
            <div className="about-page-value-card">
              <div className="about-page-value-icon">🤝</div>
              <h3 className="about-page-value-title">Accessibility</h3>
              <p className="about-page-value-text">
                Making professional resume building accessible to everyone, regardless of 
                their background or technical expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="about-page-testimonials">
        <div className="about-page-container">
          <h2 className="about-page-section-title">Success Stories</h2>
          <div className="about-page-testimonials-grid">
            <div className="about-page-testimonial">
              <div className="about-page-testimonial-content">
                <p className="about-page-testimonial-text">
                  "I was able to create a professional resume in just 15 minutes! I felt 
                  confident applying to jobs and landed my first interview within a week. 
                  Thanks, ResumeAI!"
                </p>
                <div className="about-page-testimonial-author">
                  <strong>— Alex S.</strong>
                  <span>Software Developer</span>
                </div>
              </div>
            </div>
            <div className="about-page-testimonial">
              <div className="about-page-testimonial-content">
                <p className="about-page-testimonial-text">
                  "The AI suggestions were spot-on and helped me highlight skills I hadn't 
                  even thought of. Got three interview calls in my first week of applications!"
                </p>
                <div className="about-page-testimonial-author">
                  <strong>— Maria L.</strong>
                  <span>Marketing Manager</span>
                </div>
              </div>
            </div>
            <div className="about-page-testimonial">
              <div className="about-page-testimonial-content">
                <p className="about-page-testimonial-text">
                  "As a recent graduate, I was struggling with resume writing. ResumeAI 
                  made it so easy and professional. Highly recommend!"
                </p>
                <div className="about-page-testimonial-author">
                  <strong>— David R.</strong>
                  <span>Recent Graduate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-page-final-cta">
        <div className="about-page-container">
          <div className="about-page-cta-content">
            <h2 className="about-page-cta-title">Ready to create your perfect resume?</h2>
            <p className="about-page-cta-subtitle">
              Join thousands of successful job seekers who've transformed their careers with ResumeAI
            </p>
            <button className="about-page-cta-btn about-page-cta-btn-large">
              Start Building Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
