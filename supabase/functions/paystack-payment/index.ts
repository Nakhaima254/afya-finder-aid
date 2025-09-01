import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  email: string;
  amount: number; // Amount in kobo (100 kobo = 1 Naira)
  metadata?: {
    description?: string;
    payment_method?: string;
    phone?: string;
    bank_code?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paymentData: PaymentRequest = await req.json();
    console.log("Received payment request:", paymentData);

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: paymentData.email,
        amount: paymentData.amount,
        currency: "KES", // Kenyan Shilling
        metadata: {
          ...paymentData.metadata,
          source: "AfyaAlert Pharmacy Payment"
        },
        callback_url: "https://afyaalert.com/payment-success",
        channels: paymentData.metadata?.payment_method === "mobile_money" 
          ? ["mobile_money"] 
          : paymentData.metadata?.payment_method === "bank_transfer"
          ? ["bank"]
          : ["card", "bank", "mobile_money"]
      }),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error("Paystack API error:", errorData);
      throw new Error(errorData.message || "Failed to initialize payment");
    }

    const responseData = await paystackResponse.json();
    console.log("Paystack response:", responseData);

    if (responseData.status && responseData.data) {
      return new Response(JSON.stringify({
        success: true,
        authorization_url: responseData.data.authorization_url,
        access_code: responseData.data.access_code,
        reference: responseData.data.reference
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      throw new Error("Invalid response from Paystack");
    }
  } catch (error: any) {
    console.error("Error in paystack-payment function:", error);
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