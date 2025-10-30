import { Link } from "react-router-dom";
import "./Services.css";
import Footer from "../../../components/PublicComponents/footer/Footer";

const Services = () => {
  const services = [
    {
      id: 1,
      title: "AI-Powered Resume Creation",
      description:
        "Automatically generate a professional resume tailored to your experience. Input your information, and let our AI craft personalized content, proofread for grammar, and design your perfect resume.",
      icon: "�",
      ctaText: "Get Started",
      ctaLink: "/create-resume",
    },
    {
      id: 2,
      title: "Real-Time Grammar Check",
      description:
        "Our AI-powered proofreading system ensures that your resume is error-free and professionally formatted. Let our platform catch any mistakes and elevate your resume to the highest standards.",
      icon: "✅",
      ctaText: "Learn More",
      ctaLink: "/create-resume",
    },
    {
      id: 3,
      title: "Multilingual Support",
      description:
        "Build resumes in multiple languages and tap into global job markets. ResumeAI supports over 50 languages, giving you the opportunity to apply for jobs around the world.",
      icon: "🌍",
      ctaText: "Explore More",
      ctaLink: "/create-resume",
    },
    {
      id: 4,
      title: "Customizable Templates",
      description:
        "Choose from a variety of professionally designed templates and customize them to fit your unique career goals. ResumeAI gives you the flexibility to create a resume that reflects your professional image.",
      icon: "�",
      ctaText: "See Templates",
      ctaLink: "/templates",
    },
  ];

  const keyFeatures = [
    {
      icon: "⚡",
      title: "Smart & Fast",
      description: "Speedy resume creation powered by AI",
    },
    {
      icon: "🔍",
      title: "Error-Free",
      description: "Automatic proofreading and grammar checks",
    },
    {
      icon: "🌐",
      title: "Global Reach",
      description: "Multilingual support for resumes in different languages",
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      icon: "📝",
      title: "Input Your Details",
      description:
        "Enter your personal information, work experience, education, and career goals.",
    },
    {
      step: 2,
      icon: "🪄",
      title: "AI Magic Happens",
      description:
        "ResumeAI generates personalized content, proofreads for grammar, and provides design options.",
    },
    {
      step: 3,
      icon: "🚀",
      title: "Download & Apply",
      description:
        "Download your polished resume and start applying for jobs immediately!",
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "I was able to create a professional resume in just 15 minutes! I felt confident applying to jobs and landed my first interview within a week. Thanks, ResumeAI",
      author: "Mohsin",
      position: "Software Developer",
    },
    {
      id: 2,
      text: "The AI suggestions were spot-on and helped me highlight skills I hadn't even thought of. Got three interview calls in my first week of applications!",
      author: "Adeeb",
      position: "SQA Engineer",
    },
    {
      id: 3,
      text: "As a recent graduate, I was struggling with resume writing. ResumeAI made it so easy and professional. Highly recommend!",
      author: "Raza",
      position: "Full Stack Developer",
    },
  ];

  // const pricingPlans = [
  //   {
  //     id: 1,
  //     name: "Free Plan",
  //     price: "$0",
  //     period: "/month",
  //     features: [
  //       "Resume Creation",
  //       "Basic Template",
  //       "Grammar Check",
  //       "PDF Download",
  //     ],
  //     ctaText: "Get Started",
  //     ctaLink: "/signin",
  //     popular: false,
  //   },
  //   {
  //     id: 2,
  //     name: "Premium Plan",
  //     price: "$9.99",
  //     period: "/month",
  //     features: [
  //       "All Features",
  //       "Unlimited Templates",
  //       "Priority Support",
  //       "Cover Letter Builder",
  //       "ATS Optimization",
  //     ],
  //     ctaText: "Start Premium",
  //     ctaLink: "/premium",
  //     popular: true,
  //   },
  //   {
  //     id: 3,
  //     name: "Enterprise Plan",
  //     price: "$29.99",
  //     period: "/month",
  //     features: [
  //       "Custom Solutions for Teams",
  //       "Bulk Resume Creation",
  //       "Advanced Analytics",
  //       "Dedicated Support",
  //       "API Access",
  //     ],
  //     ctaText: "Contact Sales",
  //     ctaLink: "/enterprise",
  //     popular: false,
  //   },
  // ];

  return (
    <>
      {/* Hero Section */}
      <section className="services-page-hero">
        <div className="services-page-container">
          <div className="services-page-hero-content">
            <h1 className="services-page-hero-title">
              Our Powerful Services to Build Your Perfect Resume
            </h1>
            <p className="services-page-hero-subtitle">
              Explore the features and services that make ResumeAI the ultimate
              resume-building platform.
            </p>
            <div className="services-page-hero-buttons">
              <Link
                to="/signup"
                className="services-page-btn services-page-btn-primary"
              >
                Start Building Your Resume
              </Link>
              {/* <a href="/register" className="services-page-btn services-page-btn-primary">
                Start Building Your Resume
              </a> */}
              <Link
                to="/services"
                className="services-page-btn services-page-btn-secondary"
              >
                Explore All Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Services Section */}
      <section className="services-page-detailed">
        <div className="services-page-container">
          <h2 className="services-page-section-title">
            Our Comprehensive Services
          </h2>
          <div className="services-page-grid">
            {services.map((service) => (
              <div key={service.id} className="services-page-card">
                <div className="services-page-card-icon">
                  <span className="services-page-icon-emoji">
                    {service.icon}
                  </span>
                </div>
                <div className="services-page-card-content">
                  <h3 className="services-page-card-title">{service.title}</h3>
                  <p className="services-page-card-description">
                    {service.description}
                  </p>
                </div>
                <div className="services-page-card-footer">
                  <a href={service.ctaLink} className="services-page-card-cta">
                    {service.ctaText}
                    <span className="services-page-cta-arrow">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="services-page-features">
        <div className="services-page-container">
          <h2 className="services-page-section-title">Why Choose ResumeAI?</h2>
          <div className="services-page-features-grid">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="services-page-feature-card">
                <div className="services-page-feature-icon">{feature.icon}</div>
                <h3 className="services-page-feature-title">{feature.title}</h3>
                <p className="services-page-feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="services-page-how-it-works">
        <div className="services-page-container">
          <h2 className="services-page-section-title">How It Works</h2>
          <p className="services-page-section-subtitle">
            Create your professional resume in just three simple steps
          </p>
          <div className="services-page-steps-container">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="services-page-step-card">
                <div className="services-page-step-number">{step.step}</div>
                <div className="services-page-step-icon">{step.icon}</div>
                <div className="services-page-step-content">
                  <h3 className="services-page-step-title">{step.title}</h3>
                  <p className="services-page-step-description">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="services-page-testimonials">
        <div className="services-page-container">
          <h2 className="services-page-section-title">Success Stories</h2>
          <p className="services-page-section-subtitle">
            See how ResumeAI has transformed careers
          </p>
          <div className="services-page-testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="services-page-testimonial">
                <div className="services-page-testimonial-content">
                  <p className="services-page-testimonial-text">
                    "{testimonial.text}"
                  </p>
                  <div className="services-page-testimonial-author">
                    <strong>{testimonial.author}</strong>
                    <span>{testimonial.position}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      {/* <section className="services-page-pricing">
        <div className="services-page-container">
          <h2 className="services-page-section-title">Choose Your Plan</h2>
          <p className="services-page-section-subtitle">
            Select the perfect plan for your career goals
          </p>
          <div className="services-page-pricing-grid">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`services-page-pricing-card ${
                  plan.popular ? "services-page-pricing-popular" : ""
                }`}
              >
                {plan.popular && (
                  <div className="services-page-popular-badge">
                    Most Popular
                  </div>
                )}
                <div className="services-page-pricing-header">
                  <h3 className="services-page-pricing-name">{plan.name}</h3>
                  <div className="services-page-pricing-price">
                    <span className="services-page-price-amount">
                      {plan.price}
                    </span>
                    <span className="services-page-price-period">
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="services-page-pricing-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="services-page-pricing-feature">
                      <span className="services-page-feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaLink}
                  className={`services-page-pricing-cta ${
                    plan.popular
                      ? "services-page-pricing-cta-primary"
                      : "services-page-pricing-cta-secondary"
                  }`}
                >
                  {plan.ctaText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="services-page-final-cta">
        <div className="services-page-container">
          <div className="services-page-cta-content">
            <h2 className="services-page-cta-title">
              Ready to create your perfect resume?
            </h2>
            <p className="services-page-cta-subtitle">
              Join thousands of professionals who have transformed their resumes
              with ResumeAI.
            </p>
            <div className="services-page-cta-buttons">
              <Link
                to={"/signup"}
                className="services-page-btn services-page-btn-primary services-page-btn-large"
              >
                Start Building Your Resume
              </Link>
              {/* <a
                href="/register"
                className="services-page-btn services-page-btn-primary services-page-btn-large"
              >
                Start Building Your Resume
              </a> */}
              <Link
                to={"/services"}
                className="services-page-btn services-page-btn-secondary services-page-btn-large"
              >
                Explore All Features
              </Link>
              {/* <a
                href="/features"
                className="services-page-btn services-page-btn-secondary services-page-btn-large"
              >
                Explore All Features
              </a> */}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Services;
