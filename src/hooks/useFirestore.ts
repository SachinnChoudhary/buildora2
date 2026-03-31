import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  QueryConstraint, 
  Query, 
  DocumentData 
} from 'firebase/firestore';

/**
 * Hook for live project data fetching from Firestore
 * Use this to allow real-time updates across the dashboard
 */
export function useFirestoreRealtime<T = any>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: { enabled?: boolean } = { enabled: true }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let q: Query<DocumentData> = collection(db, collectionName);
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error(`Error in useFirestoreRealtime (${collectionName}):`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints), enabled]);

  return { data, loading, error };
}

/**
 * Example usage hooks
 */

// Fetches all public projects
export function useAllProjects() {
  return useFirestoreRealtime<any>('projects');
}

// Fetches requests for a specific owner (e.g. mentor/owner dashboard)
export function useRequestsForOwner(ownerId: string) {
  const constraints = [
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  ];
  return useFirestoreRealtime<any>('project_requests', constraints);
}

// Fetches requests sent by a user
export function useSentRequests(requesterId: string) {
  const constraints = [
    where('requesterId', '==', requesterId),
    orderBy('createdAt', 'desc')
  ];
  return useFirestoreRealtime<any>('project_requests', constraints);
}
