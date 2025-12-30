import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function ChangesRequestedEmail({ context, data, variation }) {
  const { customerName, estimateNumber, adminNote, portalUrl } = data;

  const getSubject = () => {
    return `Update needed for Estimate ${estimateNumber}`;
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We need some additional information to complete your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              For estimate <strong>{estimateNumber}</strong>, we require additional photos to better understand your property's requirements.
            </p>
            {adminNote && (
              <div style={{ 
                backgroundColor: '#fff4e6', 
                padding: '15px', 
                borderRadius: '6px', 
                margin: '15px 0',
                border: '1px solid #ffd89b'
              }}>
                <p style={{ margin: '0', fontStyle: 'italic', color: '#666666' }}>
                  "{adminNote}"
                </p>
              </div>
            )}
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please upload the requested photos through your portal. Once we receive them, we'll update your estimate accordingly.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We need some additional information to complete your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              For estimate <strong>{estimateNumber}</strong>, we require some additional details to better understand your requirements.
            </p>
            {adminNote && (
              <div style={{ 
                backgroundColor: '#fff4e6', 
                padding: '15px', 
                borderRadius: '6px', 
                margin: '15px 0',
                border: '1px solid #ffd89b'
              }}>
                <p style={{ margin: '0', fontStyle: 'italic', color: '#666666' }}>
                  "{adminNote}"
                </p>
              </div>
            )}
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please provide the requested information through your portal. Once we receive it, we'll update your estimate accordingly.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We need to update your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              For estimate <strong>{estimateNumber}</strong>, we require some additional information or changes.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please visit your portal to see what's needed and provide the requested updates. Once we receive them, we'll update your estimate accordingly.
            </p>
          </>
        );
      default:
        return <p>We need to update your estimate.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'A') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Upload Photos
          </EmailCTA>
        </div>
      );
    } else if (variation === 'B') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Update Information
          </EmailCTA>
        </div>
      );
    } else {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            View Portal
          </EmailCTA>
        </div>
      );
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

        {getCTAs()}
      </div>
      <EmailFooter />
    </div>
  );
}

