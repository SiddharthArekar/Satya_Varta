// Location Service for detecting user's location and providing location-based news
export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface LocationNewsOptions {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

class LocationService {
  private cachedLocation: LocationData | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cacheTimestamp: number = 0;

  // Get user's current location
  public async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check cache first
      if (this.cachedLocation && this.isCacheValid()) {
        return this.cachedLocation;
      }

      // Try to get location from browser geolocation
      const geoLocation = await this.getGeolocationFromBrowser();
      if (geoLocation) {
        this.cachedLocation = geoLocation;
        this.cacheTimestamp = Date.now();
        return geoLocation;
      }

      // Fallback to IP-based location detection
      const ipLocation = await this.getLocationFromIP();
      if (ipLocation) {
        this.cachedLocation = ipLocation;
        this.cacheTimestamp = Date.now();
        return ipLocation;
      }

      // Final fallback to default location
      const defaultLocation: LocationData = {
        country: 'United States',
        countryCode: 'us',
        region: 'California',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles'
      };

      this.cachedLocation = defaultLocation;
      this.cacheTimestamp = Date.now();
      return defaultLocation;

    } catch (error) {
      console.error('Error getting location:', error);
      return this.getDefaultLocation();
    }
  }

  // Get location using browser geolocation API
  private async getGeolocationFromBrowser(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get location details
            const locationData = await this.reverseGeocode(latitude, longitude);
            if (locationData) {
              locationData.latitude = latitude;
              locationData.longitude = longitude;
              resolve(locationData);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Error in reverse geocoding:', error);
            resolve(null);
          }
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Get location from IP address using a free service
  private async getLocationFromIP(): Promise<LocationData | null> {
    try {
      // Using ipapi.co for IP-based location detection
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP location service failed');

      const data = await response.json();
      
      return {
        country: data.country_name || 'United States',
        countryCode: data.country_code?.toLowerCase() || 'us',
        region: data.region || 'California',
        city: data.city || 'San Francisco',
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone || 'America/Los_Angeles'
      };
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  }

  // Reverse geocoding to get location details from coordinates
  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationData | null> {
    try {
      // Using OpenStreetMap Nominatim service (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      const address = data.address;

      return {
        country: address.country || 'United States',
        countryCode: this.getCountryCode(address.country_code),
        region: address.state || address.region || 'California',
        city: address.city || address.town || address.village || 'San Francisco',
        latitude,
        longitude,
        timezone: this.getTimezoneFromCountry(address.country_code)
      };
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  // Get country code mapping
  private getCountryCode(countryCode: string): string {
    const mapping: Record<string, string> = {
      'us': 'us',
      'united states': 'us',
      'gb': 'gb',
      'united kingdom': 'gb',
      'ca': 'ca',
      'canada': 'ca',
      'au': 'au',
      'australia': 'au',
      'de': 'de',
      'germany': 'de',
      'fr': 'fr',
      'france': 'fr',
      'it': 'it',
      'italy': 'it',
      'es': 'es',
      'spain': 'es',
      'in': 'in',
      'india': 'in',
      'jp': 'jp',
      'japan': 'jp',
      'kr': 'kr',
      'south korea': 'kr',
      'cn': 'cn',
      'china': 'cn',
      'br': 'br',
      'brazil': 'br',
      'mx': 'mx',
      'mexico': 'mx',
      'ru': 'ru',
      'russia': 'ru'
    };

    return mapping[countryCode?.toLowerCase()] || 'us';
  }

  // Get timezone from country code
  private getTimezoneFromCountry(countryCode: string): string {
    const timezoneMapping: Record<string, string> = {
      'us': 'America/New_York',
      'gb': 'Europe/London',
      'ca': 'America/Toronto',
      'au': 'Australia/Sydney',
      'de': 'Europe/Berlin',
      'fr': 'Europe/Paris',
      'it': 'Europe/Rome',
      'es': 'Europe/Madrid',
      'in': 'Asia/Kolkata',
      'jp': 'Asia/Tokyo',
      'kr': 'Asia/Seoul',
      'cn': 'Asia/Shanghai',
      'br': 'America/Sao_Paulo',
      'mx': 'America/Mexico_City',
      'ru': 'Europe/Moscow'
    };

    return timezoneMapping[countryCode?.toLowerCase()] || 'America/New_York';
  }

  // Check if cached location is still valid
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  // Get default location
  private getDefaultLocation(): LocationData {
    return {
      country: 'United States',
      countryCode: 'us',
      region: 'California',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles'
    };
  }

  // Clear cached location
  public clearCache(): void {
    this.cachedLocation = null;
    this.cacheTimestamp = 0;
  }

  // Get location-based news options
  public getLocationNewsOptions(location: LocationData): LocationNewsOptions {
    return {
      country: location.countryCode,
      region: location.region,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 50 // 50km radius for local news
    };
  }

  // Format location for display
  public formatLocation(location: LocationData): string {
    if (location.city && location.region) {
      return `${location.city}, ${location.region}`;
    } else if (location.region) {
      return location.region;
    } else {
      return location.country;
    }
  }
}

// Create singleton instance
export const locationService = new LocationService();
