import React from "react";
import HeroSection from "../../components/heroSection/HeroSection";
import AboutUs from "../../components/aboutUs/AboutUs";
import Services from "../../components/services/Services";
import Contact from "../../components/contact/Contact";
import Footer from "../../components/footer/Footer";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <AboutUs />
      <Services />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;
