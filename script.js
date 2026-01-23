// Set minimum date to 48 hours from now
document.addEventListener('DOMContentLoaded', function() {
    const deliveryDateInput = document.getElementById('deliveryDate');
    const dateHint = document.getElementById('dateHint');
    const dateHintSmall = deliveryDateInput ? deliveryDateInput.parentElement.querySelector('.form-hint') : null;
    
    if (deliveryDateInput) {
        // Calculate minimum date (48 hours from now)
        const now = new Date();
        const minDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        
        // Format date as YYYY-MM-DD
        const year = minDate.getFullYear();
        const month = String(minDate.getMonth() + 1).padStart(2, '0');
        const day = String(minDate.getDate()).padStart(2, '0');
        const minDateString = `${year}-${month}-${day}`;
        
        // Set min attribute
        deliveryDateInput.setAttribute('min', minDateString);
        
        // Validate date on change
        deliveryDateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const selectedTime = selectedDate.getTime();
            const minTime = minDate.getTime();
            
            if (selectedTime < minTime) {
                this.setCustomValidity('Please select a date at least 48 hours from now');
                if (dateHint) {
                    dateHint.textContent = '⚠️ Date must be at least 48 hours from now';
                    dateHint.style.color = '#d32f2f';
                }
                if (dateHintSmall) {
                    dateHintSmall.textContent = '⚠️ Date must be at least 48 hours from now';
                    dateHintSmall.style.color = '#d32f2f';
                }
            } else {
                this.setCustomValidity('');
                if (dateHint) {
                    const formattedSelected = selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    dateHint.textContent = `Delivery scheduled for: ${formattedSelected}`;
                    dateHint.style.color = '';
                }
                if (dateHintSmall) {
                    dateHintSmall.style.color = '';
                }
            }
        });
    }
    
    // Handle form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                apartment: document.getElementById('apartment').value,
                breadQuantity: document.getElementById('breadQuantity').value,
                jamQuantity: document.getElementById('jamQuantity').value,
                deliveryDate: document.getElementById('deliveryDate').value,
                notes: document.getElementById('notes').value
            };
            
            // Validate that at least one item is ordered (bread or jam)
            const breadQty = parseInt(formData.breadQuantity) || 0;
            const jamQty = parseInt(formData.jamQuantity) || 0;
            
            if (breadQty === 0 && jamQty === 0) {
                alert('Please select at least one item to order (bread or jam).');
                return;
            }
            
            // Validate date one more time
            const selectedDate = new Date(formData.deliveryDate);
            const now = new Date();
            const minDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
            
            if (selectedDate < minDate) {
                alert('Please select a delivery date at least 48 hours from now.');
                return;
            }
            
            // Store order in localStorage (in a real app, this would be sent to a server)
            const orders = JSON.parse(localStorage.getItem('upperCrustOrders') || '[]');
            formData.orderId = Date.now();
            formData.orderTime = new Date().toISOString();
            orders.push(formData);
            localStorage.setItem('upperCrustOrders', JSON.stringify(orders));
            
            // Show confirmation
            const orderSection = document.querySelector('.order-section');
            const orderConfirmation = document.getElementById('orderConfirmation');
            if (orderSection) {
                orderSection.style.display = 'none';
            }
            if (orderConfirmation) {
                orderConfirmation.classList.remove('hidden');
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Format phone number input
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
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
            e.target.value = value;
        });
    }
    
    // Format apartment number input (only digits)
    const apartmentInput = document.getElementById('apartment');
    if (apartmentInput) {
        apartmentInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }
    
    // Handle quantity buttons (support both data-value and data-quantity)
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Support both data-value and data-quantity attributes
            const value = this.getAttribute('data-value') || this.getAttribute('data-quantity');
            const type = this.getAttribute('data-type');
            const isJam = this.classList.contains('jam-btn') || type === 'jam';
            const hiddenInput = isJam ? document.getElementById('jamQuantity') : document.getElementById('breadQuantity');
            
            // Remove active class from all buttons in this group
            const buttonGroup = this.closest('.quantity-buttons') || this.closest('.quantity-selector');
            if (buttonGroup) {
                buttonGroup.querySelectorAll('.quantity-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update hidden input
            if (hiddenInput) {
                hiddenInput.value = value;
            }
        });
    });
    
    // Set default "None" for jam buttons
    const jamNoneBtn = document.querySelector('.jam-btn[data-value="0"], .jam-btn[data-quantity="0"]');
    if (jamNoneBtn) {
        jamNoneBtn.classList.add('active');
    }
});
