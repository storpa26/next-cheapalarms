import { EmailHeader } from './EmailHeader';
import { EmailFooter } from './EmailFooter';
import { EmailCTA } from './EmailCTA';

export function BookingEmail({ context, data, variation }) {
  const { customerName, bookingDate, bookingTime, invoiceNumber, invoiceTotal, portalUrl } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSubject = () => {
    switch (variation) {
      case 'A':
        return 'Your installation has been scheduled';
      case 'B':
        return 'Installation scheduled - Payment required';
      case 'C':
        return 'Installation rescheduled - New date';
      default:
        return 'Installation scheduled';
    }
  };

  const getMessage = () => {
    switch (variation) {
      case 'A':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your installation has been scheduled! We're looking forward to securing your property.
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
              We'll send you a reminder closer to the date. You can view all booking details and track the progress in your portal.
            </p>
          </>
        );
      case 'B':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your installation has been scheduled! However, payment is required before we can proceed.
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
              <div style={{ marginBottom: '10px' }}>
                <strong>Installation Time:</strong> {bookingTime}
              </div>
              <div style={{ 
                paddingTop: '15px', 
                borderTop: '1px solid #e0e0e0',
                color: '#c95375'
              }}>
                <strong>Payment Required:</strong> {formatCurrency(invoiceTotal)}
              </div>
            </div>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Please complete payment for invoice <strong>{invoiceNumber}</strong> to confirm your installation booking.
            </p>
          </>
        );
      case 'C':
        return (
          <>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your installation date has been rescheduled. We apologize for any inconvenience.
            </p>
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              Your new installation details:
            </p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '20px', 
              borderRadius: '6px', 
              margin: '15px 0',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>New Installation Date:</strong> {bookingDate}
              </div>
              <div>
                <strong>New Installation Time:</strong> {bookingTime}
              </div>
            </div>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.6' }}>
              We'll send you a reminder closer to the new date. If you have any questions or need to reschedule again, please contact us.
            </p>
          </>
        );
      default:
        return <p>Your installation has been scheduled.</p>;
    }
  };

  const getCTAs = () => {
    if (variation === 'B') {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            Pay Invoice
          </EmailCTA>
          <div style={{ marginTop: '15px' }}>
            <EmailCTA href={portalUrl} variant="link">
              View Booking Details
            </EmailCTA>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <EmailCTA href={portalUrl} variant="primary">
            View Booking Details
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

