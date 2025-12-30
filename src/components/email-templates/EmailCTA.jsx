export function EmailCTA({ href, children, variant = 'primary', style = {} }) {
  const baseStyle = {
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.2s ease',
    ...style
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#c95375',
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#c95375',
      border: '2px solid #c95375',
    },
    link: {
      backgroundColor: 'transparent',
      color: '#1EA6DF',
      border: 'none',
      textDecoration: 'underline',
      padding: '8px 0',
    }
  };

  const finalStyle = {
    ...baseStyle,
    ...variantStyles[variant]
  };

  return (
    <a href={href || '#'} style={finalStyle}>
      {children}
    </a>
  );
}

