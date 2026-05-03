import { components, remarkPlugins } from './markdown.config';
import ReactMarkdown from 'react-markdown';
import styles from './markdown.module.scss';

export interface MarkdownProps {
  children?: string;
  content?: string;
  className?: string;
}

export const Markdown = ({ children, content, className }: MarkdownProps) => {
  // Get content for markdown conversion.
  const markdownContent: string = children || content || '';

  // Join all props - className is not supported by ReactMarkdown, wrap in div instead
  const props = {
    components,
    remarkPlugins,
  };

  // Return markdown JSX.Element wrapped in a div for styling
  return (
    <div className={`${styles.markdown} ${className || ''}`}>
      <ReactMarkdown {...props}>{markdownContent}</ReactMarkdown>
    </div>
  );
};
