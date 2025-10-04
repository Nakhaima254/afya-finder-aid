# AfyaAlert API Documentation

**Version:** 1.0.0  
**Base URL:** `https://hwomajdxcbtbsmbaucro.supabase.co/functions/v1`  
**Last Updated:** September 28, 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Edge Functions](#edge-functions)
   - [M-Pesa Payment](#mpesa-payment)
   - [Paystack Payment](#paystack-payment)
   - [Send Contact Email](#send-contact-email)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)

---

## Authentication

### Overview

All API endpoints require authentication using Supabase API keys. Include the following headers in your requests:

```http
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

### Authentication Values

- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3b21hamR4Y2J0YnNtYmF1Y3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTIzNjQsImV4cCI6MjA3MjA2ODM2NH0.-KNdEw2KnsROoMNMkb11BSnOKT2EcxOXWk6-7NWVZZo`
- **Project URL:** `https://hwomajdxcbtbsmbaucro.supabase.co`

### Security Notes

- Never expose service role keys in client-side code
- Always use the anon key for client-side requests
- Row Level Security (RLS) policies protect your data

---

## Edge Functions

### M-Pesa Payment

Process M-Pesa STK Push payments for medicine purchases.

#### Endpoint

```
POST /functions/v1/mpesa-payment
```

#### Authentication

- **Required:** Yes (Supabase anon key)
- **User Authentication:** Optional
- **RLS Policies:** N/A (public endpoint with JWT verification disabled)

#### Request Body

```typescript
{
  amount: number;        // Amount in KES (Kenyan Shillings)
  phoneNumber: string;   // Customer phone number (formats: 0712345678, 712345678, 254712345678, +254712345678)
  description: string;   // Payment description
}
```

#### Request Example

```bash
curl -X POST https://hwomajdxcbtbsmbaucro.supabase.co/functions/v1/mpesa-payment \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "phoneNumber": "0712345678",
    "description": "Medicine purchase - Paracetamol 500mg"
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_28092025132045123456789",
  "merchantRequestId": "12345-67890-12345",
  "message": "STK push sent to 0712345678. Please check your phone and enter your M-Pesa PIN.",
  "instructions": "1. You will receive an M-Pesa prompt on 0712345678\n2. Enter your M-Pesa PIN\n3. Confirm the payment of KES 1500\n4. You will receive a confirmation SMS"
}
```

#### Error Responses

**Invalid Phone Number (400)**
```json
{
  "success": false,
  "error": "Invalid phone number format",
  "data": {
    "ResponseCode": "400",
    "ResponseDescription": "Bad Request - Invalid PhoneNumber"
  }
}
```

**Insufficient Balance (400)**
```json
{
  "success": false,
  "error": "Insufficient balance",
  "data": {
    "ResponseCode": "1",
    "ResponseDescription": "The balance is insufficient for the transaction"
  }
}
```

**Configuration Error (500)**
```json
{
  "success": false,
  "error": "M-Pesa credentials not configured"
}
```

#### Phone Number Formats

The endpoint accepts multiple phone number formats:
- `0712345678` → Converted to `254712345678`
- `712345678` → Converted to `254712345678`
- `254712345678` → Used as is
- `+254712345678` → Converted to `254712345678`

#### Important Notes

- **Sandbox Mode:** Currently using M-Pesa sandbox environment
- **Amount:** Will be rounded to nearest integer
- **Callback URL:** Replace `https://your-callback-url.com/callback` with your actual callback endpoint
- **Business Shortcode:** `174379` (sandbox), update for production

#### Testing

**Test Phone Numbers (Sandbox):**
- Success: `254708374149`
- Insufficient balance: `254711111111`
- Invalid phone: `254799999999`

---

### Paystack Payment

Initialize Paystack payment for card, bank transfer, and mobile money payments.

#### Endpoint

```
POST /functions/v1/paystack-payment
```

#### Authentication

- **Required:** Yes (Supabase anon key)
- **User Authentication:** Optional
- **RLS Policies:** N/A (public endpoint with JWT verification disabled)

#### Request Body

```typescript
{
  email: string;           // Customer email address
  amount: number;          // Amount in Kenyan Shillings (will be converted to kobo)
  metadata?: {
    description?: string;    // Payment description
    payment_method?: string; // "mobile_money" | "bank_transfer" | "card"
    phone?: string;         // Customer phone number
    bank_code?: string;     // Bank code for bank transfer
  };
}
```

#### Request Example

```bash
curl -X POST https://hwomajdxcbtbsmbaucro.supabase.co/functions/v1/paystack-payment \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "amount": 500000,
    "metadata": {
      "description": "Medicine purchase - Amoxicillin 500mg",
      "payment_method": "mobile_money",
      "phone": "254712345678"
    }
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/abc123xyz",
  "access_code": "abc123xyz",
  "reference": "ref_xyz123abc"
}
```

**Usage:**
1. Redirect user to `authorization_url` to complete payment
2. User completes payment on Paystack checkout page
3. User is redirected back to your `callback_url`
4. Verify payment using `reference` via Paystack API

#### Error Responses

**Invalid Email (500)**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Amount Too Low (500)**
```json
{
  "success": false,
  "error": "Amount is below minimum allowed"
}
```

**Configuration Error (500)**
```json
{
  "success": false,
  "error": "Paystack secret key not configured"
}
```

#### Payment Methods

**Card Payment:**
```json
{
  "email": "customer@example.com",
  "amount": 500000
}
```

**Mobile Money:**
```json
{
  "email": "customer@example.com",
  "amount": 500000,
  "metadata": {
    "payment_method": "mobile_money",
    "phone": "254712345678"
  }
}
```

**Bank Transfer:**
```json
{
  "email": "customer@example.com",
  "amount": 500000,
  "metadata": {
    "payment_method": "bank_transfer",
    "bank_code": "057"
  }
}
```

#### Important Notes

- **Currency:** KES (Kenyan Shillings)
- **Amount Format:** In kobo (100 kobo = 1 KES)
- **Callback URL:** Currently set to `https://afyaalert.com/payment-success`
- **Channels:** Card, bank transfer, and mobile money enabled by default

#### Verifying Payments

After payment completion, verify using Paystack's verify endpoint:

```bash
curl https://api.paystack.co/transaction/verify/:reference \
  -H "Authorization: Bearer YOUR_PAYSTACK_SECRET_KEY"
```

---

### Send Contact Email

Send contact form submissions via email using Resend.

#### Endpoint

```
POST /functions/v1/send-contact-email
```

#### Authentication

- **Required:** Yes (Supabase anon key)
- **User Authentication:** Optional
- **RLS Policies:** N/A (public endpoint with JWT verification disabled)

#### Request Body

```typescript
{
  name: string;       // Full name (required)
  email: string;      // Email address (required, validated)
  phone: string;      // Phone number (optional)
  subject: string;    // Email subject (required)
  category: string;   // Category: "general" | "pharmacy" | "technical" | "billing"
  message: string;    // Message content (required, max 1000 characters)
}
```

#### Request Example

```bash
curl -X POST https://hwomajdxcbtbsmbaucro.supabase.co/functions/v1/send-contact-email \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+254712345678",
    "subject": "Question about medicine availability",
    "category": "general",
    "message": "I would like to know if you have Amoxicillin 500mg in stock at your Nairobi branch."
  }'
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

#### Error Responses

**Validation Error (500)**
```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

**Missing Required Fields (500)**
```json
{
  "success": false,
  "error": "Name, email, subject, and message are required"
}
```

**Email Service Error (500)**
```json
{
  "success": false,
  "error": "Failed to send email"
}
```

#### Email Delivery

- **From:** AfyaAlert Contact <onboarding@resend.dev>
- **To:** nakhaimaisaac068@gmail.com
- **Reply-To:** Customer's email address
- **Format:** HTML formatted email with styled template

#### Email Template

The email includes:
- Contact person's name and contact details
- Subject and category
- Full message content
- Reply-to configured for easy response

#### Important Notes

- **Resend API Key Required:** Must be configured in Supabase secrets
- **Domain Verification:** Ensure sending domain is verified in Resend
- **Rate Limiting:** Consider implementing rate limiting for contact forms
- **Validation:** Email format is validated, phone is optional

#### Email Categories

- `general` - General inquiries
- `pharmacy` - Pharmacy partnership inquiries
- `technical` - Technical support
- `billing` - Billing and payment questions

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

### Common Error Scenarios

#### Missing Authentication
```json
{
  "success": false,
  "error": "Missing or invalid authentication credentials"
}
```

#### Invalid Request Body
```json
{
  "success": false,
  "error": "Invalid request body: missing required field 'amount'"
}
```

#### Service Configuration Error
```json
{
  "success": false,
  "error": "Service credentials not configured"
}
```

---

## Rate Limiting

### Default Limits

- **M-Pesa Payment:** 10 requests per minute per IP
- **Paystack Payment:** 20 requests per minute per IP
- **Contact Email:** 5 requests per minute per IP

### Rate Limit Headers

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1695900000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

---

## Testing & Development

### Environment Variables Required

**M-Pesa:**
- `MPESA_CONSUMER_KEY` - M-Pesa consumer key
- `MPESA_CONSUMER_SECRET` - M-Pesa consumer secret
- `MPESA_PASSKEY` - M-Pesa passkey

**Paystack:**
- `PAYSTACK_SECRET_KEY` - Paystack secret key

**Resend:**
- `RESEND_API_KEY` - Resend API key

### Test Credentials

Contact your development team for test API credentials.

### Sandbox vs Production

**M-Pesa:**
- Sandbox: `https://sandbox.safaricom.co.ke`
- Production: `https://api.safaricom.co.ke`

**Paystack:**
- Test mode: Use test secret key (starts with `sk_test_`)
- Live mode: Use live secret key (starts with `sk_live_`)

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  const response = await supabase.functions.invoke('mpesa-payment', {
    body: paymentData
  });
  
  if (response.error) throw response.error;
  
  const { data } = response;
  if (!data.success) {
    // Handle payment failure
    console.error('Payment failed:', data.error);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

### 2. Input Validation

Validate all inputs before sending to API:

```typescript
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().min(1).max(1000000),
  phoneNumber: z.string().regex(/^(\+?254|0)[17]\d{8}$/),
  description: z.string().min(1).max(200)
});

const validatedData = paymentSchema.parse(formData);
```

### 3. Security

- Never log sensitive data (API keys, tokens)
- Use HTTPS for all requests
- Implement CSRF protection
- Validate webhooks signatures

### 4. Retry Logic

Implement exponential backoff for failed requests:

```typescript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

---

## Support

For API support and questions:

- **Email:** support@afyaalert.co.ke
- **Documentation:** https://docs.afyaalert.co.ke
- **Status Page:** https://status.afyaalert.co.ke

---

## Changelog

### Version 1.0.0 (2025-09-28)
- Initial API documentation
- M-Pesa payment integration
- Paystack payment integration
- Contact email functionality
