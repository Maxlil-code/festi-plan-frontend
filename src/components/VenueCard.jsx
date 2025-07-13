import React from 'react';
import { Button, Card } from './index';

// Section 10.6: VenueCard component for AI recommendations
const VenueCard = ({ venue, onQuote, className = '' }) => {
  return (
    <Card className={`text-left ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
        <span className="text-primary-600 font-bold">
          ${venue.estimatedCost || venue.basePrice || 'TBD'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-2">
        {venue.location || venue.address}
      </p>
      
      <p className="text-gray-500 text-sm mb-3">
        {venue.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-green-600">✓ Available</span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onQuote(venue)}
        >
          Get Quote
        </Button>
      </div>
    </Card>
  );
};

export default VenueCard;
