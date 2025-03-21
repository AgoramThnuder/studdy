import {create} from 'zustand'
import {boardData} from '../data'
import { db } from '../firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from '../firebase'

const useBoard = create((set, get)=> ({
    board: boardData,
    isInitialized: false,

    setBoard: async (newBoard) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                // Save to localStorage only if no user
                localStorage.setItem('boardState', JSON.stringify(newBoard));
                set({ board: newBoard });
                return;
            }

            // Save to Firebase under user's document
            const userBoardRef = doc(db, 'users', user.uid);
            await setDoc(userBoardRef, {
                boardData: newBoard,
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            // Update state and localStorage
            set({ board: newBoard });
            localStorage.setItem('boardState', JSON.stringify(newBoard));
        } catch (error) {
            console.error("Error saving board:", error);
            // Save to localStorage as fallback
            localStorage.setItem('boardState', JSON.stringify(newBoard));
            set({ board: newBoard });
        }
    },
    
    // Initialize board from Firebase or localStorage
    initBoard: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) return;

        try {
            const user = auth.currentUser;
            
            if (!user) {
                // If no user, try to load from localStorage
                const localBoard = localStorage.getItem('boardState');
                if (localBoard) {
                    const parsedBoard = JSON.parse(localBoard);
                    set({ board: parsedBoard, isInitialized: true });
                } else {
                    set({ board: boardData, isInitialized: true });
                }
                return;
            }

            // Try to load from Firebase first
            const userBoardRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userBoardRef);
            
            if (userDoc.exists() && userDoc.data().boardData) {
                const loadedBoard = userDoc.data().boardData;
                set({ board: loadedBoard, isInitialized: true });
                // Update localStorage
                localStorage.setItem('boardState', JSON.stringify(loadedBoard));
            } else {
                // If no data in Firebase, check localStorage
                const localBoard = localStorage.getItem('boardState');
                if (localBoard) {
                    const parsedBoard = JSON.parse(localBoard);
                    set({ board: parsedBoard, isInitialized: true });
                    // Save localStorage data to Firebase
                    await setDoc(userBoardRef, {
                        boardData: parsedBoard,
                        lastUpdated: new Date().toISOString()
                    }, { merge: true });
                } else {
                    // If no data anywhere, initialize with default board
                    await setDoc(userBoardRef, {
                        boardData: boardData,
                        lastUpdated: new Date().toISOString()
                    }, { merge: true });
                    set({ board: boardData, isInitialized: true });
                    localStorage.setItem('boardState', JSON.stringify(boardData));
                }
            }
        } catch (error) {
            console.error("Error loading board:", error);
            // If Firebase fails, try to load from localStorage
            const localBoard = localStorage.getItem('boardState');
            if (localBoard) {
                set({ board: JSON.parse(localBoard), isInitialized: true });
            } else {
                // If all else fails, use default board
                set({ board: boardData, isInitialized: true });
                localStorage.setItem('boardState', JSON.stringify(boardData));
            }
        }
    },

    // Reset board state when needed
    resetBoard: () => {
        set({ board: boardData, isInitialized: false });
        localStorage.removeItem('boardState');
    }
}));

export default useBoard;