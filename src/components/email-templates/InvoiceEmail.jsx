import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';
import { formatCurrency } from './utils/formatters';

export function InvoiceEmail({ context, data, variation }) {
  const { isNewUser } = context;
  const { customerName, invoiceNumber, invoiceTotal, estimateNumber, dueDate, portalUrl } = data;

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return `Your invoice ${invoiceNumber} is ready for payment`;
      case 'B':
        return `Invoice ${invoiceNumber} ready - Estimate ${estimateNumber}`;
      case 'C':
        return `Invoice ${invoiceNumber} - Payment due ${dueDate}`;
      case 'D':
        return `Invoice ${invoiceNumber} - Partial payment received`;
      default:
        return 'Your invoice is ready';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Welcome! Your invoice is ready for payment.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Invoice <strong>{invoiceNumber}</strong> for <strong>{formatCurrency(invoiceTotal)}</strong> is now available in your portal. 
              You can review the details and make a payment at your convenience.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              We accept secure online payments through your portal. If you have any questions, please don't hesitate to contact us.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your invoice is ready for payment.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Invoice <strong>{invoiceNumber}</strong> for <strong>{formatCurrency(invoiceTotal)}</strong> 
              {estimateNumber && ` related to estimate ${estimateNumber}`} is now available in your portal.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              You can review the details and make a payment at your convenience. We accept secure online payments through your portal.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              <strong style={{ color: '#c95375' }}>Important:</strong> Your invoice payment is due soon.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Invoice <strong>{invoiceNumber}</strong> for <strong>{formatCurrency(invoiceTotal)}</strong> is due on <strong>{dueDate}</strong>.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please make a payment before the due date to avoid any delays. You can pay securely through your portal.
            </p>
          </>
        );
      case 'D':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Thank you for your payment!
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              We've received a partial payment for invoice <strong>{invoiceNumber}</strong>. 
              The remaining balance is <strong>{formatCurrency(invoiceTotal)}</strong>.
            </p>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              You can view the payment details and pay the remaining balance in your portal.
            </p>
          </>
        );
      default:
        return <p>Your invoice is ready.</p>;
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

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '6px', 
          margin: '20px 0',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#666666' }}>Invoice Number:</span>
            <strong>{invoiceNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#666666' }}>Amount:</span>
            <strong style={{ fontSize: '18px', color: '#c95375' }}>{formatCurrency(invoiceTotal)}</strong>
          </div>
          {dueDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666666' }}>Due Date:</span>
              <strong>{dueDate}</strong>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Pay Invoice
          </EmailCTA>
        </div>
      </div>
      <EmailFooter />
    </div>
  );
}

