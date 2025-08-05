import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MessageSquare, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  rating: number;
  communicationRating?: number;
  timelinessRating?: number;
  paymentRating?: number;
  review?: string;
  raterName: string;
  createdAt: string;
  bookingDetails?: {
    origin: string;
    destination: string;
    rate: number;
  };
}

const ReviewCard = ({
  rating,
  communicationRating,
  timelinessRating,
  paymentRating,
  review,
  raterName,
  createdAt,
  bookingDetails
}: ReviewCardProps) => {
  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < score ? 'fill-warning text-warning' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const getRatingBadge = (score: number) => {
    if (score >= 4.5) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 3.5) return { variant: 'secondary' as const, label: 'Good' };
    if (score >= 2.5) return { variant: 'outline' as const, label: 'Fair' };
    return { variant: 'destructive' as const, label: 'Poor' };
  };

  const overallBadge = getRatingBadge(rating);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{raterName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-2">
              {renderStars(rating)}
              <span className="ml-2 font-semibold">{rating.toFixed(1)}</span>
            </div>
            <Badge variant={overallBadge.variant}>
              {overallBadge.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bookingDetails && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>{bookingDetails.origin} → {bookingDetails.destination}</span>
              <span className="font-semibold">${bookingDetails.rate.toLocaleString()}</span>
            </div>
          </div>
        )}

        {(communicationRating || timelinessRating || paymentRating) && (
          <div className="grid grid-cols-3 gap-4">
            {communicationRating && (
              <div className="text-center">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="flex justify-center mb-1">
                  {renderStars(communicationRating)}
                </div>
                <p className="text-xs text-muted-foreground">Communication</p>
              </div>
            )}
            
            {timelinessRating && (
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="flex justify-center mb-1">
                  {renderStars(timelinessRating)}
                </div>
                <p className="text-xs text-muted-foreground">Timeliness</p>
              </div>
            )}
            
            {paymentRating && (
              <div className="text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="flex justify-center mb-1">
                  {renderStars(paymentRating)}
                </div>
                <p className="text-xs text-muted-foreground">Payment</p>
              </div>
            )}
          </div>
        )}

        {review && (
          <div className="border-t pt-4">
            <p className="text-sm leading-relaxed">{review}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;