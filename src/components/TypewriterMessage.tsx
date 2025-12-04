import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTypewriter } from './TypewriterText';

interface TypewriterMessageProps {
  content: string;
  isStopped: boolean;
  onComplete: () => void;
}

function removeJsonCodeBlocks(content: string): string {
  return content.replace(/```json[\s\S]*?```/g, '');
}

export function TypewriterMessage({ content, isStopped, onComplete }: TypewriterMessageProps) {
  const displayedText = useTypewriter({
    text: content,
    speed: 20,
    onComplete,
    isStopped,
  });

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isJson = match && match[1] === 'json';
          if (isJson) {
            return null;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-white/20">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-white/10">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-white/10">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-white/10">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold border border-white/20">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border border-white/20">
            {children}
          </td>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 last:mb-0">
            {children}
          </p>
        ),
        pre: ({ children }) => {
          const hasJsonCode = React.Children.toArray(children).some((child: any) => {
            return child?.props?.className?.includes('language-json');
          });
          if (hasJsonCode) {
            return null;
          }
          return <pre className="bg-white/5 p-3 rounded-lg overflow-x-auto my-2">{children}</pre>;
        },
      }}
    >
      {removeJsonCodeBlocks(displayedText)}
    </ReactMarkdown>
  );
}

