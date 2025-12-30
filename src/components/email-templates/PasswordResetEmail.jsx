import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function PasswordResetEmail({ context, data, variation }) {
  const { isNewUser } = context;
  const { customerName, estimateNumber, resetUrl, portalUrl } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Set Your Password - Access Your Quote';
      case 'B':
        return 'Reset Your Password - CheapAlarms Portal';
      case 'C':
        return 'Reset Your Password - CheapAlarms Portal';
      case 'D':
        return `Set Password to Access Estimate ${estimateNumber}`;
      default:
        return 'Set Your Password';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Welcome to CheapAlarms! We've created an account for you so you can access your quote.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              To get started, please set a password for your account using the link below. 
              This will allow you to access your quote <strong>{estimateNumber}</strong> and manage your account.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once you've set your password, you'll be able to view your quote, accept it, and track your installation progress.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We received a request to reset your password for your CheapAlarms account.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Click the link below to reset your password. This link will expire in 24 hours for security reasons.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              If you didn't request this password reset, please ignore this email or contact our support team.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              An administrator has requested a password reset for your CheapAlarms account.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Please set a new password using the link below. This link will expire in 24 hours for security reasons.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once you've set your new password, you'll be able to access your portal and manage your estimates.
            </p>
          </>
        );
      case 'D':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              To access your estimate <strong>{estimateNumber}</strong>, please set a password for your account.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Click the link below to set your password. Once set, you'll be able to view your estimate, accept it, and track your installation progress.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              This link will expire in 24 hours for security reasons.
            </p>
          </>
        );
      default:
        return <p>Please set your password to access your account.</p>;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <EmailHeader />
      <div style={{ padding: '30px 20px', backgroundColor: '#ffffff' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#333333', 
          margin: '0 0 20px 0',
          lineHeight: '1.4'
        }}>
          {getSubject()}
        </h2>
        
        <div style={{ color: '#333333', fontSize: '16px', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 15px 0', fontWeight: '500' }}>
            Hi {customerName},
          </p>
          {getMessage()}
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={resetUrl} variant="primary">
            {isNewUser ? 'Set Your Password' : 'Reset Your Password'}
          </EmailCTA>
          {variation === 'A' && (
            <div style={{ marginTop: '15px' }}>
              <EmailCTA href={portalUrl} variant="link">
                View Quote as Guest
              </EmailCTA>
            </div>
          )}
        </div>
      </div>
      <EmailFooter />
    </div>
  );
}

