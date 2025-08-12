'use client';

interface MarkdownContentProps {
  html: string;
}

export default function MarkdownContent({ html }: MarkdownContentProps) {
  return (
    <div 
      className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl prose-h1:font-bold
        prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:font-semibold prose-h2:mt-6 lg:prose-h2:mt-8 prose-h2:mb-3 lg:prose-h2:mb-4
        prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-4 lg:prose-h3:mt-6 prose-h3:mb-2 lg:prose-h3:mb-3
        prose-h4:text-base sm:prose-h4:text-lg lg:prose-h4:text-xl prose-h4:font-semibold prose-h4:mt-3 lg:prose-h4:mt-4 prose-h4:mb-2
        prose-p:leading-6 sm:prose-p:leading-7 prose-p:mb-3 sm:prose-p:mb-4
        prose-a:text-blue-200 prose-a:no-underline hover:prose-a:underline
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-3 sm:prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm
        prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6
        prose-li:mb-1 sm:prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-3 sm:prose-blockquote:pl-4 prose-blockquote:italic
        prose-table:w-full prose-table:border-collapse prose-table:text-xs sm:prose-table:text-sm
        prose-th:border prose-th:border-gray-300 prose-th:px-2 sm:prose-th:px-4 prose-th:py-1 sm:prose-th:py-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800
        prose-td:border prose-td:border-gray-300 prose-td:px-2 sm:prose-td:px-4 prose-td:py-1 sm:prose-td:py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}