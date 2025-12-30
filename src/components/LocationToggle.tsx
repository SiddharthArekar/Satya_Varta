import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Globe, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';

interface LocationToggleProps {
  onLocationChange: (location: LocationData | null, useLocation: boolean) => void;
  className?: string;
}

export const LocationToggle = ({ onLocationChange, className = '' }: LocationToggleProps) => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if location was previously enabled
    const savedLocationEnabled = localStorage.getItem('locationEnabled') === 'true';
    if (savedLocationEnabled) {
      handleLocationToggle(true);
    }
  }, []);

  const handleLocationToggle = async (enabled: boolean) => {
    setIsLocationEnabled(enabled);
    localStorage.setItem('locationEnabled', enabled.toString());

    if (enabled) {
      setIsLoading(true);
      setError(null);

      try {
        const userLocation = await locationService.getCurrentLocation();
        if (userLocation) {
          setLocation(userLocation);
          onLocationChange(userLocation, true);
        } else {
          setError('Unable to detect location');
          setIsLocationEnabled(false);
          onLocationChange(null, false);
        }
      } catch (err) {
        setError('Location access denied or failed');
        setIsLocationEnabled(false);
        onLocationChange(null, false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setLocation(null);
      setError(null);
      onLocationChange(null, false);
    }
  };

  const formatLocation = (location: LocationData): string => {
    if (location.city && location.region) {
      return `${location.city}, ${location.region}`;
    } else if (location.region) {
      return location.region;
    } else {
      return location.country;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Location Toggle Button */}
      <Button
        variant={isLocationEnabled ? "default" : "outline"}
        size="sm"
        onClick={() => handleLocationToggle(!isLocationEnabled)}
        disabled={isLoading}
        className="flex items-center gap-2 transition-all duration-300"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLocationEnabled ? (
          <MapPin className="h-4 w-4" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isLocationEnabled ? 'Local News' : 'Global News'}
        </span>
      </Button>

      {/* Location Display */}
      {isLocationEnabled && location && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
          >
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs font-medium">
              {formatLocation(location)}
            </span>
          </Badge>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2">
          <Badge 
            variant="destructive" 
            className="flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">
              {error}
            </span>
          </Badge>
        </div>
      )}

      {/* Location Info Tooltip */}
      {isLocationEnabled && location && (
        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
          <Settings className="h-3 w-3" />
          <span>Showing news from your location</span>
        </div>
      )}
    </div>
  );
};
