declare module 'markdown-it-katex' {
  import type MarkdownIt from 'markdown-it';
  const plugin: (md: MarkdownIt, options?: { throwOnError?: boolean }) => void;
  export default plugin;
}
