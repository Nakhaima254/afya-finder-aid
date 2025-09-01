import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  description: string;
}

// M-Pesa API configuration
const MPESA_ENDPOINT = "https://sandbox.safaricom.co.ke"; // Use https://api.safaricom.co.ke for production
const BUSINESS_SHORT_CODE = "174379"; // Test shortcode, replace with your actual shortcode

const getAccessToken = async (): Promise<string> => {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch(`${MPESA_ENDPOINT}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get M-Pesa access token");
  }

  const data = await response.json();
  return data.access_token;
};

const generatePassword = (timestamp: string): string => {
  let passkey = (Deno.env.get("MPESA_PASSKEY") || "").trim();
  // If using sandbox shortcode and the provided passkey looks invalid, fallback to known sandbox passkey
  const looksInvalid = passkey.length < 40;
  if ((BUSINESS_SHORT_CODE === "174379") && (looksInvalid || !passkey)) {
    console.warn("MPESA_PASSKEY looks invalid for sandbox. Falling back to sandbox test passkey.");
    passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  }
  const password = btoa(`${BUSINESS_SHORT_CODE}${passkey}${timestamp}`);
  return password;
};

const getTimestamp = (): string => {
  return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
};

const formatPhoneNumber = (phone: string): string => {
  // Remove any spaces, dashes, or plus signs
  phone = phone.replace(/[\s\-\+]/g, "");
  
  // If it starts with 0, replace with 254
  if (phone.startsWith("0")) {
    phone = "254" + phone.substring(1);
  }
  
  // If it doesn't start with 254, add it
  if (!phone.startsWith("254")) {
    phone = "254" + phone;
  }
  
  return phone;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, description }: PaymentRequest = await req.json();
    
    console.log("M-Pesa payment request:", { amount, phoneNumber, description });

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log("Formatted phone number:", formattedPhone);

    // Get access token
    const accessToken = await getAccessToken();
    console.log("Access token obtained successfully");

    // Generate timestamp and password (must match)
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    // STK Push request
    const stkPushPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure integer
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: "https://your-callback-url.com/callback", // Replace with your actual callback URL
      AccountReference: "AfyaAlert",
      TransactionDesc: description || "AfyaAlert Service Payment"
    };

    console.log("STK Push payload:", stkPushPayload);

    const stkResponse = await fetch(`${MPESA_ENDPOINT}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushPayload),
    });

    const stkData = await stkResponse.json();
    console.log("STK Push response:", stkData);

    if (stkData.ResponseCode === "0") {
      const response = {
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        message: `STK push sent to ${phoneNumber}. Please check your phone and enter your M-Pesa PIN.`,
        instructions: `1. You will receive an M-Pesa prompt on ${phoneNumber}\n2. Enter your M-Pesa PIN\n3. Confirm the payment of KES ${amount}\n4. You will receive a confirmation SMS`
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      const errMsg = stkData.errorMessage || stkData.ResponseDescription || "STK push failed";
      return new Response(JSON.stringify({ success: false, error: errMsg, data: stkData }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

  } catch (error: any) {
    console.error("Error in mpesa-payment function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);