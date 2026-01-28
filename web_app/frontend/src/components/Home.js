import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper function to get image path
const getImagePath = (filename) => {
  return `/images/${encodeURIComponent(filename)}`;
};

function Home() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'the upper crust - Breaking bread, not your schedule';
  }, []);

  return (
    <>
      <header className="site-header">
        <h1 className="business-name">the upper crust</h1>
        <div className="header-auth">
          {user ? (
            <Link to="/dashboard" className="profile-link">
              <img 
                src={getImagePath('profile_bread.jpg')} 
                alt="Profile" 
                className="header-avatar"
              />
            </Link>
          ) : (
            <Link to="/login" className="auth-link">Sign In</Link>
          )}
        </div>
      </header>
      {/* Bread Section */}
      <section className="hero-section">
        <div className="hero-image-wrapper">
          <img 
            src={getImagePath('3_posters.jpg')}
            alt="Fresh round ciabatta bread" 
            className="hero-image grain-overlay" 
          />
          <div className="hero-button-overlay">
            <Link to="/register" className="cta-button hero-cta">knead a loaf?</Link>
          </div>
        </div>
      </section>
      <div className="container">
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
