import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us! We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error Sending Message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!paymentAmount || !paymentPhone) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and phone number for M-Pesa payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('mpesa-payment', {
        body: {
          amount: parseFloat(paymentAmount),
          phoneNumber: paymentPhone,
          description: "AfyaAlert Service Payment"
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Request Sent",
        description: data.instructions,
      });

      setPaymentAmount("");
      setPaymentPhone("");
    } catch (error: any) {
      console.error("Error processing M-Pesa payment:", error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email anytime",
      contact: "nakhaimaisaac068@gmail.com",
      action: "mailto:nakhaimaisaac068@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us - Main",
      description: "Primary contact number",
      contact: "0718098165",
      action: "tel:0718098165",
    },
    {
      icon: Phone,
      title: "Call Us - Alt 1",
      description: "Alternative contact number",
      contact: "0795077642",
      action: "tel:0795077642",
    },
    {
      icon: Phone,
      title: "Call Us - Alt 2", 
      description: "Alternative contact number",
      contact: "0742441936",
      action: "tel:0742441936",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our office location",
      contact: "Nairobi, Kenya",
      action: "#",
    },
  ];

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "pharmacy", label: "Pharmacy Partnership" },
    { value: "technical", label: "Technical Support" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "media", label: "Media & Press" },
    { value: "other", label: "Other" },
  ];

  const faqs = [
    {
      icon: HelpCircle,
      question: "How do I search for medicines?",
      answer: "Use our search page to enter the medicine name and select your location to find the best prices and availability.",
    },
    {
      icon: Building2,
      question: "How can my pharmacy join?",
      answer: "Visit our Partner Pharmacies page and click 'Join as a Partner Pharmacy' to submit your application.",
    },
    {
      icon: MessageCircle,
      question: "Is the service free?",
      answer: "Yes! AfyaAlert is completely free for patients searching for medicines. We earn through pharmacy partnerships.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <h1 className="text-3xl font-bold lg:text-4xl">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're here to help! Reach out with any questions, feedback, or partnership inquiries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief subject of your message"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="bg-accent/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Response Time:</strong> We typically respond within 24 hours during business days. 
                      For urgent pharmacy-related issues, please call us directly.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information & FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Methods */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                      <method.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {method.description}
                      </p>
                      <a
                        href={method.action}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {method.contact}
                      </a>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <faq.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                    {index < faqs.length - 1 && <hr className="border-muted" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* M-Pesa Payment */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  M-Pesa Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Make payments directly to our M-Pesa: <span className="font-semibold">0718098165</span>
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Amount (KES)</label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Your Phone Number</label>
                    <Input
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                    />
                  </div>
                  <Button onClick={handleMpesaPayment} className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay via M-Pesa
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    You will receive an M-Pesa prompt on your phone to complete the payment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Times are in East Africa Time (EAT). Emergency pharmacy inquiries 
                    may be handled outside these hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;