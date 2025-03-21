import Orders from '../../components/Orders/Orders';
import Statistics from '../../components/Statistics/Statistics';
import { cardsData, groupNumber } from '../../data';
import css from './Dashboard.module.css';
import { IoMdNotifications } from 'react-icons/io';
import { useState, useEffect, useRef } from 'react';
import useBoard from '../../store/Board';
import { auth } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { IoMdClose } from 'react-icons/io';

const Dashboard = () => {
  const { board } = useBoard();
  const [showNotifications, setShowNotifications] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [taskCounts, setTaskCounts] = useState({
    TODO: 0,
    Doing: 0,
    Completed: 0,
    Rewise: 0
  });
  const [subjectTaskCounts, setSubjectTaskCounts] = useState([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Fetch tasks from board
        const taskNotifications = board.columns.flatMap(column => 
          column.cards
            .filter(card => card.dueDate === todayString)
            .map(card => ({
              type: 'task',
              title: card.title,
              description: `Due today in ${column.title}`,
              time: card.dueDate,
              column: column.title
            }))
        );

        // Fetch calendar events from events collection
        const eventsRef = collection(db, 'users', user.uid, 'events');
        const eventsQuery = query(eventsRef, where('date', '==', todayString));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        const calendarNotifications = [];
        eventsSnapshot.forEach(doc => {
          const event = doc.data();
          calendarNotifications.push({
            type: 'calendar',
            title: event.title,
            description: event.description || 'No description',
            time: event.date,
            startTime: event.startTime,
            endTime: event.endTime
          });
        });

        // Combine and sort notifications
        const combinedNotifications = [
          ...taskNotifications,
          ...calendarNotifications
        ].sort((a, b) => {
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
          }
          return 0;
        });

        setAllNotifications(combinedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchAllNotifications();
  }, [board]);

  // Calculate task counts whenever board changes
  useEffect(() => {
    if (board && board.columns) {
      const counts = board.columns.reduce((acc, column) => {
        acc[column.title] = column.cards.length;
        return acc;
      }, {});
      setTaskCounts(counts);
    }
  }, [board]);

  // Calculate task counts by subject
  useEffect(() => {
    if (board && board.columns) {
      // Create a map to store subject-wise task counts
      const subjectCounts = {};

      // Count tasks for each subject across all columns
      board.columns.forEach(column => {
        column.cards.forEach(card => {
          const subject = card.subject || 'Uncategorized';
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
      });

      // Convert to array and sort by count in descending order
      const sortedSubjects = Object.entries(subjectCounts)
        .map(([subject, count]) => ({
          subject,
          count
        }))
        .sort((a, b) => b.count - a.count);

      setSubjectTaskCounts(sortedSubjects);
    }
  }, [board]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'calendar':
        return '📅';
      default:
        return '📌';
    }
  };

  return <div className={css.container}>
    <div className={css.notificationContainer}>
      <button 
        className={css.notificationButton}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <IoMdNotifications size={25} />
        {allNotifications.length > 0 && (
          <span className={css.notificationBadge}>
            {allNotifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className={css.notificationDropdown} ref={notificationRef}>
          <div className={css.notificationHeader}>
            <h3>Today's Notifications</h3>
            <button 
              className={css.closeButton}
              onClick={() => setShowNotifications(false)}
            >
              <IoMdClose size={24} />
            </button>
          </div>
          {allNotifications.length === 0 ? (
            <div className={css.noNotifications}>
              No notifications for today
            </div>
          ) : (
            allNotifications.map((notification, index) => (
              <div key={index} className={css.notificationItem}>
                <div className={css.notificationContent}>
                  <span className={css.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className={css.notificationDetails}>
                    <span className={css.notificationTitle}>
                      {notification.title}
                    </span>
                    <span className={css.notificationDescription}>
                      {notification.description}
                    </span>
                    {notification.startTime && (
                      <span className={css.notificationTime}>
                        {notification.startTime} - {notification.endTime}
                      </span>
                    )}
                  </div>
                </div>
                {notification.type === 'task' && (
                  <span className={css.columnTag}>
                    {notification.column}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {/* left side */}
    <div className={css.dashboard}>
      <div className={`${css.dashboardHead} theme-container`}>
        <div className={css.head}>
          <div className={css.headLeft}>
            <span>Dashboard</span>
            <div className={css.durationButton}>
              <select>
                <option value="">1 week</option>
                <option value="">1 month</option>
                <option value="">1 year</option>
              </select>
            </div>
          </div>
        </div>
        <div className={css.cards}>
          <div className={css.card}>
            <div className={css.cardHead}>
              <span>ToDo</span>
            </div>
            <div className={css.cardAmount}>
              <span>*</span>
              <span>{taskCounts.TODO || 0}</span>
            </div>
          </div>

          <div className={css.card}>
            <div className={css.cardHead}>
              <span>Progress</span>
            </div>
            <div className={css.cardAmount}>
              <span>*</span>
              <span>{taskCounts.Doing || 0}</span>
            </div>
          </div>

          <div className={css.card}>
            <div className={css.cardHead}>
              <span>Completed</span>
            </div>
            <div className={css.cardAmount}>
              <span>*</span>
              <span>{taskCounts.Completed || 0}</span>
            </div>
          </div>

          <div className={css.card}>
            <div className={css.cardHead}>
              <span>Rewise</span>
            </div>
            <div className={css.cardAmount}>
              <span>*</span>
              <span>{taskCounts.Rewise || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <Statistics/>
    </div>

    {/* right side */}
    <div className={css.rightSide}>
      <div className={css.studyBuddy}>
        <h2>Study Buddy</h2>
        
        <div className={css.completedTasks}>
          <span>Total Tasks</span>
          <span className={css.totalTasks}>
            {board?.columns?.reduce((total, column) => total + column.cards.length, 0) || 0}
          </span>
        </div>

        <div className={css.subjectsList}>
          {subjectTaskCounts.map((item, index) => (
            <div key={index} className={css.subjectItem}>
              <div className={css.subjectInfo}>
                <span className={css.subjectName}>
                  {item.subject}
                </span>
                <span className={css.taskCount}>
                  Tasks: {item.count}
                </span>
              </div>
              <span className={css.count}>{item.count}</span>
            </div>
          ))}
        </div>

        <div className={css.splitByTasks}>
          <h3>Split by tasks</h3>
          <div className={css.taskChart}>
            {/* Your existing chart component */}
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default Dashboard;