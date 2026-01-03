'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1 className="text-2xl font-semibold mb-4 text-text-primary" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="text-xl font-semibold mb-3 text-text-primary" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="text-lg font-semibold mb-2 text-text-primary" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="mb-4 text-text-primary leading-relaxed" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 text-text-primary" {...props} />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 text-text-primary" {...props} />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="mb-1 text-text-primary" {...props} />
          ),          code: ({ node: _node, ...props }: any) => (
            <code
              className="bg-bg-secondary px-1.5 py-0.5 rounded text-sm text-text-primary"
              {...props}
            />
          ),
          pre: ({ node: _node, ...props }: any) => (
            <pre
              className="bg-bg-secondary p-4 rounded mb-4 overflow-x-auto text-sm text-text-primary"
              {...props}
            />
          ),
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-4 border-border-subtle pl-4 italic mb-4 text-text-secondary"
              {...props}
            />
          ),
          a: ({ node: _node, ...props }: any) => (
            <a
              className="text-text-primary underline hover:text-text-secondary"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

