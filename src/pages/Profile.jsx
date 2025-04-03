import React, { useState, useEffect } from 'react';
import '../assets/css/profile.css';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || ''
            });
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, authLoading, navigate]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setFormData({
                fullName: data.fullName || user?.fullName || '',
                email: user?.email || '',
                phone: data.phone || '',
                location: data.location || '',
                bio: data.bio || ''
            });
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') return;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    email: user.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setFormData(prev => ({
                ...prev,
                ...data,
                email: user.email
            }));
        } catch (err) {
            console.error('Update error:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <div>Loading authentication...</div>;
    }

    if (!isAuthenticated) {
        return null; // Will redirect to signin
    }

    if (isLoading) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="container">
            <div className="content-section">
                <div className="section-header">
                    <h2 className="section-title">My Profile</h2>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                disabled
                                placeholder="Your email address"
                                title="Email cannot be changed as it is tied to your account"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Enter your location"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself"
                            rows="4"
                        />
                    </div>

                    <div className="profile-actions">
                        <button type="button" className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="save-button" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
