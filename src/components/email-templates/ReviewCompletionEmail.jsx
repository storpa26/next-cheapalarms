import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function ReviewCompletionEmail({ context, data, variation }) {
  const { customerName, estimateNumber, savingsAmount, portalUrl, adminNote } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Your estimate review is complete';
      case 'B':
        return `Great news! Estimate updated - You save ${formatCurrency(savingsAmount)}`;
      case 'C':
        return 'Your estimate has been reviewed and updated';
      default:
        return 'Estimate review complete';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've completed our review of your estimate!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Estimate <strong>{estimateNumber}</strong> has been reviewed and is ready for your acceptance. 
              No changes were needed - everything looks great!
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              You can now accept the estimate and proceed with your installation. View the details in your portal.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              🎉 Great news! We've completed our review and found some savings for you!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              After reviewing estimate <strong>{estimateNumber}</strong>, we've updated it to better reflect your needs.
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
              You can now accept the updated estimate and proceed with your installation. View the details in your portal.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've completed our review of your estimate.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Estimate <strong>{estimateNumber}</strong> has been reviewed and updated. 
              We've made some adjustments based on our review of your requirements.
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
      default:
        return <p>Your estimate review is complete.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'B') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Accept & Save
          </EmailCTA>
        </div>
      );
    } else if (variation === 'C') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Review Changes
          </EmailCTA>
        </div>
      );
    } else {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Accept Estimate
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

