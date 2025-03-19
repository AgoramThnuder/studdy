import { useState, useEffect } from 'react';
import css from './Sidebar.module.css';
import { MdSpaceDashboard } from "react-icons/md";
import { AiFillCalendar, AiOutlineTable } from "react-icons/ai";
import { FaTasks, FaUser } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import eventBus from '../../utils/eventBus';

const Sidebar = () => {
    const [accountDetailsVisible, setAccountDetailsVisible] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get initial user info from localStorage
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }

        // Subscribe to profile updates
        const unsubscribe = eventBus.subscribe('profileUpdated', (updatedProfile) => {
            setUserInfo(updatedProfile);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('userInfo');
            setUserInfo(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className={css.container}>

            <div className={css.menu}>
                <NavLink to="dashboard" className={css.item} title={"Dashboard"}>
                    <MdSpaceDashboard size={30} />
                </NavLink>
                
                <NavLink
                    to="calendar"
                    className={css.item}
                    title="Calendar"
                >
                    <AiFillCalendar size={30} />
                </NavLink>

                <NavLink
                    to="board"
                    className={css.item}
                    title="Kanban Board"
                >
                    <FaTasks size={30} />
                </NavLink>

                <div 
                    className={css.item} 
                    onClick={() => navigate('/account')}
                >
                    <FaUser size={30} />
                </div>

                {accountDetailsVisible && userInfo && (
                    <div className={css.accountDetails}>
                        <div className={css.userInfo}>
                            <h4>Account Info</h4>
                            <p>{userInfo.email}</p>
                            <p className={css.lastLogin}>
                                Last login: {new Date(userInfo.lastLogin).toLocaleString()}
                            </p>
                        </div>
                        <div className={css.accountActions}>
                            <button onClick={handleLogout}>
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                )}

                <div 
                    className={`${css.item} ${css.loginItem}`}
                    onClick={userInfo ? handleLogout : () => navigate('/login')}
                >
                    {userInfo ? <FiLogOut size={30} /> : <FiLogIn size={30} />}
                </div>
            </div>
        </div>
    )
}

export default Sidebar