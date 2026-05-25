import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import GoogleAuth from './GoogleAuth';
import logoSymbol from '../assets/images/logo-symbol.svg';
import { API_BASE_URL } from '../services/apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { handleLoginSuccess } = useContext(UserContext);
    const navigate = useNavigate();
    const hasGoogleAuth = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

    const finishAuth = async (user, token) => {
        const migration = await handleLoginSuccess(user, token);
        navigate(migration?.status === 'migrated' ? '/history' : '/interview');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                await finishAuth(data.user, data.token);
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
                
                {hasGoogleAuth && (
                    <>
                        <div className="social-auth">
                            <GoogleAuth 
                                onLoginSuccess={finishAuth}
                                onLoginError={setError}
                                buttonText="Sign in with Google"
                                className="btn btn-google"
                            />
                        </div>
                        
                        <div className="auth-divider">
                            <span>or sign in with email</span>
                        </div>
                    </>
                )}
                
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
                        <Link to="/" className="forgot-password">Practice without an account</Link>
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
