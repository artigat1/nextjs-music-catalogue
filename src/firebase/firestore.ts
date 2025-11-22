import { db } from "./config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    DocumentData,
    WithFieldValue,
    UpdateData
} from "firebase/firestore";

// Generic helpers
export const getDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

export const getCollection = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addDocument = async <T extends WithFieldValue<DocumentData>>(collectionName: string, data: T) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
};

export const updateDocument = async <T extends DocumentData>(collectionName: string, id: string, data: UpdateData<T>) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
};
