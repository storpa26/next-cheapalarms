import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function EstimateEmail({ context, data, variation }) {
  const { isNewUser, hasPasswordSet } = context;
  const { customerName, estimateNumber, portalUrl, resetUrl, loginUrl } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
      case 'B':
      case 'C':
        return `Your estimate ${estimateNumber} is ready`;
      case 'D':
        return `Estimate ${estimateNumber} resent`;
      default:
        return 'Your estimate is ready';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Great news! We've prepared your personalized estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your estimate <strong>{estimateNumber}</strong> is ready for review. 
              To access it, please set a password for your account using the link below.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once you've set your password, you'll be able to view your estimate, accept it, and track your installation progress.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've prepared a new estimate for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your estimate <strong>{estimateNumber}</strong> is ready for review. 
              Simply log in to your portal to view it.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In your portal, you can review all the details, accept the estimate, and track your installation progress.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've prepared a new estimate for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your estimate <strong>{estimateNumber}</strong> is ready for review. 
              To access it, please set a password for your account using the link below.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once you've set your password, you'll be able to view your estimate and manage your account.
            </p>
          </>
        );
      case 'D':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We're resending your estimate for your convenience.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your estimate <strong>{estimateNumber}</strong> is available in your portal. 
              {hasPasswordSet 
                ? ' Simply log in to view it.'
                : ' Please set a password to access it.'
              }
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              If you have any questions about your estimate, please don't hesitate to contact us.
            </p>
          </>
        );
      default:
        return <p>Your estimate is ready.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'A' || variation === 'C') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={resetUrl} variant="primary">
            Set Password
          </EmailCTA>
          <div style={{ marginTop: '15px' }}>
            <EmailCTA href={portalUrl} variant="link">
              View Estimate
            </EmailCTA>
          </div>
        </div>
      );
    } else if (variation === 'B') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            View Estimate
          </EmailCTA>
          <div style={{ marginTop: '15px' }}>
            <EmailCTA href={loginUrl} variant="link">
              Login
            </EmailCTA>
          </div>
        </div>
      );
    } else if (variation === 'D') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          {hasPasswordSet ? (
            <EmailCTA href={portalUrl} variant="primary">
              View Estimate
            </EmailCTA>
          ) : (
            <>
              <EmailCTA href={resetUrl} variant="primary">
                Set Password
              </EmailCTA>
              <div style={{ marginTop: '15px' }}>
                <EmailCTA href={portalUrl} variant="link">
                  View Estimate
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

