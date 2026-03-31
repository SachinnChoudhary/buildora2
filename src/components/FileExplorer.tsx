'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileExplorerProps {
  tree: FileNode[];
}

function TreeNode({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDirectory = node.type === 'directory';

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors ${level > 0 ? 'ml-4 border-l border-white/10' : ''}`}
        onClick={() => isDirectory && setIsOpen(!isOpen)}
        style={{ paddingLeft: level === 0 ? '8px' : '20px' }}
      >
        {isDirectory ? (
          <>
            {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <Folder size={16} className="text-brand-orange fill-brand-orange/20" />
          </>
        ) : (
          <>
            <div className="w-[14px]" /> {/* Spacer to align with chevron */}
            <File size={16} className="text-brand-purple fill-brand-purple/20" />
          </>
        )}
        <span className={`text-sm ${isDirectory ? 'text-white font-medium' : 'text-gray-400'}`}>
          {node.name}
        </span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode key={`${child.name}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ tree }: FileExplorerProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-50">
        <Folder size={32} className="mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">File structure not available.</p>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Structure</p>
      </div>
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {tree.map((node, index) => (
          <TreeNode key={`${node.name}-${index}`} node={node} />
        ))}
      </div>
    </div>
  );
}
