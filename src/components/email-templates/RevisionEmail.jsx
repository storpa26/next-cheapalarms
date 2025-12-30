import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function RevisionEmail({ context, data, variation }) {
  const { customerName, estimateNumber, savingsAmount, adminNote, portalUrl } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return `🎉 Great news! Your estimate updated - Save ${formatCurrency(savingsAmount)}`;
      case 'B':
        return 'Your estimate has been updated';
      case 'C':
        return 'Your estimate has been updated';
      default:
        return 'Estimate updated';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              🎉 Great news! We've updated your estimate and found some savings for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Estimate <strong>{estimateNumber}</strong> has been revised to better reflect your needs and requirements.
            </p>
            <div style={{ 
              backgroundColor: '#d1fae5', 
              padding: '20px', 
              borderRadius: '6px', 
              margin: '15px 0',
              border: '2px solid #10b981',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#065f46' }}>
                You Save
              </p>
              <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                {formatCurrency(savingsAmount)}
              </p>
            </div>
            {adminNote && (
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '6px', 
                margin: '15px 0',
                border: '1px solid #e0e0e0'
              }}>
                <p style={{ margin: '0', fontStyle: 'italic', color: '#666666' }}>
                  "{adminNote}"
                </p>
              </div>
            )}
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Review the updated estimate in your portal. If everything looks good, you can accept it and save!
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've updated your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Estimate <strong>{estimateNumber}</strong> has been revised. We've made some adjustments based on our review of your requirements.
            </p>
            {adminNote && (
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '6px', 
                margin: '15px 0',
                border: '1px solid #e0e0e0'
              }}>
                <p style={{ margin: '0', fontStyle: 'italic', color: '#666666' }}>
                  "{adminNote}"
                </p>
              </div>
            )}
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please review the changes in your portal. If everything looks good, you can accept the updated estimate.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've updated your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Estimate <strong>{estimateNumber}</strong> has been revised. We've made some adjustments based on our review of your requirements.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please review the changes in your portal. If everything looks good, you can accept the updated estimate.
            </p>
          </>
        );
      default:
        return <p>Your estimate has been updated.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'A') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Accept & Save
          </EmailCTA>
        </div>
      );
    } else {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Review Changes
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

