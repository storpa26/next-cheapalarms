export function EmailFooter() {
  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      padding: '30px 20px',
      textAlign: 'center',
      borderTop: '1px solid #e0e0e0',
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong style={{ color: '#333333' }}>CheapAlarms</strong>
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Your trusted security partner
        </p>
        <p style={{ margin: '0', fontSize: '11px', color: '#999999' }}>
          This email was sent to you regarding your account. If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  );
}

