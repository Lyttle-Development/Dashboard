import remarkGfm from 'remark-gfm';
import { Link } from '../link';
import { MarkdownComponents } from './';
import { Components } from 'react-markdown';

// Plugins used in markdown conversion
export const remarkPlugins = [remarkGfm];

// Components used in markdown conversion (html tag to react component)
export const components: Components = {
  h1: 'h2',
  h2: 'h3',
  h3: 'h4',
  h4: 'h5',
  h5: 'h6',
  h6: 'p',
  a: ({ ...props }) =>
    Link({
      href: props.href,
      children: props.children,
    }),
  ol: ({ ...props }) =>
    MarkdownComponents.List({
      children: props.children,
      ordered: true,
    }),
  ul: ({ ...props }) =>
    MarkdownComponents.List({
      children: props.children,
      ordered: false,
    }),
};
