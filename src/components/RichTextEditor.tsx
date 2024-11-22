import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-primary/90 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-surface-light rounded-lg overflow-hidden">
      <div className="bg-surface-light border-b border-surface-light p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('heading', { level: 1 }) ? 'bg-surface' : ''
          }`}
        >
          <Heading1 className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('heading', { level: 2 }) ? 'bg-surface' : ''
          }`}
        >
          <Heading2 className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('bold') ? 'bg-surface' : ''
          }`}
        >
          <Bold className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('italic') ? 'bg-surface' : ''
          }`}
        >
          <Italic className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('strike') ? 'bg-surface' : ''
          }`}
        >
          <Strikethrough className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('code') ? 'bg-surface' : ''
          }`}
        >
          <Code className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('bulletList') ? 'bg-surface' : ''
          }`}
        >
          <List className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('orderedList') ? 'bg-surface' : ''
          }`}
        >
          <ListOrdered className="h-4 w-4 text-white" />
        </button>
        <button
          onClick={toggleLink}
          className={`p-2 rounded hover:bg-surface ${
            editor.isActive('link') ? 'bg-surface' : ''
          }`}
        >
          <LinkIcon className="h-4 w-4 text-white" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}