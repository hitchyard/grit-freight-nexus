import { supabase } from "@/integrations/supabase/client";

interface SendEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const useEmail = () => {
  const sendEmail = async ({ to, subject, text, html }: SendEmailProps) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, text, html }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  return { sendEmail };
};