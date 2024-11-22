import React from 'react';
import { Twitter, Linkedin, Github, Globe } from 'lucide-react';

interface SocialLinksProps {
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  className?: string;
}

export default function SocialLinks({ website, twitter, linkedin, github, className = '' }: SocialLinksProps) {
  const links = [
    { url: website, icon: Globe, label: 'Website' },
    { url: twitter, icon: Twitter, label: 'Twitter' },
    { url: linkedin, icon: LinkedIn, label: 'LinkedIn' },
    { url: github, icon: Github, label: 'GitHub' }
  ].filter(link => link.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex space-x-4 ${className}`}>
      {links.map(({ url, icon: Icon, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors"
          title={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}