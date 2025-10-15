import React from "react";
import HeroSection from "../../../components/PublicComponents/heroSection/HeroSection";
import AboutUs from "../../../components/PublicComponents/aboutUs/AboutUs";
import Services from "../../../components/PublicComponents/services/Services";
import Contact from "../../../components/PublicComponents/contact/Contact";
import Footer from "../../../components/PublicComponents/footer/Footer";

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
