import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TruckerOnboarding from '@/components/onboarding/TruckerOnboarding';
import BrokerOnboarding from '@/components/onboarding/BrokerOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Users, Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        setOnboardingComplete(profile.onboarding_complete);
      } else {
        // Use role from user metadata if no profile exists
        setUserRole(user?.user_metadata?.role || 'trucker');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to trucker role if error
      setUserRole(user?.user_metadata?.role || 'trucker');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if onboarding is complete
  if (onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show role selection if no role is set
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>
              Select your role to complete your profile setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => setUserRole('trucker')}
            >
              <Truck className="mr-3 h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Trucker / Carrier</div>
                <div className="text-sm text-muted-foreground">
                  Find and book freight loads
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => setUserRole('broker')}
            >
              <Users className="mr-3 h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Broker</div>
                <div className="text-sm text-muted-foreground">
                  Post loads and find carriers
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      {userRole === 'trucker' ? (
        <TruckerOnboarding onComplete={handleOnboardingComplete} />
      ) : (
        <BrokerOnboarding onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default OnboardingPage;