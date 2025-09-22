"use client";
import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Simple markdown parsing
  const parseMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let codeBlockIndex = 0;

    // Split by code blocks first
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(parseInlineMarkdown(beforeText, parts.length));
      }

      // Add code block
      const language = match[1] || "text";
      const code = match[2];
      
      parts.push(
        <div key={`code-${codeBlockIndex}`} className="relative my-4">
          <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-sm">
              <span className="text-gray-300">{language}</span>
              <button
                onClick={() => copyToClipboard(code, codeBlockIndex)}
                className="text-gray-400 hover:text-white transition-colors text-xs flex items-center gap-1"
              >
                {copiedIndex === codeBlockIndex ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm">{code}</code>
            </pre>
          </div>
        </div>
      );

      currentIndex = match.index + match[0].length;
      codeBlockIndex++;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(parseInlineMarkdown(remainingText, parts.length));
    }

    return parts;
  };

  const parseInlineMarkdown = (text: string, keyPrefix: number) => {
    // Simple inline markdown parsing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        elements.push(<br key={`${keyPrefix}-br-${lineIndex}`} />);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`${keyPrefix}-h1-${lineIndex}`} className="text-xl font-bold mb-2 mt-4">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`${keyPrefix}-h2-${lineIndex}`} className="text-lg font-bold mb-2 mt-3">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`${keyPrefix}-h3-${lineIndex}`} className="text-base font-bold mb-1 mt-2">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Lists
      if (line.match(/^[-*+]\s/)) {
        elements.push(
          <div key={`${keyPrefix}-li-${lineIndex}`} className="flex items-start gap-2 my-1">
            <span className="text-gray-600 mt-1">•</span>
            <span>{parseInlineStyles(line.slice(2))}</span>
          </div>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`${keyPrefix}-p-${lineIndex}`} className="mb-2">
          {parseInlineStyles(line)}
        </p>
      );
    });

    return elements;
  };

  const parseInlineStyles = (text: string) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let index = 0;

    // Bold **text**
    remaining = remaining.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${index}__`;
      parts.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {content}
        </strong>
      );
      index++;
      return placeholder;
    });

    // Italic *text*
    remaining = remaining.replace(/\*(.*?)\*/g, (match, content) => {
      const placeholder = `__ITALIC_${index}__`;
      parts.push(
        <em key={`italic-${index}`} className="italic">
          {content}
        </em>
      );
      index++;
      return placeholder;
    });

    // Inline code `text`
    remaining = remaining.replace(/`(.*?)`/g, (match, content) => {
      const placeholder = `__CODE_${index}__`;
      parts.push(
        <code key={`code-${index}`} className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {content}
        </code>
      );
      index++;
      return placeholder;
    });

    // Replace placeholders with actual components
    const finalParts: React.ReactNode[] = [];
    const placeholderRegex = /__(?:BOLD|ITALIC|CODE)_(\d+)__/g;
    let lastIndex = 0;
    let placeholderMatch;

    while ((placeholderMatch = placeholderRegex.exec(remaining)) !== null) {
      // Add text before placeholder
      if (placeholderMatch.index > lastIndex) {
        finalParts.push(remaining.slice(lastIndex, placeholderMatch.index));
      }

      // Add the component
      const componentIndex = parseInt(placeholderMatch[1]);
      finalParts.push(parts[componentIndex]);

      lastIndex = placeholderMatch.index + placeholderMatch[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      finalParts.push(remaining.slice(lastIndex));
    }

    return finalParts;
  };

  return <div className="prose prose-sm max-w-none">{parseMarkdown(content)}</div>;
}
