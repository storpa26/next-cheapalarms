import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';
import { formatCurrency } from './utils/formatters';

export function PaymentEmail({ context, data, variation }) {
  const { customerName, paymentAmount, invoiceNumber, invoiceTotal, bookingDate, bookingTime, portalUrl } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Payment confirmed - Thank you!';
      case 'B':
        return `Partial payment received - ${formatCurrency(paymentAmount)}`;
      case 'C':
        return 'Payment confirmed - Installation scheduled!';
      default:
        return 'Payment confirmed';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for your payment!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've successfully received your payment of <strong style={{ color: '#10b981' }}>{formatCurrency(paymentAmount)}</strong> 
              {invoiceNumber && ` for invoice ${invoiceNumber}`}.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Your installation will be scheduled shortly. You'll receive a confirmation email with all the details. 
              You can track the progress in your portal.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for your partial payment!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've received your payment of <strong style={{ color: '#10b981' }}>{formatCurrency(paymentAmount)}</strong> 
              {invoiceNumber && ` for invoice ${invoiceNumber}`}.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              <strong>Remaining Balance:</strong> <strong style={{ color: '#c95375' }}>{formatCurrency(invoiceTotal - paymentAmount)}</strong>
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              You can pay the remaining balance at any time through your portal. Once the full payment is received, we'll schedule your installation.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for your payment!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've successfully received your payment of <strong style={{ color: '#10b981' }}>{formatCurrency(paymentAmount)}</strong>.
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
                <strong>Installation Date:</strong> {bookingDate}
              </div>
              <div>
                <strong>Installation Time:</strong> {bookingTime}
              </div>
            </div>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              We'll send you a reminder closer to the date. You can view all booking details in your portal.
            </p>
          </>
        );
      default:
        return <p>Thank you for your payment.</p>;
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
          <EmailCTA href={portalUrl} variant="primary">
            View Portal
          </EmailCTA>
        </div>
      </div>
      <EmailFooter />
    </div>
  );
}

