import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import Navigation from "../components/Navigation";
import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import HowItWorks from "../components/sections/HowItWorks";
import Portfolio from "../components/sections/Portfolio";
import Approach from "../components/sections/Approach";
import Contact from "../components/sections/Contact";
import Footer from "../components/Footer";

const HomePage = () => {
  const [hasPortfolio, setHasPortfolio] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get("/portfolio")
      .then(({ data }) => {
        if (mounted) setHasPortfolio(Array.isArray(data) && data.length > 0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white relative" data-testid="home-page">
      <Navigation />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Approach />
        {hasPortfolio && <Portfolio />}
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
