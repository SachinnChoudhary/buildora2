import { supabase, getPublicUrl } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { validate as isUuid } from 'uuid';

export async function uploadToSupabaseBucket(file: File, folder: string, projectId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}/${folder}.${fileExt}`;
  const filePath = `${fileName}`;

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

  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, repoUrl: formRepoUrl, sourceType, updatedAt, ...rest } = projectData;
  // Clean any remaining client-only fields from rest
  if ('externalRepoUrl' in rest) delete rest.externalRepoUrl;
  if ('repoUrl' in rest) delete rest.repoUrl;
  if ('sourceType' in rest) delete rest.sourceType;
  if ('updatedAt' in rest) delete rest.updatedAt;

  // 1. Insert DB row first to get a project ID
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...rest,
      owner_id: currentUser.uid,
      original_price: originalPrice || rest.price || 0,
      thumbnail_url: null,
      source_url: '',
      repo_url: formRepoUrl || externalRepoUrl || '',
      tech_stack: techStack,
      tags: tags,
      visibility: 'public',
      status: 'active'
    }])
    .select();

  if (error) throw error;
  const project = data[0];
  const projectId = project.id;

  // 2. Upload files using the real project ID
  let thumbnailUrl = '';
  let sourceUrl = '';

  if (thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(thumbnailFile, 'thumbnail', projectId);
  }

  if (sourceFile && sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(sourceFile, 'source', projectId);
  }

  // 3. Update the row with file URLs if any were uploaded
  if (thumbnailUrl || sourceUrl) {
    const updates: Record<string, string> = {};
    if (thumbnailUrl) updates.thumbnail_url = thumbnailUrl;
    if (sourceUrl) updates.source_url = sourceUrl;

    const { error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update file URLs:', updateError);
    } else {
      Object.assign(project, updates);
    }
  }

  return project;
}

export async function updateSupabaseProject(projectId: string, projectData: any) {
  if (!isUuid(projectId)) {
    throw new Error(`Invalid UUID: ${projectId}`);
  }
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated to update a project');

  // Remove client-only fields from destructuring
  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, repoUrl: _repoUrl, sourceType, updatedAt, thumbnailUrl: _thumbUrl, sourceUrl: _srcUrl, ...rest } = projectData;
  // Remove any remaining client-only fields from rest
  if ('externalRepoUrl' in rest) delete rest.externalRepoUrl;
  if ('repoUrl' in rest) delete rest.repoUrl;
  if ('sourceType' in rest) delete rest.sourceType;
  if ('updatedAt' in rest) delete rest.updatedAt;
  if ('thumbnailUrl' in rest) delete rest.thumbnailUrl;
  if ('sourceUrl' in rest) delete rest.sourceUrl;
  let thumbnailUrl = projectData.thumbnailUrl;
  let sourceUrl = projectData.sourceUrl || '';
  let repoUrl = projectData.repoUrl || '';

  if (thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(thumbnailFile, 'thumbnail', projectId);
  }

  if (sourceFile && projectData.sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(sourceFile, 'source', projectId);
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
