import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Helper function to get image path
const getImagePath = (filename) => {
  return `/images/${encodeURIComponent(filename)}`;
};

function Admin() {
  const [calendarData, setCalendarData] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'users'

  useEffect(() => {
    fetchCalendarData();
    fetchUsers();
    fetchOrders();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const response = await fetch('/api/admin/calendar');
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDatesInRange = () => {
    const dates = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 60); // Show next 60 days

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (dateKey) => {
    if (calendarData[dateKey] && calendarData[dateKey].length > 0) {
      setSelectedDate(dateKey);
      setSelectedOrder(null);
    }
  };

  const handleOrderClick = (orderId) => {
    fetchOrderDetails(orderId);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <Link to="/" className="logo-link">
          <h1 className="logo">the upper crust - Admin</h1>
        </Link>
      </header>

      <main className="admin-main">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            Delivery Calendar
          </button>
          <button
            className={`tab-button ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => setActiveView('users')}
          >
            All Users & Orders
          </button>
        </div>

        {activeView === 'calendar' && (
          <div className="calendar-view">
            <h2>Delivery Calendar</h2>
            <div className="calendar-grid">
              {getDatesInRange().map((date) => {
                const dateKey = formatDateKey(date);
                const dayOrders = calendarData[dateKey] || [];
                const isToday = formatDateKey(new Date()) === dateKey;
                const isPast = date < new Date() && !isToday;

                return (
                  <div
                    key={dateKey}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${dayOrders.length > 0 ? 'has-orders' : ''}`}
                    onClick={() => handleDateClick(dateKey)}
                  >
                    <div className="calendar-day-header">
                      <div className="calendar-date">{date.getDate()}</div>
                      <div className="calendar-day-name">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                    {dayOrders.length > 0 && (
                      <div className="calendar-orders">
                        {dayOrders.slice(0, 3).map((order) => (
                          <div
                            key={order.id}
                            className="calendar-order-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderClick(order.id);
                            }}
                          >
                            <img
                              src={getImagePath('profile_bread.jpg')}
                              alt="User"
                              className="calendar-avatar"
                            />
                            <span className="calendar-order-name">
                              {order.firstName} {order.lastName}
                            </span>
                            <span className="calendar-order-items">
                              {order.breadQuantity > 0 && `${order.breadQuantity} bread`}
                              {order.breadQuantity > 0 && order.jamQuantity > 0 && ', '}
                              {order.jamQuantity > 0 && `${order.jamQuantity} jam`}
                            </span>
                          </div>
                        ))}
                        {dayOrders.length > 3 && (
                          <div className="calendar-more">+{dayOrders.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDate && calendarData[selectedDate] && (
              <div className="selected-date-orders">
                <h3>Orders for {formatDate(selectedDate)}</h3>
                <div className="date-orders-list">
                  {calendarData[selectedDate].map((order) => (
                    <div
                      key={order.id}
                      className="date-order-card"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <div className="date-order-header">
                        <img
                          src={getImagePath('profile_bread.jpg')}
                          alt="User"
                          className="date-order-avatar"
                        />
                        <div>
                          <h4>{order.firstName} {order.lastName}</h4>
                          <p>Apt {order.apartment} • {order.phone}</p>
                        </div>
                      </div>
                      <div className="date-order-details">
                        <p><strong>Bread:</strong> {order.breadQuantity} {order.breadQuantity === 1 ? 'loaf' : 'loaves'}</p>
                        <p><strong>Jam:</strong> {order.jamQuantity} {order.jamQuantity === 1 ? 'jar' : 'jars'}</p>
                        {order.isRecurring && <p><strong>Recurring:</strong> Weekly</p>}
                        {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder && (
              <div className="order-detail-modal" onClick={() => setSelectedOrder(null)}>
                <div className="order-detail-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-modal" onClick={() => setSelectedOrder(null)}>×</button>
                  <h2>Order Details</h2>
                  <div className="order-detail-info">
                    <div className="detail-section">
                      <h3>Customer Information</h3>
                      <p><strong>Name:</strong> {selectedOrder.firstName} {selectedOrder.lastName}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                      <p><strong>Apartment:</strong> {selectedOrder.apartment}</p>
                    </div>
                    <div className="detail-section">
                      <h3>Order Information</h3>
                      <p><strong>Order #:</strong> {selectedOrder.id}</p>
                      <p><strong>Delivery Date:</strong> {formatDate(selectedOrder.deliveryDate)}</p>
                      <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderTime)}</p>
                      <p><strong>Status:</strong> {selectedOrder.status}</p>
                      <p><strong>Bread:</strong> {selectedOrder.breadQuantity} {selectedOrder.breadQuantity === 1 ? 'loaf' : 'loaves'}</p>
                      <p><strong>Jam:</strong> {selectedOrder.jamQuantity} {selectedOrder.jamQuantity === 1 ? 'jar' : 'jars'}</p>
                      {selectedOrder.isRecurring && <p><strong>Recurring:</strong> Weekly</p>}
                      {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'users' && (
          <div className="users-view">
            <h2>All Users ({users.length})</h2>
            <div className="users-list">
              {users.map((user) => {
                const userOrders = orders.filter(o => o.userId === user.id);
                return (
                  <div key={user.id} className="user-card">
                    <div className="user-card-header">
                      <img
                        src={getImagePath('profile_bread.jpg')}
                        alt="User"
                        className="user-card-avatar"
                      />
                      <div>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p>{user.email} • Apt {user.apartment} • {user.phone}</p>
                      </div>
                    </div>
                    <div className="user-orders-count">
                      <strong>Total Orders:</strong> {userOrders.length}
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 style={{ marginTop: '3rem' }}>All Orders ({orders.length})</h2>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">{formatDate(order.orderTime)}</p>
                    </div>
                    <span className={`order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="order-item">
                      <span className="item-label">Customer:</span>
                      <span className="item-value">{order.name} (Apt {order.apartment})</span>
                    </div>
                    <div className="order-item">
                      <span className="item-label">Phone:</span>
                      <span className="item-value">{order.phone}</span>
                    </div>
                    <div className="order-item">
                      <span className="item-label">Delivery Date:</span>
                      <span className="item-value">{formatDate(order.deliveryDate)}</span>
                    </div>
                    <div className="order-item">
                      <span className="item-label">Bread:</span>
                      <span className="item-value">{order.breadQuantity} {order.breadQuantity === 1 ? 'loaf' : 'loaves'}</span>
                    </div>
                    <div className="order-item">
                      <span className="item-label">Jam:</span>
                      <span className="item-value">{order.jamQuantity} {order.jamQuantity === 1 ? 'jar' : 'jars'}</span>
                    </div>
                    {order.isRecurring && (
                      <div className="order-item">
                        <span className="item-label">Recurring:</span>
                        <span className="item-value">Weekly</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="order-item">
                        <span className="item-label">Notes:</span>
                        <span className="item-value">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>© 2024 the upper crust. Made with care, delivered with love.</p>
      </footer>
    </div>
  );
}

export default Admin;
