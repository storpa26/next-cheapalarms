// Context detection logic for email templates
export function detectEmailVariation(emailType, context) {
  const { isNewUser, hasPasswordSet, hasPreviousEstimates, estimateCount } = context;

  switch (emailType) {
    case 'quote-request':
      if (isNewUser && !hasPasswordSet) return 'A';
      if (!isNewUser && hasPasswordSet) return 'B';
      if (!isNewUser && !hasPasswordSet) return 'C';
      if (hasPreviousEstimates && estimateCount > 1) return 'D';
      return 'A';

    case 'password-reset':
      if (isNewUser && !hasPasswordSet) return 'A';
      if (!isNewUser && !hasPasswordSet) return 'B';
      if (!isNewUser && hasPasswordSet) return 'B';
      return 'A';

    case 'portal-invite':
      if (isNewUser && !hasPasswordSet) return 'A';
      if (isNewUser && hasPasswordSet) return 'B';
      if (!isNewUser && hasPasswordSet) return 'C';
      if (!isNewUser && !hasPasswordSet) return 'D';
      if (hasPreviousEstimates && estimateCount > 1) return 'E';
      return 'A';

    case 'estimate':
      if (isNewUser && !hasPasswordSet) return 'A';
      if (!isNewUser && hasPasswordSet) return 'B';
      if (!isNewUser && !hasPasswordSet) return 'C';
      return 'D';

    case 'invoice-ready':
      if (isNewUser) return 'A';
      if (!isNewUser) return 'B';
      return 'A';

    case 'acceptance':
      return 'A'; // Default, can be enhanced

    case 'booking':
      return 'A'; // Default

    case 'payment':
      return 'A'; // Default

    case 'changes-requested':
      return 'A'; // Default

    case 'review-completion':
      return 'A'; // Default

    case 'revision':
      return 'A'; // Default

    default:
      return 'A';
  }
}

import { QuoteRequestEmail } from '@/components/email-templates/QuoteRequestEmail';
import { PasswordResetEmail } from '@/components/email-templates/PasswordResetEmail';
import { PortalInviteEmail } from '@/components/email-templates/PortalInviteEmail';
import { EstimateEmail } from '@/components/email-templates/EstimateEmail';
import { InvoiceEmail } from '@/components/email-templates/InvoiceEmail';
import { AcceptanceEmail } from '@/components/email-templates/AcceptanceEmail';
import { BookingEmail } from '@/components/email-templates/BookingEmail';
import { PaymentEmail } from '@/components/email-templates/PaymentEmail';
import { ChangesRequestedEmail } from '@/components/email-templates/ChangesRequestedEmail';
import { ReviewCompletionEmail } from '@/components/email-templates/ReviewCompletionEmail';
import { RevisionEmail } from '@/components/email-templates/RevisionEmail';

export function getEmailTemplate(emailType, variation) {
  const templateMap = {
    'quote-request': QuoteRequestEmail,
    'password-reset': PasswordResetEmail,
    'portal-invite': PortalInviteEmail,
    'estimate': EstimateEmail,
    'invoice-ready': InvoiceEmail,
    'acceptance': AcceptanceEmail,
    'booking': BookingEmail,
    'payment': PaymentEmail,
    'changes-requested': ChangesRequestedEmail,
    'review-completion': ReviewCompletionEmail,
    'revision': RevisionEmail,
  };

  return templateMap[emailType] || null;
}

