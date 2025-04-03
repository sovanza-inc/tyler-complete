import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/css/payment.css';

const stripePromise = loadStripe('pk_test_51NWncHB7S6nOH9ha2cIsYHSYgyHOMzf5sSbGEAcOtJ4mGq62OEldeA63pBgW9UhaDu6ECYIpYqMMBX0s7ewzZ4bv00NeXtT0Ya');

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [priceDetails, setPriceDetails] = useState({
        amount: 0,
        currency: 'USD',
        productName: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to make a payment');
            navigate('/login');
            return;
        }

        // Fetch price details from backend
        const fetchPriceDetails = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/payments/price-details', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setPriceDetails(response.data);
            } catch (err) {
                console.error('Failed to fetch price details:', err);
                setError('Failed to load payment details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPriceDetails();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName || !formData.email) {
            setError('Name and email are required');
            return false;
        }
        // Validate required fields for Indian export transactions
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
            setError('Complete address is required for international transactions');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to make a payment');
            navigate('/login');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Create payment intent
            const { data: { clientSecret } } = await axios.post(
                'http://localhost:5000/api/payments/create-payment-intent',
                {
                    customer: {
                        name: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: {
                            line1: formData.address,
                            city: formData.city,
                            state: formData.state,
                            postal_code: formData.zipCode,
                            country: 'IN' // Using ISO 3166-1 alpha-2 code for India
                        }
                    }
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Confirm payment with same country code
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: {
                                line1: formData.address,
                                city: formData.city,
                                state: formData.state,
                                postal_code: formData.zipCode,
                                country: 'IN' // Using ISO 3166-1 alpha-2 code for India
                            }
                        }
                    }
                }
            );

            if (stripeError) {
                setError(stripeError.message);
            } else if (paymentIntent.status === 'succeeded') {
                setPaymentSuccess(true);
                // Reset form
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                });
                elements.getElement(CardElement).clear();
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (paymentSuccess) {
        return (
            <div className="payment-container">
                <div className="content-section">
                    <div className="payment-success-container">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" className="checkmark">
                                <circle className="checkmark__circle" cx="12" cy="12" r="11" />
                                <path className="checkmark__check" d="M6.7 12.3l3.6 3.6L17 9" />
                            </svg>
                        </div>
                        <h2 className="success-title">Payment Successful!</h2>
                        <div className="success-message">
                            Thank you for your payment. Your transaction has been completed successfully.
                        </div>
                        <div className="success-details">
                            A confirmation email will be sent to your registered email address.
                        </div>
                        <button
                            onClick={() => setPaymentSuccess(false)}
                            className="new-payment-button"
                        >
                            Make Another Payment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="payment-container">
                <div className="content-section">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="amount-section">
                <h3 className="product-name">{priceDetails.productName}</h3>
                <div className="price-display">
                    Amount: {priceDetails.currency.toUpperCase()} {(priceDetails.amount / 100).toFixed(2)}
                </div>
            </div>

            <div className="billing-details">
                <h3 className="billing-title">Billing Information</h3>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address (Required for international transactions)</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Complete street address"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="zipCode">ZIP Code</label>
                        <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            placeholder="Postal code"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value="India"
                        disabled
                        className="disabled-input"
                    />
                    <small className="form-text text-muted">
                        Country is set to India for export transactions
                    </small>
                </div>
            </div>

            <div className="card-details">
                <h3 className="billing-title">Card Information</h3>
                <div className="form-group">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button 
                type="submit" 
                disabled={isProcessing || !stripe}
                className="submit-button"
            >
                {isProcessing ? 'Processing...' : `Pay ${priceDetails.currency.toUpperCase()} ${(priceDetails.amount / 100).toFixed(2)}`}
            </button>
        </form>
    );
};

const Payment = () => {
    return (
        <div className="payment-container">
            <div className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Payment Details</h2>
                </div>
                <Elements stripe={stripePromise}>
                    <PaymentForm />
                </Elements>
            </div>
        </div>
    );
};

export default Payment;