import { useMemo } from 'react';

export function EmailCodeView({ EmailComponent, context, data, variation }) {
  const htmlCode = useMemo(() => {
    if (!EmailComponent) {
      return '// Select an email type and variation to see HTML code';
    }

    // For now, show a message that HTML export will be available
    // In production, this would use server-side rendering to generate actual HTML
    return `// HTML Code View
// 
// The email template is rendered above in the preview.
// 
// To export the HTML code for use in PHP email templates:
// 1. Right-click on the email preview
// 2. Select "Inspect Element"
// 3. Copy the HTML from the rendered element
// 
// Or use the email template components directly in your PHP implementation
// by converting the React components to PHP template functions.
//
// Template: ${EmailComponent.name || 'Email Template'}
// Variation: ${variation}
// Context: ${JSON.stringify(context, null, 2)}
// Data: ${JSON.stringify(data, null, 2)}`;
  }, [EmailComponent, context, data, variation]);

  return (
    <div className="rounded-md bg-muted p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">HTML Source Code</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(htmlCode);
          }}
          className="text-xs text-primary hover:underline"
        >
          Copy HTML
        </button>
      </div>
      <pre className="text-xs overflow-auto max-h-[600px]">
        <code>{htmlCode}</code>
      </pre>
    </div>
  );
}

function formatHTML(html) {
  // Basic HTML formatting
  let formatted = html;
  let indent = 0;
  const tab = '  ';
  
  formatted = formatted
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/></g, '>\n<'); // Add newlines between tags
  
  const lines = formatted.split('\n');
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    if (trimmed.startsWith('</')) {
      indent--;
    }
    
    const indented = tab.repeat(Math.max(0, indent)) + trimmed;
    
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indent++;
    }
    
    return indented;
  });
  
  return formattedLines.filter(line => line).join('\n');
}

