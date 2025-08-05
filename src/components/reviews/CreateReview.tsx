import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateReviewProps {
  bookingId: string;
  ratedUserId: string;
  ratedUserName: string;
  onReviewCreated: () => void;
}

const CreateReview = ({ bookingId, ratedUserId, ratedUserName, onReviewCreated }: CreateReviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [paymentRating, setPaymentRating] = useState(0);
  const [review, setReview] = useState('');

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    icon: Icon 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    label: string;
    icon: any;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <Label>{label}</Label>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value 
                  ? 'fill-warning text-warning' 
                  : 'text-muted-foreground hover:text-warning'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          booking_id: bookingId,
          rater_id: user?.id,
          rated_id: ratedUserId,
          rating,
          communication_rating: communicationRating || null,
          timeliness_rating: timelinessRating || null,
          payment_rating: paymentRating || null,
          review: review.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Your review has been posted successfully",
      });

      onReviewCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Experience with {ratedUserName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating"
            icon={Star}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarRating
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
              icon={MessageSquare}
            />

            <StarRating
              value={timelinessRating}
              onChange={setTimelinessRating}
              label="Timeliness"
              icon={Clock}
            />

            <StarRating
              value={paymentRating}
              onChange={setPaymentRating}
              label="Payment"
              icon={DollarSign}
            />
          </div>

          <div>
            <Label htmlFor="review">Written Review (Optional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share details about your experience..."
              rows={4}
              className="mt-2"
            />
          </div>

          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateReview;