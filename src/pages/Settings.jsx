import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios'; // Import axios
import '../assets/css/settings.css';

const Settings = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Add state for second form
    const [simplePassword, setSimplePassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [simpleError, setSimpleError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError("New passwords don't match");
            return;
        }

        try {
            await axios.put('http://localhost:5000/api/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Clear form on success
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordError('Password updated successfully');
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Password change failed');
        }
    };

   

    return (
        <div className="container">
            <div className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Security Settings</h2>
                </div>

                <div className="security-section">
                    <div className="two-factor-row">
                        <div className="two-factor-info">
                            <div className="two-factor-title">Two-Factor Authentication</div>
                            <div className="two-factor-description">
                                Add an extra layer of security to your account
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={twoFactorEnabled}
                                onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <form className="password-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="password-toggle">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    name="currentPassword"
                                    placeholder="Current Password"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                />
                                <div
                                    className="toggle-icon"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-toggle">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="New Password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                />
                                <div
                                    className="toggle-icon"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-toggle">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                <div
                                    className="toggle-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                        </div>

                        {successMessage && <div className="success-message">{successMessage}</div>}
                        {passwordError && <div className="error-message">{passwordError}</div>}

                        <button type="submit" className="change-password-button">
                            Change Password
                        </button>
                    </form>
                </div>

             
            </div>
        </div>
    );
};

export default Settings;
