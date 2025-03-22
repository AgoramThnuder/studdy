import {create} from 'zustand'
import { db } from '../firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from '../firebase'

const initialState = {
    columns: [
        { id: 1, title: 'TODO', cards: [] },
        { id: 2, title: 'In Progress', cards: [] },
        { id: 3, title: 'Completed', cards: [] },
        { id: 4, title: 'Rewise', cards: [] }
    ]
};

const useBoard = create((set, get)=> ({
    board: initialState,
    isInitialized: false,

    setBoard: async (newBoard) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.log("No user logged in, not saving to Firebase");
                set({ board: newBoard });
                return;
            }

            // First update the local state to make UI responsive
            set({ board: newBoard });

            // Save to Firebase in the boards collection
            const boardRef = doc(db, 'boards', user.uid);
            await setDoc(boardRef, {
                boardData: newBoard,
                lastUpdated: new Date().toISOString(),
                userEmail: user.email
            });

        } catch (error) {
            console.error("Error saving board:", error);
            set({ board: newBoard });
        }
    },
    
    initBoard: async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.log("No user logged in, using initial state");
                set({ board: initialState, isInitialized: true });
                return;
            }

            // Load from Firebase boards collection
            const boardRef = doc(db, 'boards', user.uid);
            const boardDoc = await getDoc(boardRef);
            
            if (boardDoc.exists()) {
                const data = boardDoc.data();
                if (data.boardData && data.boardData.columns) {
                    // Update any "Doing" columns to "In Progress"
                    const updatedBoard = {
                        ...data.boardData,
                        columns: data.boardData.columns.map(column => ({
                            ...column,
                            title: column.title === "Doing" ? "In Progress" : column.title
                        }))
                    };
                    set({ board: updatedBoard, isInitialized: true });
                } else {
                    // Invalid board data, initialize with default
                    await setDoc(boardRef, {
                        boardData: initialState,
                        lastUpdated: new Date().toISOString(),
                        userEmail: user.email
                    });
                    set({ board: initialState, isInitialized: true });
                }
            } else {
                // No board exists for user, create new one
                await setDoc(boardRef, {
                    boardData: initialState,
                    lastUpdated: new Date().toISOString(),
                    userEmail: user.email
                });
                set({ board: initialState, isInitialized: true });
            }
        } catch (error) {
            console.error("Error initializing board:", error);
            set({ board: initialState, isInitialized: true });
        }
    },

    resetBoard: async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                // Clear the user's board in Firebase
                const boardRef = doc(db, 'boards', user.uid);
                await setDoc(boardRef, {
                    boardData: initialState,
                    lastUpdated: new Date().toISOString(),
                    userEmail: user.email
                });
            }
        } catch (error) {
            console.error("Error resetting board:", error);
        }
        set({ board: initialState, isInitialized: false });
    }
}));

export default useBoard;