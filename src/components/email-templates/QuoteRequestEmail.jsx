import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function QuoteRequestEmail({ context, data, variation }) {
  const { isNewUser, hasPasswordSet, hasPreviousEstimates, estimateCount } = context;
  const { customerName, estimateNumber, portalUrl, resetUrl, loginUrl } = data;

  const getGreeting = () => {
    if (isNewUser) {
      return `Hi ${customerName},`;
    }
    if (hasPreviousEstimates) {
      return `Hi ${customerName},`;
    }
    return `Hi ${customerName},`;
  };

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Welcome! Your CheapAlarms quote is ready';
      case 'B':
        return `Your new quote ${estimateNumber} is ready`;
      case 'C':
        return `Your new quote ${estimateNumber} is ready`;
      case 'D':
        return 'Another quote ready for you';
      default:
        return 'Your quote is ready';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Welcome to CheapAlarms! We're excited to help secure your property.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've prepared your personalized quote <strong>{estimateNumber}</strong> based on your requirements. 
              To access your quote and set up your account, please set a password using the link below.
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
              Great to have you back! We've prepared a new quote for you.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your new quote <strong>{estimateNumber}</strong> is ready for review. 
              {hasPreviousEstimates && ` This is your ${estimateCount === 2 ? 'second' : `${estimateCount}th`} quote with us.`}
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Simply log in to your portal to view and manage this quote.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've prepared a new quote for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your new quote <strong>{estimateNumber}</strong> is ready for review. 
              To access it, please set a password for your account using the link below.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once you've set your password, you'll be able to view your quote and manage your account.
            </p>
          </>
        );
      case 'D':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've prepared another quote for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your new quote <strong>{estimateNumber}</strong> is ready. 
              This is your {estimateCount === 2 ? 'second' : `${estimateCount}th`} quote with us.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              You can view this quote and all your previous estimates in your portal.
            </p>
          </>
        );
      default:
        return <p>Your quote is ready.</p>;
    }
  };

  const getCTAs = () => {
    switch (variation) {
      case 'A':
        return (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <EmailCTA href={resetUrl} variant="primary">
              Set Your Password
            </EmailCTA>
            <div style={{ marginTop: '15px' }}>
              <EmailCTA href={portalUrl} variant="link">
                View as Guest
              </EmailCTA>
            </div>
          </div>
        );
      case 'B':
        return (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <EmailCTA href={portalUrl} variant="primary">
              View Your Quote
            </EmailCTA>
            <div style={{ marginTop: '15px' }}>
              <EmailCTA href={loginUrl} variant="link">
                Login to Portal
              </EmailCTA>
            </div>
          </div>
        );
      case 'C':
        return (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <EmailCTA href={resetUrl} variant="primary">
              Set Your Password
            </EmailCTA>
            <div style={{ marginTop: '15px' }}>
              <EmailCTA href={portalUrl} variant="link">
                View as Guest
              </EmailCTA>
            </div>
          </div>
        );
      case 'D':
        return (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <EmailCTA href={portalUrl} variant="primary">
              View New Quote
            </EmailCTA>
            <div style={{ marginTop: '15px' }}>
              <EmailCTA href={portalUrl} variant="link">
                View All Quotes
              </EmailCTA>
            </div>
          </div>
        );
      default:
        return null;
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
            {getGreeting()}
          </p>
          {getMessage()}
        </div>

        {getCTAs()}
      </div>
      <EmailFooter />
    </div>
  );
}

