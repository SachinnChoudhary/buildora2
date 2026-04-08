import { db, storage } from '@/lib/firebase';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  serverTimestamp, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { Project } from '@/lib/projects';

/**
 * USER SERVICES
 */

export const createUserProfile = async (uid: string, data: {
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'student' | 'mentor' | 'admin';
}) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    role: data.role || 'student',
    stats: {
      projectsCompleted: 0,
      requestsSent: 0
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (uid: string, data: Partial<any>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * PROJECT SERVICES
 */

/**
 * PROJECT SERVICES (EXTENDED)
 */

export const uploadProjectFile = async (projectId: string, file: File) => {
  const fileRef = ref(storage, `projects/${projectId}/source.zip`);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const uploadProjectThumbnail = async (projectId: string, file: File) => {
  const fileRef = ref(storage, `projects/${projectId}/thumbnail.png`);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const createProject = async (projectData: any) => {
  const projectsRef = collection(db, 'projects');
  // First, create a doc to get the ID
  const newDocRef = doc(projectsRef);
  const projectId = newDocRef.id;

  let sourceUrl = '';
  let thumbnailUrl = '';

  // If files are provided, upload them
  if (projectData.sourceFile) {
    sourceUrl = await uploadProjectFile(projectId, projectData.sourceFile);
  }
  if (projectData.thumbnailFile) {
    thumbnailUrl = await uploadProjectThumbnail(projectId, projectData.thumbnailFile);
  }

  const { sourceFile, thumbnailFile, ...rest } = projectData;

  await setDoc(newDocRef, {
    ...rest,
    id: projectId,
    sourceUrl: sourceUrl || rest.externalRepoUrl || '',
    thumbnailUrl,
    status: 'active',
    visibility: 'public',
    fileTree: [], // Cloud Function handles this ONLY if sourceUrl is a .zip
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return projectId;
};

export const updateProject = async (projectId: string, data: Partial<Project>) => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * REQUEST SERVICES
 */

export interface ProjectRequest {
  id?: string;
  projectId: string;
  projectTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  message: string;
  budget: string;
  deadline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  contactName: string;
  whatsapp: string;
  email: string;
  institution: string;
  createdAt?: any;
}

export const sendProjectRequest = async (request: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>) => {
  const requestsRef = collection(db, 'project_requests');
  return await addDoc(requestsRef, {
    ...request,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const updateRequestStatus = async (requestId: string, status: ProjectRequest['status']) => {
  const requestRef = doc(db, 'project_requests', requestId);
  await updateDoc(requestRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};
