import Board, { moveCard, moveColumn, removeCard, addCard } from '@asseinfo/react-kanban'
import "@asseinfo/react-kanban/dist/styles.css";
import useBoard from '../../store/Board';
import "./Board.css"
import { RxCross2 } from 'react-icons/rx'
import { IoMdAdd } from 'react-icons/io'
import { useState } from 'react';
import { boardData } from '../../data'; // Assuming you have this data

const BoardPage = () => {

    const { board, setBoard } = useBoard()
    const [modalOpened, setModalOpened] = useState(false);
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [currentColumn, setCurrentColumn] = useState(null); // Track the current column

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
        const createdDate = new Date().toISOString().split('T')[0];
        const card = {
            id: new Date().getTime(),
            title,
            description: detail,
            createdDate,
            dueDate
        };
        
        console.log("New Card:", card);
        
        // Add the card to the specified column
        const updatedBoard = addCardToColumn(board, column, card);
        
        console.log("Updated Board:", updatedBoard);
        setBoard(updatedBoard);
        setModalOpened(false);
    }

    const handleSubmit = () => {
        if (!title || !detail || !dueDate) {
            alert("Please fill in all fields.");
            return;
        }
        handleCardAdd(title, detail, dueDate, currentColumn); // Pass the current column
        setTitle('')
        setDetail('')
        setDueDate('')
    }

    const addCardToColumn = (board, column, card) => {
        return {
            ...board,
            columns: board.columns.map(col => 
                col.id === column.id 
                ? { ...col, cards: [...col.cards, card] } 
                : col
            )
        };
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
                    </div>
                )}
                renderColumnHeader={(props) => {
                    return (
                        <div className='column-header'>
                            <span>{props.title}</span>

                            <IoMdAdd
                                color="white"
                                size={25} title="Add card"
                                onClick={() => { setCurrentColumn(props); setModalOpened(true); }}
                            />
                        </div>
                    )
                }}

            >
                {board}
            </Board>

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
                        <input 
                            type="date" 
                            value={dueDate} 
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                        <p>Created Date: {new Date().toISOString().split('T')[0]}</p>
                        <button onClick={handleSubmit}>Add Task</button>
                        <button onClick={() => setModalOpened(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BoardPage