import { supabase, getPublicUrl } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { validate as isUuid } from 'uuid';

export async function uploadToSupabaseBucket(file: File, folder: string, projectId: string, onProgress?: (progress: number) => void): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}/${folder}.${fileExt}`;
  const filePath = `${fileName}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (onProgress && supabaseUrl && anonKey) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${supabaseUrl}/storage/v1/object/projects/${filePath}`);
      xhr.setRequestHeader('Authorization', `Bearer ${anonKey}`);
      xhr.setRequestHeader('apikey', anonKey);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(getPublicUrl(filePath));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  }

  const { error: uploadError } = await supabase.storage
    .from('projects')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });

  if (uploadError) throw uploadError;

  return getPublicUrl(filePath);
}

// Ensure `id` is not included in projectData before inserting into the database
export async function createSupabaseProject(projectData: any) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated to create a project');

  // Remove fields that shouldn't go into the database
  if ('id' in projectData) delete projectData.id;

  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, repoUrl: formRepoUrl, sourceType, updatedAt, onProgress, ...rest } = projectData;
  // Clean any remaining client-only fields from rest
  if ('externalRepoUrl' in rest) delete rest.externalRepoUrl;
  if ('repoUrl' in rest) delete rest.repoUrl;
  if ('sourceType' in rest) delete rest.sourceType;
  if ('updatedAt' in rest) delete rest.updatedAt;
  if ('onProgress' in rest) delete rest.onProgress;

  // 1. Generate a UUID client-side so we can upload files BEFORE inserting the row
  const { v4: uuidv4 } = await import('uuid');
  const projectId = uuidv4();

  // 2. Upload files first using the pre-generated project ID
  let thumbnailUrl = '';
  let sourceUrl = '';

  if (thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(thumbnailFile, 'thumbnail', projectId);
  }

  if (sourceFile && sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(sourceFile, 'source', projectId, onProgress);
  }

  // 3. Insert DB row with all data including file URLs in a single operation
  //    This avoids the RLS issue where UPDATE was silently failing
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      id: projectId,
      ...rest,
      owner_id: currentUser.uid,
      original_price: originalPrice || rest.price || 0,
      thumbnail_url: thumbnailUrl || null,
      source_url: sourceUrl || '',
      repo_url: formRepoUrl || externalRepoUrl || '',
      tech_stack: techStack,
      tags: tags,
      visibility: 'public',
      status: 'active'
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateSupabaseProject(projectId: string, projectData: any) {
  if (!isUuid(projectId)) {
    throw new Error(`Invalid UUID: ${projectId}`);
  }
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated to update a project');

  // Remove client-only fields from destructuring
  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, repoUrl: _repoUrl, sourceType, updatedAt, thumbnailUrl: _thumbUrl, sourceUrl: _srcUrl, onProgress, ...rest } = projectData;
  // Remove any remaining client-only fields from rest
  if ('externalRepoUrl' in rest) delete rest.externalRepoUrl;
  if ('repoUrl' in rest) delete rest.repoUrl;
  if ('sourceType' in rest) delete rest.sourceType;
  if ('updatedAt' in rest) delete rest.updatedAt;
  if ('thumbnailUrl' in rest) delete rest.thumbnailUrl;
  if ('sourceUrl' in rest) delete rest.sourceUrl;
  if ('onProgress' in rest) delete rest.onProgress;
  let thumbnailUrl = projectData.thumbnailUrl;
  let sourceUrl = projectData.sourceUrl || '';
  let repoUrl = projectData.repoUrl || '';

  if (thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(thumbnailFile, 'thumbnail', projectId);
  }

  if (sourceFile && projectData.sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(sourceFile, 'source', projectId, onProgress);
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...rest,
      original_price: originalPrice || rest.price || 0,
      tech_stack: techStack,
      tags: tags,
      thumbnail_url: thumbnailUrl || null,
      source_url: sourceUrl || '',
      repo_url: repoUrl || '',
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteSupabaseProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  if (error) throw error;
  
  // Optional: Delete files from storage
  await supabase.storage.from('projects').remove([`${projectId}/thumbnail.png`, `${projectId}/source.zip`]);
}

export async function getAllSupabaseProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllSupabaseProjectsAsTable() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return { columns: [], rows: [] };

  const columns = Object.keys(data[0]);
  const rows = data.map(project => columns.map(col => project[col]));
  return { columns, rows };
}
