/**
 * Maps a Supabase snake_case project row to the camelCase Project interface
 * used by the frontend components.
 */
export function mapSupabaseProject(p: any) {
  return {
    ...p,
    // Map snake_case DB columns to camelCase used by UI
    thumbnailUrl: p.thumbnail_url || p.thumbnailUrl || '',
    sourceUrl: p.source_url || p.sourceUrl || '',
    repoUrl: p.repo_url || p.repoUrl || '',
    techStack: p.tech_stack || p.techStack || [],
    originalPrice: p.original_price || p.originalPrice || p.price || 0,
    fileTree: p.file_tree || p.fileTree || [],
    createdAt: p.created_at || p.createdAt || '',
    updatedAt: p.updated_at || p.updatedAt || '',
    ownerId: p.owner_id || p.ownerId || '',
    // Ensure arrays exist for UI that iterates over them
    features: p.features || [],
    includes: p.includes || [],
    tags: p.tags || [],
  };
}
