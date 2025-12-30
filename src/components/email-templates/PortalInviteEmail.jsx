import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function PortalInviteEmail({ context, data, variation }) {
  const { isNewUser, hasPasswordSet, hasPreviousEstimates, estimateCount } = context;
  const { customerName, portalUrl, resetUrl, loginUrl } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Your CheapAlarms portal is ready';
      case 'B':
        return 'Your CheapAlarms portal is ready';
      case 'C':
        return 'Portal invite resent - CheapAlarms';
      case 'D':
        return 'Portal invite resent - CheapAlarms';
      case 'E':
        return `Your portal is ready - ${estimateCount} estimates available`;
      default:
        return 'Your portal is ready';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your CheapAlarms customer portal is ready! This is your secure space to view estimates, 
              track installations, and manage your account.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              To get started, please set a password for your account using the link below. 
              Once set, you'll have full access to your portal.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In your portal, you can view your estimates, accept quotes, upload photos, and track your installation progress.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your CheapAlarms customer portal is ready! This is your secure space to view estimates, 
              track installations, and manage your account.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Simply log in with your existing password to access your portal and view your estimates.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In your portal, you can view your estimates, accept quotes, upload photos, and track your installation progress.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We're resending your portal invite. Your portal is ready and waiting for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Simply log in with your existing password to access your portal and view your estimates.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              If you need to reset your password, you can do so from the login page.
            </p>
          </>
        );
      case 'D':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We're resending your portal invite. Your portal is ready and waiting for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              To access your portal, please set a password for your account using the link below. 
              Once set, you'll have full access to view your estimates and manage your account.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In your portal, you can view your estimates, accept quotes, upload photos, and track your installation progress.
            </p>
          </>
        );
      case 'E':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your CheapAlarms customer portal is ready! You have <strong>{estimateCount} estimates</strong> available for review.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              {hasPasswordSet 
                ? 'Simply log in to access all your estimates and manage your account.'
                : 'Please set a password using the link below to access all your estimates and manage your account.'
              }
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In your portal, you can view all your estimates, accept quotes, upload photos, and track your installation progress.
            </p>
          </>
        );
      default:
        return <p>Your portal is ready.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'A' || variation === 'D') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={resetUrl} variant="primary">
            Set Password
          </EmailCTA>
          <div style={{ marginTop: '15px' }}>
            <EmailCTA href={portalUrl} variant="link">
              Open Portal
            </EmailCTA>
          </div>
        </div>
      );
    } else if (variation === 'B' || variation === 'C') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={loginUrl} variant="primary">
            Login to Portal
          </EmailCTA>
        </div>
      );
    } else if (variation === 'E') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          {hasPasswordSet ? (
            <EmailCTA href={portalUrl} variant="primary">
              View All Estimates
            </EmailCTA>
          ) : (
            <>
              <EmailCTA href={resetUrl} variant="primary">
                Set Password
              </EmailCTA>
              <div style={{ marginTop: '15px' }}>
                <EmailCTA href={portalUrl} variant="link">
                  View All Estimates
                </EmailCTA>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
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

        {getCTAs()}
      </div>
      <EmailFooter />
    </div>
  );
}

