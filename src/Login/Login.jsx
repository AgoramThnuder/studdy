import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './Login.module.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        // Save user data to Firestore after sign up
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: formData.username,
          email: formData.email,
          subjects: [],
          bio: '',
          lastLogin: new Date().toISOString() // Optional: Save last login time
        });
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
      }

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        localStorage.setItem('userInfo', JSON.stringify(userDoc.data()));
      } else {
        // Handle case where user data does not exist
        console.log('No user data found in Firestore');
      }

      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    console.log("Forgot password for:", formData.email);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.formGroup}>
              <input 
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <input 
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <input 
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          {!isSignUp && (
            <div className={styles.forgotPassword}>
              <span onClick={handleForgotPassword}>Forgot Password?</span>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          
          <button type="submit" className={styles.loginButton}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className={styles.switchMode}>
          <p>
            {isSignUp 
              ? 'Already have an account?' 
              : "Don't have an account?"}
            <span onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? ' Sign In' : ' Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 