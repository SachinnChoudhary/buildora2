import { supabase, getPublicUrl } from '@/lib/supabase';
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
  let thumbnailUrl = '';
  let sourceUrl = projectData.externalRepoUrl || '';

  // 1. Upload files if they exist
  if (projectData.thumbnailFile) {
    thumbnailUrl = await uploadToSupabaseBucket(projectData.thumbnailFile, 'thumbnail', projectId);
  }

  if (projectData.sourceFile && projectData.sourceType === 'zip') {
    sourceUrl = await uploadToSupabaseBucket(projectData.sourceFile, 'source', projectId);
  }

  // 2. Insert into Postgres
  const { sourceFile, thumbnailFile, techStack, tags, ...rest } = projectData;
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...rest,
      id: projectId,
      thumbnail_url: thumbnailUrl,
      source_url: sourceUrl,
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
  const { sourceFile, thumbnailFile, techStack, tags, ...rest } = projectData;
  let thumbnailUrl = projectData.thumbnailUrl;
  let sourceUrl = projectData.sourceUrl || projectData.externalRepoUrl;

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
      tech_stack: techStack,
      tags: tags,
      thumbnail_url: thumbnailUrl,
      source_url: sourceUrl,
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
