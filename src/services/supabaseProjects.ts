import { supabase, getPublicUrl } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

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

export async function createSupabaseProject(projectData: any) {
  const projectId = uuidv4();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated to create a project');

  let thumbnailUrl = '';
  let sourceUrl = '';

  // 1. Upload files if they exist
  if (projectData.thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(projectData.thumbnailFile, 'thumbnail', projectId);
  }

  if (projectData.sourceFile && projectData.sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(projectData.sourceFile, 'source', projectId);
  }

  // 2. Insert into Postgres with owner_id set to current user
  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, ...rest } = projectData;
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...rest,
      id: projectId,
      owner_id: currentUser.uid,
      original_price: originalPrice || rest.price || 0,
      thumbnail_url: thumbnailUrl,
      source_url: sourceUrl || externalRepoUrl || '',
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
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated to update a project');

  const { sourceFile, thumbnailFile, techStack, tags, originalPrice, externalRepoUrl, ...rest } = projectData;
  let thumbnailUrl = projectData.thumbnailUrl;
  let sourceUrl = projectData.sourceUrl || '';

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
      thumbnail_url: thumbnailUrl,
      source_url: sourceUrl || externalRepoUrl || '',
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
