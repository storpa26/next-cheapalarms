import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function AcceptanceEmail({ context, data, variation }) {
  const { customerName, estimateNumber, invoiceNumber, portalUrl, bookingDate, bookingTime } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return `Thank you! Estimate ${estimateNumber} accepted`;
      case 'B':
        return `Thank you! Estimate ${estimateNumber} accepted`;
      case 'C':
        return 'Estimate accepted - Installation scheduled!';
      default:
        return 'Thank you! Estimate accepted';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for accepting estimate <strong>{estimateNumber}</strong>! We're excited to help secure your property.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your invoice <strong>{invoiceNumber}</strong> is now ready for payment. 
              You can review the details and make a payment through your portal.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Once payment is received, we'll schedule your installation. You'll receive a confirmation email with all the details.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for accepting estimate <strong>{estimateNumber}</strong>! We're excited to help secure your property.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We're currently preparing your invoice. You'll receive an email notification as soon as it's ready for payment.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              In the meantime, you can track the progress in your portal. We'll keep you updated every step of the way.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for accepting estimate <strong>{estimateNumber}</strong>! We're excited to help secure your property.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Great news! Your installation has been scheduled:
            </p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '20px', 
              borderRadius: '6px', 
              margin: '15px 0',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Date:</strong> {bookingDate}
              </div>
              <div>
                <strong>Time:</strong> {bookingTime}
              </div>
            </div>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              We'll send you a reminder closer to the date. You can view all booking details in your portal.
            </p>
          </>
        );
      default:
        return <p>Thank you for accepting your estimate.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'A') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Pay Invoice
          </EmailCTA>
          <div style={{ marginTop: '15px' }}>
            <EmailCTA href={portalUrl} variant="link">
              View Portal
            </EmailCTA>
          </div>
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

