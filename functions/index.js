const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AdmZip = require('adm-zip');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

/**
 * Triggered on file upload to Storage.
 * Extracts ZIP metadata and updates Firestore with the file tree.
 */
exports.extractProjectTree = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // projects/{projectId}/source.zip
  
  // Only process source.zip files
  if (!filePath.endsWith('source.zip')) return null;

  const bucket = admin.storage().bucket(object.bucket);
  const projectId = filePath.split('/')[1];
  
  const tempFilePath = path.join(os.tmpdir(), 'source.zip');

  try {
    // 1. Download ZIP to temp
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log(`Downloaded ZIP for project: ${projectId}`);

    // 2. Extract and parse tree
    const zip = new AdmZip(tempFilePath);
    const zipEntries = zip.getEntries();
    
    const tree = [];
    
    zipEntries.forEach((entry) => {
      const entryPath = entry.entryName;
      // Skip hidden files/folders (like __MACOSX or .DS_Store)
      if (entryPath.includes('__MACOSX') || entryPath.includes('.DS_Store')) return;
      
      const parts = entryPath.split('/').filter(p => p !== '');
      let currentLevel = tree;

      parts.forEach((part, index) => {
        const isDir = entry.isDirectory || index < parts.length - 1;
        let existingNode = currentLevel.find(node => node.name === part);

        if (!existingNode) {
          existingNode = {
            name: part,
            type: isDir ? 'directory' : 'file',
          };
          if (isDir) existingNode.children = [];
          currentLevel.push(existingNode);
        }

        if (isDir) {
          currentLevel = existingNode.children;
        }
      });
    });

    // 3. Update Firestore
    await admin.firestore().collection('projects').doc(projectId).update({
      fileTree: tree,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Successfully updated file tree for project: ${projectId}`);

    // 4. Cleanup
    fs.unlinkSync(tempFilePath);
    return null;

  } catch (err) {
    console.error('Error extracting project tree:', err);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    return null;
  }
});
