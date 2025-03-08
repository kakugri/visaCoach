import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import GoogleAuth from './GoogleAuth';
import logoSymbol from '../assets/images/logo-symbol.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleLoginSuccess } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                // IMPORTANT: This is where we save the token
                localStorage.setItem('token', data.token);
                handleLoginSuccess(data.user, data.token);
                navigate('/interview');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Login failed');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <img src={logoSymbol} alt="VisaCoach Logo" className="logo-symbol" />
                        <span className="logo-text">VisaCoach</span>
                    </Link>
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your visa preparation</p>
                </div>
                
                <div className="social-auth">
                    <GoogleAuth 
                        onLoginSuccess={handleLoginSuccess}
                        buttonText="Sign in with Google"
                        className="btn btn-google"
                    />
                </div>
                
                <div className="auth-divider">
                    <span>or sign in with email</span>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email" 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password" 
                            required 
                        />
                    </div>
                    
                    <div className="form-options">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block">Sign In</button>
                    
                    {error && <p className="auth-error">{error}</p>}
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;