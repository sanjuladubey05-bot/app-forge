import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project } from '../types/editor';

export interface CloudProjectMeta {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  isPublic: boolean;
  publishedUrl?: string;
  presetName?: string;
  updatedAtIso: string;
  project: Project;
}

function sanitizeDocId(raw: string): string {
  const cleaned = (raw || 'proj_default').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || `proj_${Date.now()}`;
}

function stripUndefinedDeep<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (val && typeof val === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return val;
}

export async function saveProjectToCloud(
  project: Project,
  ownerId: string,
  options: { isPublic?: boolean; publishedUrl?: string } = {}
): Promise<void> {
  const safeId = sanitizeDocId(project.id);
  const path = `projects/${safeId}`;
  const docRef = doc(db, 'projects', safeId);

  const sanitizedProject = stripUndefinedDeep({
    ...project,
    id: safeId,
    updatedAt: new Date().toISOString(),
  });

  const name = (project.name || 'Untitled Project').trim().slice(0, 140) || 'Untitled Project';
  const description = (project.description || '').slice(0, 500);
  const presetName = (project.themeTokens?.presetName || 'midnight-saas').slice(0, 40);
  const isPublic = options.isPublic ?? false;
  const publishedUrl = (options.publishedUrl || project.lastDeploymentUrl || '').slice(0, 512);

  try {
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        id: safeId,
        ownerId,
        name,
        description,
        isPublic,
        ...(publishedUrl ? { publishedUrl } : {}),
        presetName,
        projectData: sanitizedProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        docRef,
        {
          id: safeId,
          ownerId: existing.data().ownerId,
          name,
          description,
          isPublic: existing.data().isPublic ?? isPublic,
          ...(publishedUrl ? { publishedUrl } : existing.data().publishedUrl ? { publishedUrl: existing.data().publishedUrl } : {}),
          presetName,
          projectData: sanitizedProject,
          createdAt: existing.data().createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function listUserCloudProjects(ownerId: string): Promise<CloudProjectMeta[]> {
  const path = 'projects';
  try {
    const q = query(collection(db, 'projects'), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ownerId: data.ownerId,
        name: data.name || 'Untitled Project',
        description: data.description || '',
        isPublic: Boolean(data.isPublic),
        publishedUrl: data.publishedUrl,
        presetName: data.presetName,
        updatedAtIso: data.projectData?.updatedAt || new Date().toISOString(),
        project: data.projectData as Project,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteCloudProject(projectId: string): Promise<void> {
  const safeId = sanitizeDocId(projectId);
  const path = `projects/${safeId}`;
  try {
    await deleteDoc(doc(db, 'projects', safeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
