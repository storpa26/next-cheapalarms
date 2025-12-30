export function EmailPreview({ EmailComponent, context, data, variation }) {
  if (typeof window !== 'undefined') {
    console.log('EmailPreview render:', {
      hasComponent: !!EmailComponent,
      componentName: EmailComponent?.name || 'null',
      variation,
      context,
      data
    });
  }

  if (!EmailComponent) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>Select an email type and variation to preview</p>
        <p style={{ fontSize: '12px', marginTop: '10px', color: '#999' }}>
          EmailComponent is null or undefined
        </p>
        <p style={{ fontSize: '11px', marginTop: '5px', color: '#999', fontFamily: 'monospace' }}>
          Check browser console for details
        </p>
      </div>
    );
  }

  try {
    return (
      <div style={{
        maxWidth: '100%',
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <EmailComponent context={context} data={data} variation={variation} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
        <p>Error rendering email preview</p>
        <p style={{ fontSize: '12px', marginTop: '10px', color: '#999' }}>
          {error.message}
        </p>
      </div>
    );
  }
}

