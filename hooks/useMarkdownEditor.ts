
import { useRef, useCallback } from 'react';

export const useMarkdownEditor = (
  text: string,
  onTextChange: (newText: string) => void
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback((type: 'bold' | 'italic' | 'list' | 'link' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = text.substring(start, end);
    
    let before = text.substring(0, start);
    let after = text.substring(end);
    let insert = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        insert = `**${selection || 'bold text'}**`;
        cursorOffset = 2 + (selection.length || 9);
        break;
      case 'italic':
        insert = `_${selection || 'italic text'}_`;
        cursorOffset = 1 + (selection.length || 11);
        break;
      case 'code':
        insert = `\`${selection || 'code'}\``;
        cursorOffset = 1 + (selection.length || 4);
        break;
      case 'link':
        insert = `[${selection || 'link text'}](url)`;
        cursorOffset = 1 + (selection.length || 9); 
        break;
      case 'list':
        const isStartOfLine = start === 0 || text[start - 1] === '\n';
        const prefix = isStartOfLine ? '- ' : '\n- ';
        insert = `${prefix}${selection || 'list item'}`;
        cursorOffset = prefix.length + (selection.length || 9);
        break;
    }

    const newText = before + insert + after;
    onTextChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  }, [text, onTextChange]);

  return {
    textareaRef,
    applyFormat
  };
};
