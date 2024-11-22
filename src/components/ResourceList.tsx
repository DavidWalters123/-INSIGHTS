import React from 'react';
import { FileText, Link as LinkIcon, Download } from 'lucide-react';
import type { Resource } from '../types';

interface ResourceListProps {
  resources: Resource[];
}

export default function ResourceList({ resources }: ResourceListProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <Download className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!resources?.length) {
    return (
      <div className="text-center text-gray-400 py-4">
        No resources available for this lesson
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resources.map((resource) => (
        <a
          key={resource.id}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 bg-surface rounded-lg hover:bg-surface-light transition-colors"
        >
          {getResourceIcon(resource.type)}
          <span className="ml-3 text-white">{resource.title}</span>
          <span className="ml-auto text-gray-400">
            {resource.type.toUpperCase()}
          </span>
        </a>
      ))}
    </div>
  );
}