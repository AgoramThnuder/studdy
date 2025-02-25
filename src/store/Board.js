import {create} from 'zustand'
import {boardData} from '../data'
import { db } from '../firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'

const useBoard = create((set)=> ({
    board: boardData,
    setBoard: async (newBoard) => {
        try {
            // Update state
            set({ board: newBoard });
            
            // Save to Firebase
            const boardRef = doc(db, 'boards', 'main-board');
            await setDoc(boardRef, { columns: newBoard.columns }, { merge: true });
        } catch (error) {
            console.error("Error saving board:", error);
        }
    },
    
    // Initialize board from Firebase
    initBoard: async () => {
        try {
            const boardRef = doc(db, 'boards', 'main-board');
            const boardSnap = await getDoc(boardRef);
            
            if (boardSnap.exists()) {
                set({ board: boardSnap.data() });
            } else {
                // If no data exists, initialize with default board
                await setDoc(boardRef, { columns: boardData.columns });
            }
        } catch (error) {
            console.error("Error loading board:", error);
        }
    }
}));

export default useBoard;