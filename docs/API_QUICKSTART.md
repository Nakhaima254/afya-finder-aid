# AfyaAlert API Quick Start Guide

Get started with AfyaAlert API in minutes.

## Prerequisites

- Supabase project access
- Valid API credentials
- Node.js or any HTTP client

## Installation

### JavaScript/TypeScript

```bash
npm install @supabase/supabase-js
```

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hwomajdxcbtbsmbaucro.supabase.co',
  'YOUR_SUPABASE_ANON_KEY'
);
```

### Python

```bash
pip install supabase
```

```python
from supabase import create_client

supabase = create_client(
    "https://hwomajdxcbtbsmbaucro.supabase.co",
    "YOUR_SUPABASE_ANON_KEY"
)
```

## Quick Examples

### 1. Process M-Pesa Payment

```typescript
const processPayment = async () => {
  const { data, error } = await supabase.functions.invoke('mpesa-payment', {
    body: {
      amount: 1500,
      phoneNumber: '0712345678',
      description: 'Medicine purchase'
    }
  });

  if (error) {
    console.error('Payment failed:', error);
    return;
  }

  console.log('Payment initiated:', data.message);
  // Show instructions to user
  alert(data.instructions);
};
```

### 2. Initialize Paystack Payment

```typescript
const initializePayment = async () => {
  const { data, error } = await supabase.functions.invoke('paystack-payment', {
    body: {
      email: 'customer@example.com',
      amount: 500000, // Amount in kobo
      metadata: {
        description: 'Medicine purchase',
        payment_method: 'card'
      }
    }
  });

  if (error) {
    console.error('Payment initialization failed:', error);
    return;
  }

  // Redirect to Paystack checkout
  window.location.href = data.authorization_url;
};
```

### 3. Send Contact Email

```typescript
const sendContactForm = async (formData) => {
  const { data, error } = await supabase.functions.invoke('send-contact-email', {
    body: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      category: 'general',
      message: formData.message
    }
  });

  if (error) {
    console.error('Failed to send message:', error);
    return;
  }

  console.log('Message sent successfully');
};
```

## React Example

```tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function PaymentForm() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          amount: 1500,
          phoneNumber: '0712345678',
          description: 'Medicine purchase'
        }
      });

      if (error) throw error;

      if (data.success) {
        alert(data.message);
      } else {
        alert('Payment failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

## Error Handling

```typescript
const callAPI = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('mpesa-payment', {
      body: paymentData
    });

    // Check for network/function errors
    if (error) {
      console.error('Function error:', error);
      return { success: false, error: error.message };
    }

    // Check for business logic errors
    if (!data.success) {
      console.error('Payment error:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
```

## Testing

### Test M-Pesa Payment (Sandbox)

```typescript
// Success scenario
const testSuccess = await supabase.functions.invoke('mpesa-payment', {
  body: {
    amount: 1,
    phoneNumber: '254708374149', // Test number
    description: 'Test payment'
  }
});

// Insufficient balance scenario
const testInsufficientBalance = await supabase.functions.invoke('mpesa-payment', {
  body: {
    amount: 1,
    phoneNumber: '254711111111', // Test number
    description: 'Test payment'
  }
});
```

### Test Paystack Payment

```typescript
// Use test email and amount
const testPaystack = await supabase.functions.invoke('paystack-payment', {
  body: {
    email: 'test@example.com',
    amount: 100, // Minimum amount in kobo
    metadata: {
      description: 'Test payment'
    }
  }
});
```

## Next Steps

1. Read the [Full API Documentation](./API_DOCUMENTATION.md)
2. Review authentication requirements
3. Implement error handling
4. Set up webhook handlers (for payment confirmations)
5. Test in sandbox before going live

## Common Issues

### Issue: "Missing authentication credentials"
**Solution:** Ensure you're passing the Supabase anon key in headers

### Issue: "M-Pesa credentials not configured"
**Solution:** Contact admin to configure M-Pesa secrets in Supabase

### Issue: Payment timeout
**Solution:** Implement retry logic with exponential backoff

### Issue: CORS errors
**Solution:** Ensure you're using the Supabase client, not direct fetch

## Support

- Documentation: [Full API Docs](./API_DOCUMENTATION.md)
- Email: support@afyaalert.co.ke
