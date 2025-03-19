import Board, { moveCard, moveColumn, removeCard, addCard } from '@asseinfo/react-kanban'
import "@asseinfo/react-kanban/dist/styles.css";
import useBoard from '../../store/Board';
import "./Board.css"
import { RxCross2 } from 'react-icons/rx'
import { IoMdAdd } from 'react-icons/io'
import AddCardModal from '../../components/AddCardModal/AddCardModal';
import { useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md' // Add this import
import { useEffect } from 'react';  // Add this import
import { IoMdNotifications } from 'react-icons/io'; // Add this import at the top
import eventBus from '../../utils/eventBus';

const BoardPage = () => {
    const { board, setBoard, initBoard } = useBoard();
    
    useEffect(() => {
        initBoard();
    }, [initBoard]);

    const [modalOpened, setModalOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [currentColumn, setCurrentColumn] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCardDetails = (cardId) => {  // Move this here
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const handleColumnMove = (_card, source, destination) => {
        const updatedBoard = moveColumn(board, source, destination)
        setBoard(updatedBoard)
    }

    const handleCardMove = (_card, source, destination) => {
        const updatedBoard = moveCard(board, source, destination)
        setBoard(updatedBoard)

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
        } else if (title === "Doing") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(220, 48, 48) 163.54%)",
            };
        } else if (title === "Completed") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(48, 220, 86) 163.54%)",
            };
        } else if (title === "Backlog") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65,65, 0.67) -1.72%,rgba(134, 48, 220) 163.54%)",
            };
        } else if (title === "Rewise") {
            return {
                background:
                    "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(255, 193, 7) 163.54%)",
            };
        }
    }

    // Add these state variables at the top with other useState declarations
    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState('');
    
    // Add this useEffect after other useEffect hooks
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        const userSubjects = userInfo.subjects?.map(subject => subject.name) || [];
        setSubjects(userSubjects);
    }, []);
    
    // Update the handleCardAdd function to include subject
    const handleCardAdd = (title, detail, dueDate, column, subject) => {
        const card = {
            id: new Date().getTime(),
            title,
            description: detail,
            dueDate: dueDate,
            subject: subject,
            createdDate: new Date().toISOString().split('T')[0]
        };
        const updatedBoard = addCard(board, column, card)
        setBoard(updatedBoard)
        setModalOpened(false)
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

    const updateTask = (id, updatedTask) => {
        const updatedBoard = board.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => (card.id === id ? { ...card, ...updatedTask } : card))
        }));
        setBoard({ columns: updatedBoard });
        setModalOpened(false);
    };

    const [showNotifications, setShowNotifications] = useState(false);

    // Replace getTomorrowsTasks with getTodaysTasks
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

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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
                    {/* Update the notification section in the return statement */}
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
                    const [subject, setSubject] = useState(''); // Add this line
                
                    // Update the handleCardAdd function in renderColumnHeader
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
                
                    // Update the onClick handler in the Add Task button
                    <button onClick={() => {
                        if (!title || !detail || !dueDate || !subject) {
                            alert("Please fill in all fields.");
                            return;
                        }
                        handleCardAdd(title, detail, dueDate, subject);
                    }}>Add Task</button>
                
                    // Update the card details display in renderCard
                    {expandedCards[props.id] && (
                        <div className="card-details">
                            <p>{props.description}</p>
                            <p>Subject: {props.subject}</p>
                            <p>Due Date: {props.dueDate}</p>
                            <p>Created: {props.createdDate}</p>
                        </div>
                    )}
                
                    // Update handleCardEdit to include subject
                    const handleCardEdit = (task) => {
                        setTitle(task.title);
                        setDetail(task.description);
                        setDueDate(task.dueDate);
                        setSubject(task.subject || ''); // Add this line
                        setCurrentTask(task);
                        setModalOpened(true);
                    };
                
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
                                            if (!title || !detail || !dueDate) {
                                                alert("Please fill in all fields.");
                                                return;
                                            }
                                            handleCardAdd(title, detail, dueDate);
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
                    // In the modal form section
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