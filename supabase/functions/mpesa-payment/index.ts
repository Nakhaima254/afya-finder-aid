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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, description }: PaymentRequest = await req.json();
    
    console.log("M-Pesa payment request:", { amount, phoneNumber, description });

    // For now, we'll simulate M-Pesa integration
    // In a real implementation, you would integrate with Safaricom's M-Pesa API
    // This requires proper M-Pesa credentials and API setup
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demonstration, we'll return a success response
    // In production, this would make actual API calls to M-Pesa
    const response = {
      success: true,
      transactionId: `MP${Date.now()}${Math.floor(Math.random() * 1000)}`,
      message: `Payment request sent to ${phoneNumber} for KES ${amount}`,
      merchantPhoneNumber: "0718098165", // Your M-Pesa number
      instructions: `1. You will receive an M-Pesa prompt on ${phoneNumber}\n2. Enter your M-Pesa PIN\n3. Confirm the payment to 0718098165\n4. You will receive a confirmation SMS`
    };

    console.log("M-Pesa payment response:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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