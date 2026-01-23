import React from 'react';
import { Link } from 'react-router-dom';

// Helper function to get image path
const getImagePath = (filename) => {
  return `/images/${encodeURIComponent(filename)}`;
};

function Home() {
  return (
    <>
      <header className="site-header">
        <h1 className="business-name">upper crust</h1>
      </header>
      <div className="container">
        {/* Bread Section */}
        <section className="hero-section">
          <div className="hero-image-wrapper">
            <img 
              src={getImagePath('With font.jpg')}
              alt="Fresh round ciabatta bread" 
              className="hero-image grain-overlay" 
            />
            <div className="hero-button-overlay">
              <Link to="/order" className="cta-button hero-cta">knead a loaf?</Link>
            </div>
          </div>
        </section>

        {/* Jam Section */}
        <section className="jam-section">
          <div className="jam-images-wrapper">
            <img 
              src={getImagePath('jam 02.jpg')}
              alt="Homemade jam in jars" 
              className="jam-image jam-image-02 grain-overlay" 
            />
            <img 
              src={getImagePath('jam01.jpg')}
              alt="Homemade jam in jars" 
              className="jam-image jam-image-01 grain-overlay" 
            />
          </div>
          <div className="jam-content">
            <h2 className="section-heading">spread the word</h2>
            <p className="jam-blurb">
              I make jams too! Every week, I make a different fresh batch using simple ingredients and old-fashioned methods. Only available while supplies last! Made to be spread on good bread.
            </p>
            <Link to="/order" className="cta-button">let's get jamming</Link>
          </div>
        </section>

        {/* Meet the Chef Section */}
        <section className="chef-section">
          <div className="chef-image-wrapper">
            <img 
              src={getImagePath('new headshot.jpg')}
              alt="Baker portrait" 
              className="chef-image grain-overlay" 
            />
          </div>
          <div className="chef-content">
            <h2 className="section-heading">Bread has always been the center of my table.</h2>
            <p className="chef-blurb">
              I grew up in a household where fresh bread was a daily staple (often topped simply with butter, jam, salami, or cheese) straight from the local bakery. When we moved states, my health-conscious Romanian mother perfected a four-ingredient ciabatta recipe using French flour. When I moved to university, I brought that recipe—and my trusty Dutch oven—to UATX, where I bake it fresh and share it here.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;
