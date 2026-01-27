import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper function to get image path
const getImagePath = (filename) => {
  return `/images/${encodeURIComponent(filename)}`;
};

function Order() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    breadQuantity: 0,
    jamQuantity: 0,
    deliveryDate: '',
    notes: '',
    isRecurring: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    // Set page title
    document.title = 'Place Your Order | the upper crust';
    
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/login', { state: { from: { pathname: '/order' } } });
      return;
    }

    // Handle prefilled data from reorder
    if (location.state?.prefill) {
      const prefill = location.state.prefill;
      setFormData(prev => ({
        ...prev,
        breadQuantity: prefill.breadQuantity || 0,
        jamQuantity: prefill.jamQuantity || 0,
        notes: prefill.notes || ''
      }));
    }
    
    // Calculate minimum date (48 hours from now)
    const now = new Date();
    const minDateObj = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const year = minDateObj.getFullYear();
    const month = String(minDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(minDateObj.getDate()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}`);
  }, [user, authLoading, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
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
        credentials: 'include',
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

  if (authLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (submitted) {
    return (
      <div className="container">
        <header>
          <Link to="/" className="logo-link">
            <h1 className="logo">the upper crust</h1>
          </Link>
        </header>
        <main className="order-main">
          <div className="order-confirmation">
            <div className="confirmation-content">
              <h2>Order Confirmed!</h2>
              <p>Thank you for your order. We'll see you soon!</p>
              <div className="confirmation-actions">
                <Link to="/dashboard" className="cta-button">View My Orders</Link>
                <Link to="/" className="cta-button secondary">Back to Home</Link>
              </div>
            </div>
          </div>
        </main>
        <footer>
          <p>© 2024 the upper crust. Made with care, delivered with love.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <Link to="/" className="logo-link">
          <h1 className="logo">the upper crust</h1>
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
            <p className="order-user-info">Ordering as: {user.firstName} {user.lastName} (Apt {user.apartment})</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="order-form">
              
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
              
              {/* Recurring Order Option */}
              <div className="form-group">
                <label className="recurring-checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="recurring-checkbox"
                  />
                  <span>Make this a weekly recurring order</span>
                </label>
                <small className="form-hint">Your order will automatically repeat every week</small>
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
        <p>© 2024 the upper crust. Made with care, delivered with love.</p>
      </footer>
    </div>
  );
}

export default Order;
