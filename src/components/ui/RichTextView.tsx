import React from 'react';
import { plainToHtml, sanitizeRich } from '../../utils/richText';

interface RichTextViewProps {
  html?: string;
  className?: string;
  emptyLabel?: string;
}

export const RichTextView: React.FC<RichTextViewProps> = ({ html = '', className = '', emptyLabel = '—' }) => {
  const safe = sanitizeRich(plainToHtml(html));
  if (!safe) {
    return <p className={`text-gray-400 ${className}`}>{emptyLabel}</p>;
  }
  return (
    <div
      className={`rich-view ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};
