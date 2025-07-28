import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStripeConnect = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createStripeAccount = async (brokerData: {
    email: string;
    company_name: string;
    country?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-account', {
        body: brokerData
      });

      if (error) throw error;

      toast({
        title: "Stripe Account Created",
        description: "Complete your onboarding to start receiving payments",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Stripe account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (loadId: string, amount: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { load_id: loadId, amount }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createStripeAccount,
    createPaymentIntent,
    loading
  };
};