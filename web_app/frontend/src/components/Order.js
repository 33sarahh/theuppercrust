import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Helper function to get image path
const getImagePath = (filename) => {
  return `/images/${encodeURIComponent(filename)}`;
};

function Order() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    apartment: '',
    breadQuantity: 0,
    jamQuantity: 0,
    deliveryDate: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    // Calculate minimum date (48 hours from now)
    const now = new Date();
    const minDateObj = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const year = minDateObj.getFullYear();
    const month = String(minDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(minDateObj.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 3) {
        value = `(${value}`;
      } else if (value.length <= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
      }
    }
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleApartmentInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({
      ...prev,
      apartment: value
    }));
  };

  const handleQuantityClick = (quantity, type) => {
    setFormData(prev => ({
      ...prev,
      [type === 'bread' ? 'breadQuantity' : 'jamQuantity']: quantity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate that at least one item is ordered
    if (parseInt(formData.breadQuantity) === 0 && parseInt(formData.jamQuantity) === 0) {
      setError('Please select at least one item to order (bread or jam).');
      setLoading(false);
      return;
    }

    // Validate date
    if (formData.deliveryDate < minDate) {
      setError('Please select a delivery date at least 48 hours from now.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      const orderData = await response.json();
      console.log('Order submitted:', orderData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <header>
          <Link to="/" className="logo-link">
            <h1 className="logo">upper crust</h1>
          </Link>
        </header>
        <main className="order-main">
          <div className="order-confirmation">
            <div className="confirmation-content">
              <h2>Order Confirmed!</h2>
              <p>Thank you for your order. We'll see you soon!</p>
              <Link to="/" className="cta-button">Back to Home</Link>
            </div>
          </div>
        </main>
        <footer>
          <p>© 2024 upper crust. Made with care, delivered with love.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <Link to="/" className="logo-link">
          <h1 className="logo">upper crust</h1>
        </Link>
      </header>
      
      <main className="order-main">
        <section className="order-section">
          {/* Left column: Bread image with film grain */}
          <div className="order-image-wrapper">
            <img 
              src={getImagePath('jam and cream grain.jpg')}
              alt="Jam and cream on bread" 
              className="order-image grain-overlay" 
            />
            <div className="film-grain"></div>
          </div>
          
          {/* Right column: Order form */}
          <div className="order-form-container">
            <h2 className="order-title">Place Your Order</h2>
            <p className="order-subtitle">Fresh ciabatta, made to order and delivered to your door</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="order-form">
              {/* Customer Information */}
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  required 
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handlePhoneInput}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="apartment">Apartment Number</label>
                <input 
                  type="text" 
                  id="apartment" 
                  name="apartment" 
                  required 
                  placeholder="4 digits" 
                  pattern="[0-9]{4}" 
                  maxLength="4"
                  value={formData.apartment}
                  onChange={handleApartmentInput}
                />
                <small className="form-hint">4-digit apartment number</small>
              </div>
              
              {/* Bread Quantity Selection */}
              <div className="form-group">
                <label htmlFor="breadQuantity">Number of Loaves</label>
                <div className="quantity-selector">
                  <button 
                    type="button" 
                    className={`quantity-btn ${formData.breadQuantity === 0 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(0, 'bread')}
                  >
                    None
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn ${formData.breadQuantity === 1 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(1, 'bread')}
                  >
                    1 Loaf
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn ${formData.breadQuantity === 2 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(2, 'bread')}
                  >
                    2 Loaves
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn ${formData.breadQuantity === 3 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(3, 'bread')}
                  >
                    3 Loaves
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="breadQuantity" 
                  name="breadQuantity" 
                  value={formData.breadQuantity} 
                  required 
                />
              </div>
              
              {/* Jam Selection */}
              <div className="form-group">
                <label htmlFor="jamQuantity">
                  Jam of the Week <span className="supplies-tag">While Supplies Last</span>
                </label>
                <div className="quantity-selector">
                  <button 
                    type="button" 
                    className={`quantity-btn jam-btn ${formData.jamQuantity === 0 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(0, 'jam')}
                  >
                    None
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn jam-btn ${formData.jamQuantity === 1 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(1, 'jam')}
                  >
                    1 Jar
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn jam-btn ${formData.jamQuantity === 2 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(2, 'jam')}
                  >
                    2 Jars
                  </button>
                  <button 
                    type="button" 
                    className={`quantity-btn jam-btn ${formData.jamQuantity === 3 ? 'active' : ''}`}
                    onClick={() => handleQuantityClick(3, 'jam')}
                  >
                    3 Jars
                  </button>
                </div>
                <input 
                  type="hidden" 
                  id="jamQuantity" 
                  name="jamQuantity" 
                  value={formData.jamQuantity} 
                  required 
                />
              </div>
              
              {/* Delivery Date */}
              <div className="form-group">
                <label htmlFor="deliveryDate">Delivery Date</label>
                <input 
                  type="date" 
                  id="deliveryDate" 
                  name="deliveryDate" 
                  required
                  min={minDate}
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                />
                <small className="form-hint">Orders must be placed at least 48 hours in advance</small>
              </div>
              
              {/* Notes for Baker */}
              <div className="form-group">
                <label htmlFor="notes">Notes for the Baker</label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  rows="4" 
                  placeholder="Optional: Let me know if you have any special requests..."
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </section>
      </main>
      
      <footer>
        <p>© 2024 upper crust. Made with care, delivered with love.</p>
      </footer>
    </div>
  );
}

export default Order;
