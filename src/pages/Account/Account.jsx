import React, { useState, useEffect } from 'react';
import { HiX, HiPlus, HiCheck } from 'react-icons/hi';
import { ChromePicker } from 'react-color';
import styles from './Account.module.css';
import { auth } from '../../firebase'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth listener
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Import your Firestore instance
import { getFirestore } from "firebase/firestore";
import eventBus from '../../utils/eventBus';

const SUBJECT_COLORS = [
  '#FF5D5D', '#5DC9FF', '#5DFF7F', 
  '#FF5DE1', '#FFB45D', '#9D5DFF'
];

const Account = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#FF5D5D' });
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [recentColors, setRecentColors] = useState(SUBJECT_COLORS.slice(0, 6));
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const storedData = localStorage.getItem('userInfo');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Parsed user info from local storage:', parsedData);
          setUserInfo({ ...parsedData, uid: user.uid });
        } else {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserInfo({ ...userDoc.data(), uid: user.uid });
          } else {
            setUserInfo({
              username: '',
              email: user.email,
              subjects: [],
              bio: '',
              uid: user.uid
            });
          }
        }
      } else {
        setError('No user is logged in.');
      }
      setLoading(false); // Set loading to false after fetching data
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No authenticated user found');
        }

        // Update Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, userInfo);

        // Update localStorage and publish event
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        eventBus.publish('subjectsUpdated', userInfo.subjects);
        
        setIsEditing(false);
        setError('Profile updated successfully!');
    } catch (error) {
        console.error('Error saving user info:', error);
        setError(error.message || 'Failed to save user information.');
    }
  };

  // Function to add color to recent colors
  const addToRecentColors = (newColor) => {
    setRecentColors(prev => {
      const filtered = prev.filter(color => color !== newColor);
      return [newColor, ...filtered].slice(0, 6);
    });
  };

  // Update color change handler
  const handleColorChange = (color) => {
    setTempColor(color.hex);
  };

  // Add color selection confirmation
  const handleColorSelect = () => {
    if (tempColor) {
      setNewSubject(prev => ({
        ...prev,
        color: tempColor
      }));
      addToRecentColors(tempColor);
      setTempColor(null);
      setShowColorPicker(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message
  }

  if (error) {
    console.error(error); // Log the error for debugging
    return <div>{error}</div>; // Show error message
  }

  if (!userInfo) {
    return <div>No user data available.</div>; // Handle case where userInfo is null
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h2>Account Settings</h2>
        
        <form onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={userInfo.username}
              onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
              disabled={!isEditing}
              className={isEditing ? styles.enabled : styles.disabled}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={userInfo.email}
              disabled={true}
              className={styles.disabled}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Bio</label>
            <textarea
              name="bio"
              value={userInfo.bio}
              onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
              disabled={!isEditing}
              rows="4"
              className={isEditing ? styles.enabled : styles.disabled}
            />
          </div>

          <div className={styles.subjectsSection}>
            <div className={styles.subjectsHeader}>
              <label>Subjects</label>
              {isEditing && (
                <button 
                  type="button"
                  className={styles.addSubjectButton}
                  onClick={() => setShowSubjectInput(true)}
                >
                  <HiPlus /> Add Subject
                </button>
              )}
            </div>

            <div className={styles.subjectsList}>
              {userInfo.subjects && userInfo.subjects.length > 0 ? (
                userInfo.subjects.map((subject, index) => (
                  <div 
                    key={subject.id || index} // Use a unique identifier if available
                    className={styles.subjectTag}
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name}
                    {isEditing && (
                      <HiX 
                        className={styles.removeIcon} 
                        onClick={() => {
                          const newSubjects = userInfo.subjects.filter((_, i) => i !== index);
                          setUserInfo(prev => ({ ...prev, subjects: newSubjects }));
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div>No subjects available.</div> // Fallback if no subjects
              )}
            </div>

            {isEditing && showSubjectInput && (
              <div className={styles.addSubject}>
                <input
                  type="text"
                  placeholder="Enter subject name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  className={styles.subjectInput}
                />
                <div className={styles.colorSelection}>
                  <div className={styles.recentColors}>
                    {recentColors.map((color, index) => (
                      <div
                        key={index}
                        className={`${styles.colorOption} ${newSubject.color === color ? styles.selected : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewSubject(prev => ({ ...prev, color }))}
                      />
                    ))}
                    <div 
                      className={styles.colorPickerButton}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                      <HiPlus size={20} />
                    </div>
                  </div>
                  {showColorPicker && (
                    <div className={styles.colorPickerPopover}>
                      <div 
                        className={styles.colorPickerCover}
                        onClick={() => {
                          setShowColorPicker(false);
                          setTempColor(null);
                        }}
                      />
                      <div className={styles.colorPickerWrapper}>
                        <ChromePicker
                          color={tempColor || newSubject.color}
                          onChange={handleColorChange}
                          disableAlpha={true}
                        />
                        <div className={styles.colorPickerActions}>
                          <button
                            className={styles.colorSelectButton}
                            onClick={handleColorSelect}
                            disabled={!tempColor}
                          >
                            <HiCheck size={24} />
                          </button>
                          <button
                            className={styles.colorCancelButton}
                            onClick={() => {
                              setShowColorPicker(false);
                              setTempColor(null);
                            }}
                          >
                            <HiX size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.subjectActions}>
                  <button 
                    type="button" 
                    className={styles.addButton}
                    onClick={() => {
                      if (newSubject.name.trim()) {
                        setUserInfo(prev => ({
                          ...prev,
                          subjects: [...prev.subjects, { ...newSubject }]
                        }));
                        setNewSubject({ name: '', color: '#FF5D5D' });
                        setShowSubjectInput(false);
                        setShowColorPicker(false);
                      }
                    }}
                  >
                    Add
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowSubjectInput(false);
                      setShowColorPicker(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={styles.editButton}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button 
                type="submit"
                className={styles.saveButton}
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;
