import Board, { moveCard, moveColumn, removeCard, addCard } from '@asseinfo/react-kanban'
import "@asseinfo/react-kanban/dist/styles.css";
import useBoard from '../../store/Board';
import "./Board.css"
import { RxCross2 } from 'react-icons/rx'
import { IoMdAdd } from 'react-icons/io'
import AddCardModal from '../../components/AddCardModal/AddCardModal';
import { useState, useEffect } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md'
import { IoMdNotifications } from 'react-icons/io';
import eventBus from '../../utils/eventBus';
import { auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const BoardPage = () => {
    const { board, setBoard, initBoard, resetBoard } = useBoard();
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        let mounted = true;

        const loadBoard = async () => {
            try {
                setIsLoading(true);
                await initBoard();
                
                // Only update if component is still mounted
                if (mounted) {
                    const user = auth.currentUser;
                    if (user) {
                        // Try to load from Firebase
                        const userBoardRef = doc(db, 'boards', user.uid);
                        const userBoardDoc = await getDoc(userBoardRef);
                        
                        if (userBoardDoc.exists() && userBoardDoc.data().boardData) {
                            const loadedBoard = userBoardDoc.data().boardData;
                            // Update any "Doing" columns to "In Progress"
                            const updatedBoard = {
                                ...loadedBoard,
                                columns: loadedBoard.columns.map(column => ({
                                    ...column,
                                    title: column.title === "Doing" ? "In Progress" : column.title
                                }))
                            };
                            await setBoard(updatedBoard);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading board:", error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        // Load board initially
        loadBoard();

        // Set up auth state listener
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (mounted) {
                if (user) {
                    // User is signed in, load their board
                    await loadBoard();
                } else {
                    // User is signed out, reset board
                    resetBoard();
                    setIsLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const [modalOpened, setModalOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [currentColumn, setCurrentColumn] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const toggleCardDetails = (cardId) => {  // Move this here
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleColumnMove = async (_card, source, destination) => {
        const updatedBoard = moveColumn(board, source, destination);
        await setBoard(updatedBoard);
    }

    const handleCardMove = async (_card, source, destination) => {
        const updatedBoard = moveCard(board, source, destination);
        await setBoard(updatedBoard);
    }

    const getColumn = (card) => {
        const column = board.columns.filter((column) => column.cards.includes(card))
        return column[0]
    }

    const getGradient = (card) => {
        const column = getColumn(card)
        const title = column.title
        if (title === "TODO") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(48, 189, 220) 163.54%)",
            };
        } else if (title === "In Progress") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(220, 48, 48) 163.54%)",
            };
        } else if (title === "Completed") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(48, 220, 86) 163.54%)",
            };
        } else if (title === "Revision") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(255, 193, 7) 163.54%)",
            };
        }
        // Default gradient if no match
        return {
            background:
                "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(134, 48, 220) 163.54%)",
        };
    }

    useEffect(() => {
        const fetchUserSubjects = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userSubjects = userData.subjects?.map(subject => subject.name) || [];
                    setSubjects(userSubjects);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };

        fetchUserSubjects();
    }, []);
    
    const handleCardAdd = async (title, detail, dueDate, column, subject) => {
        const card = {
            id: new Date().getTime(),
            title,
            description: detail,
            dueDate: dueDate,
            subject: subject,
            createdDate: new Date().toISOString().split('T')[0]
        };

        // Create a new board state with the added card
        const updatedBoard = {
            ...board,
            columns: board.columns.map(col => {
                if (col.title === column.title) {
                    return {
                        ...col,
                        cards: [...col.cards, card]
                    };
                }
                return col;
            })
        };

        // Save the updated board
        await setBoard(updatedBoard);
        setModalOpened(false);
    }

    const handleCardEdit = (task) => {
        setTitle(task.title);
        setDetail(task.description);
        setDueDate(task.dueDate);
        setCurrentTask(task);
        setModalOpened(true);
    };

    const handleSubmit = () => {
        if (!title || !detail || !dueDate || !subject) {
            alert("Please fill in all fields.");
            return;
        }
        if (currentTask) {
            updateTask(currentTask.id, { title, detail, dueDate, subject });
        } else {
            handleCardAdd(title, detail, dueDate, currentColumn, subject);
        }
        setTitle('');
        setDetail('');
        setDueDate('');
        setSubject('');
        setCurrentTask(null);
    };

    const updateTask = async (id, updatedTask) => {
        const updatedColumns = board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
                card.id === id 
                    ? { 
                        ...card, 
                        title: updatedTask.title,
                        description: updatedTask.detail,
                        dueDate: updatedTask.dueDate,
                        subject: updatedTask.subject
                    } 
                    : card
            )
        }));
        
        await setBoard({ columns: updatedColumns });
        setModalOpened(false);
    };

    const getTodaysTasks = () => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        const dueTasks = [];
        board.columns.forEach(column => {
            column.cards.forEach(card => {
                if (card.dueDate === todayString) {
                    dueTasks.push({
                        title: card.title,
                        column: column.title
                    });
                }
            });
        });
        return dueTasks;
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        const results = [];
        board.columns.forEach(column => {
            column.cards.forEach(card => {
                if (card.title.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        ...card,
                        columnTitle: column.title
                    });
                }
            });
        });
        setSearchResults(results);
    };

    useEffect(() => {
        const unsubscribe = eventBus.subscribe('subjectsUpdated', (updatedSubjects) => {
            setSubjects(updatedSubjects.map(subject => subject.name));
        });
        
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <div className="board-loading">Loading board...</div>;
    }

    return (
        <div className="board-container">
            <div className="board-header">
                <span>Kanban Board</span>
                <div className="search-notification-container">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="search-input"
                        />
                        {searchResults.length > 0 && searchQuery && (
                            <div className="search-results">
                                {searchResults.map((result) => (
                                    <div 
                                        key={result.id} 
                                        className="search-result-item"
                                        onClick={() => handleSearchResultClick(result)}
                                    >
                                        <div className="result-title">{result.title}</div>
                                        <div className="result-column">{result.columnTitle}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="notification-container">
                        <button 
                            className="notification-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <IoMdNotifications size={25} />
                            {getTodaysTasks().length > 0 && (
                                <span className="notification-badge">
                                    {getTodaysTasks().length}
                                </span>
                            )}
                        </button>
                        {showNotifications && getTodaysTasks().length > 0 && (
                            <div className="notification-dropdown">
                                <h3>Today's Tasks</h3>
                                {getTodaysTasks().map((task, index) => (
                                    <div key={index} className="notification-item">
                                        <span>{task.title}</span>
                                        <span className="column-tag">{task.column}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Board
                allowAddColumn
                allowRenameColumn
                allowRemoveCard
                onCardDragEnd={handleCardMove}
                onColumnDragEnd={handleColumnMove}
                renderCard={(props) => (
                    <div className='kanban-card' style={getGradient(props)}>
                        <div>
                            <span>{props.title}</span>
                            <button className='remove-button' type='button'
                                onClick={() => {
                                    const updatedBoard = removeCard(board,
                                        getColumn(props),
                                        props
                                    )
                                    setBoard(updatedBoard)
                                }}
                            >
                                <RxCross2 color="white" size={15} />
                            </button>
                        </div>
                        <span>{props.description}</span>
                        <div className="card-actions">
                            <button 
                                className="toggle-button"
                                onClick={() => toggleCardDetails(props.id)}
                            >
                                {expandedCards[props.id] ? 
                                    <MdKeyboardArrowUp size={20} /> : 
                                    <MdKeyboardArrowDown size={20} />
                                }
                            </button>
                            <button className='edit-button' onClick={() => handleCardEdit(props)}>Edit</button>
                        </div>
                        {expandedCards[props.id] && (
                            <div className="card-details">
                                <p>{props.description}</p>
                                <p>Subject: {props.subject}</p>
                                <p>Due Date: {props.dueDate}</p>
                                <p>Created: {props.createdDate}</p>
                            </div>
                        )}
                    </div>
                )}
                renderColumnHeader={(props) => {
                    const [modalOpened, setModalOpened] = useState(false)
                    const [title, setTitle] = useState('');
                    const [detail, setDetail] = useState('');
                    const [dueDate, setDueDate] = useState('');
                    const [subject, setSubject] = useState('');
                
                    const handleCardAdd = (title, detail, dueDate, subject) => {
                        const card = {
                            id: new Date().getTime(),
                            title, 
                            description: detail,
                            dueDate: dueDate,
                            subject: subject,
                            createdDate: new Date().toISOString().split('T')[0]
                        };
                        const updatedBoard = addCard(board, props, card)
                        setBoard(updatedBoard)
                        setModalOpened(false)
                        setTitle('');
                        setDetail('');
                        setDueDate('');
                        setSubject('');
                    }
                
                    return (
                        <div className='column-header'>
                            <span>{props.title}</span>
                
                            <IoMdAdd
                                color="white"
                                size={25} 
                                title="Add card"
                                onClick={() => setModalOpened(true)}
                            />
                            {modalOpened && (
                                <div className="modal-overlay">
                                    <div className="modal">
                                        <h2>Add Task</h2>
                                        <input 
                                            type="text" 
                                            placeholder="Card Title" 
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)} 
                                        />
                                        <textarea 
                                            placeholder="Detail" 
                                            value={detail} 
                                            onChange={(e) => setDetail(e.target.value)} 
                                        />
                                        <select 
                                            className="subject-select"
                                            onChange={(e) => setSubject(e.target.value)}
                                            value={subject}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map((subject, index) => (
                                                <option key={index} value={subject}>
                                                    {subject}
                                                </option>
                                            ))}
                                        </select>
                                        <input 
                                            type="date" 
                                            value={dueDate} 
                                            onChange={(e) => setDueDate(e.target.value)} 
                                        />
                                        <p>Created Date: {new Date().toISOString().split('T')[0]}</p>
                                        <button onClick={() => {
                                            if (!title || !detail || !dueDate || !subject) {
                                                alert("Please fill in all fields.");
                                                return;
                                            }
                                            handleCardAdd(title, detail, dueDate, subject);
                                        }}>Add Task</button>
                                        <button onClick={() => {
                                            setModalOpened(false);
                                            setTitle('');
                                            setDetail('');
                                            setDueDate('');
                                        }}>Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }}

            >
                {board}
            </Board>

            {modalOpened && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{currentTask ? "Edit Task" : "Add Task"}</h2>
                        <input 
                            type="text" 
                            placeholder="Card Title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Detail" 
                            value={detail} 
                            onChange={(e) => setDetail(e.target.value)} 
                        />
                        <select 
                            className="subject-select"
                            onChange={(e) => setSubject(e.target.value)}
                            value={subject}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((subject, index) => (
                                <option key={index} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                        <input 
                            type="date" 
                            value={dueDate} 
                            onChange={(e) => setDueDate(e.target.value)} 
                        />
                        <p>Created Date: {new Date().toISOString().split('T')[0]}</p>
                        <button onClick={handleSubmit}>{currentTask ? "Update Task" : "Add Task"}</button>
                        <button onClick={() => setModalOpened(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BoardPage