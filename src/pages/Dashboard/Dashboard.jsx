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
    Progress: 0,
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
    const fetchNotifications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Task notifications
        const taskNotifications = [];
        if (board && board.columns) {
          board.columns.forEach(column => {
            column.cards.forEach(card => {
              if (card.dueDate) {
                const dueDate = new Date(card.dueDate);
                const today = new Date();
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1 && diffDays >= 0) {
                  taskNotifications.push({
                    id: card.id,
                    title: `Task Due: ${card.title}`,
                    description: card.description,
                    time: diffDays === 0 ? 'Today' : 'Tomorrow',
                    type: 'task',
                    subject: card.subject
                  });
                }
              }
            });
          });
        }

        // Calendar event notifications
        const eventsRef = collection(db, 'users', user.uid, 'events');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const eventsQuery = query(
          eventsRef,
          where('start', '>=', today.toISOString()),
          where('start', '<=', tomorrow.toISOString())
        );

        const eventsSnapshot = await getDocs(eventsQuery);
        const eventNotifications = eventsSnapshot.docs.map(doc => {
          const event = doc.data();
          const eventDate = new Date(event.start);
          const isToday = eventDate.toDateString() === today.toDateString();
          
          return {
            id: doc.id,
            title: `Event: ${event.title}`,
            description: event.description || 'No description',
            time: isToday ? 'Today' : 'Tomorrow',
            type: 'calendar',
            startTime: eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        });

        // Combine and sort notifications
        const combinedNotifications = [...taskNotifications, ...eventNotifications]
          .sort((a, b) => {
            if (a.type !== b.type) return a.type === 'task' ? -1 : 1;
            return a.time === 'Today' ? -1 : 1;
          });

        setAllNotifications(combinedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
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
              No notifications
            </div>
          ) : (
            allNotifications.map((notification) => (
              <div key={notification.id} className={css.notificationItem}>
                <div className={css.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className={css.notificationContent}>
                  <div className={css.notificationTitle}>
                    {notification.title}
                    {notification.type === 'task' && notification.subject && (
                      <span className={css.columnTag}>
                        {notification.subject}
                      </span>
                    )}
                  </div>
                  <div className={css.notificationDescription}>
                    {notification.description}
                  </div>
                  <div className={css.notificationTime}>
                    {notification.time}
                    {notification.type === 'calendar' && ` at ${notification.startTime}`}
                  </div>
                </div>
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
              <span>In Progress</span>
            </div>
            <div className={css.cardAmount}>
              <span>*</span>
              <span>{taskCounts['In Progress'] || 0}</span>
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
          <div className={css.taskChart}>
            {/* Your existing chart component */}
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default Dashboard;