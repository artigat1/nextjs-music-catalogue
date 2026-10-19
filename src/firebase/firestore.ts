import { db } from "./config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentData,
    WithFieldValue,
    UpdateData,
    QueryDocumentSnapshot,
    QueryConstraint,
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

export const setDocument = async <T extends WithFieldValue<DocumentData>>(collectionName: string, id: string, data: T) => {
    const docRef = doc(db, collectionName, id);
    return await setDoc(docRef, data);
};

export const updateDocument = async <T extends DocumentData>(collectionName: string, id: string, data: UpdateData<T>) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
};

export interface PaginatedResult<T> {
    items: T[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

export interface EqualityFilter {
    field: string;
    value: unknown;
}

export const getPaginatedCollection = async <T>(
    collectionName: string,
    orderByField: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    pageSize: number = 10,
    lastDocument?: QueryDocumentSnapshot<DocumentData> | null,
    filter?: EqualityFilter
): Promise<PaginatedResult<T>> => {
    const constraints: QueryConstraint[] = [];
    if (filter) {
        constraints.push(where(filter.field, '==', filter.value));
    }
    constraints.push(orderBy(orderByField, orderDirection));
    if (lastDocument) {
        constraints.push(startAfter(lastDocument));
    }
    constraints.push(limit(pageSize + 1)); // Fetch one extra to check if there are more

    const q = query(collection(db, collectionName), ...constraints);

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;

    // Remove the extra document if we fetched it
    const items = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() } as T));
    const lastDoc = docs.length > 0 ? docs[Math.min(docs.length - 1, pageSize - 1)] : null;

    return { items, lastDoc, hasMore };
};
