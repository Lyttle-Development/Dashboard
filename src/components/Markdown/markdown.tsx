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

  // Join all props
  const props = {
    components,
    remarkPlugins,
    className: `${styles.markdown} ${className}`,
  };

  // Return markdown JSX.Element
  return <ReactMarkdown {...props}>{markdownContent}</ReactMarkdown>;
};
