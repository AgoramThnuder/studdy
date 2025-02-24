import Board, { moveCard, moveColumn, removeCard, addCard } from '@asseinfo/react-kanban'
import "@asseinfo/react-kanban/dist/styles.css";
import useBoard from '../../store/Board';
import "./Board.css"
import { RxCross2 } from 'react-icons/rx'
import { IoMdAdd } from 'react-icons/io'
import AddCardModal from '../../components/AddCardModal/AddCardModal';
import { useState } from 'react';

const BoardPage = () => {

    const { board, setBoard } = useBoard()
    const [modalOpened, setModalOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [currentColumn, setCurrentColumn] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);

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
        }
    }

    const handleCardAdd = (title, detail, dueDate, column) => {
        const card = {
            id : new Date().getTime(),
            title, 
            description: detail,
            dueDate: dueDate
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
        if (!title || !detail || !dueDate) {
            alert("Please fill in all fields.");
            return;
        }
        if (currentTask) {
            updateTask(currentTask.id, { title, detail, dueDate });
        } else {
            handleCardAdd(title, detail, dueDate, currentColumn);
        }
        setTitle('');
        setDetail('');
        setDueDate('');
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

    return (
        <div className="board-container">

            <span>Trello Board</span>

            <Board
                allowAddColumn
                allowRenameColumn
                allowRemoveCard
                onCardDragEnd={handleCardMove}
                onColumnDragEnd={handleColumnMove}
                renderCard={(props) => (
                    <div className='kanban-card' style={getGradient(props)}>
                        <div>
                            <span>
                                {props.title}
                            </span>
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
                        <button onClick={() => handleCardEdit(props)}>Edit</button>
                    </div>
                )}
                renderColumnHeader={(props) => {

                    const [modalOpened, setModalOpened] = useState(false)

                    const handleCardAdd = (title, detail)=> {
                        const card = {
                            id : new Date().getTime(),
                            title, 
                            description: detail
                        };
                        const updatedBoard = addCard(board, props, card)
                        setBoard(updatedBoard)
                        setModalOpened(false)
                    }
                    return (
                        <div className='column-header'>
                            <span>{props.title}</span>

                            <IoMdAdd
                                color="white"
                                size={25} title="Add card"
                                onClick={()=>setModalOpened(true)}
                            />
                            <AddCardModal visible={modalOpened} handleCardAdd={handleCardAdd}
                                onClose={() => setModalOpened(false)} />
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