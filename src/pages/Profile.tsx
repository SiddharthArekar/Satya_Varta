import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/firebaseConfig';
import { User as FirebaseUser, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Upload, Trash2, Camera, Heart, Globe, Building2, Laptop, Trophy, Film, Microscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadProfilePicture, deleteProfilePicture, validateImageFile } from '@/utils/imageUpload';
import { useUserInterests } from '@/hooks/useUserInterests';
import { NewsCategory } from '@/components/CategoryTabs';
import { Slider } from '@/components/ui/slider';

const Profile = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { preferences, updateInterest, isLoading: interestsLoading } = useUserInterests();

  const interestCategories: { id: NewsCategory; label: string; icon: any; description: string }[] = [
    { id: 'world', label: 'World News', icon: Globe, description: 'Global events and international news' },
    { id: 'business', label: 'Business', icon: Building2, description: 'Financial markets and corporate news' },
    { id: 'technology', label: 'Technology', icon: Laptop, description: 'Tech innovations and digital trends' },
    { id: 'sports', label: 'Sports', icon: Trophy, description: 'Athletic events and sports news' },
    { id: 'entertainment', label: 'Entertainment', icon: Film, description: 'Movies, music, and celebrity news' },
    { id: 'health', label: 'Health', icon: Heart, description: 'Medical news and wellness updates' },
    { id: 'science', label: 'Science', icon: Microscope, description: 'Scientific discoveries and research' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        updatedAt: new Date()
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await uploadProfilePicture(file);
      
      if (result.success) {
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been successfully updated.",
        });
        // Trigger a re-render by updating the user state
        if (auth.currentUser) {
          setUser({ ...auth.currentUser });
        }
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    setIsUploadingImage(true);
    try {
      const result = await deleteProfilePicture();
      
      if (result.success) {
        toast({
          title: "Profile picture removed",
          description: "Reverted to your Google profile picture.",
        });
        // Trigger a re-render by updating the user state
        if (auth.currentUser) {
          setUser({ ...auth.currentUser });
        }
      } else {
        toast({
          title: "Remove failed",
          description: result.error || "Failed to remove image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isCustomImage = () => {
    if (!user?.photoURL) return false;
    // Check if the current photo URL is a custom uploaded image
    return user.photoURL.includes('profile-pictures');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and profile information.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="text-xl">
                      {getInitials(user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      {isCustomImage() 
                        ? 'Using custom uploaded image' 
                        : 'Using Google profile picture'
                      }
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploadingImage}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isUploadingImage}
                        className="relative"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                    </div>
                    
                    {isCustomImage() && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Custom
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPEG, PNG, WebP. Max size: 5MB. Images will be automatically resized to 400×400px.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed as it's linked to your authentication provider.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and statistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email Account'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.metadata.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Sign In</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.metadata.lastSignInTime ? 
                      new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User ID</Label>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {user?.uid}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News Interests</CardTitle>
              <CardDescription>
                Customize your news preferences to get personalized recommendations in the "For You" section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {interestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-6">
                  {interestCategories.map(({ id, label, icon: Icon, description }) => {
                    const currentWeight = preferences?.interests.find(i => i.category === id)?.weight || 0;
                    
                    return (
                      <div key={id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <h4 className="font-medium">{label}</h4>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                          <div className="text-sm font-medium min-w-[3rem] text-right">
                            {Math.round(currentWeight * 100)}%
                          </div>
                        </div>
                        
                        <div className="ml-8 space-y-2">
                          <Slider
                            value={[currentWeight]}
                            onValueChange={([value]) => updateInterest(id, value)}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Not interested</span>
                            <span>Very interested</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> Adjust the sliders above to tell us which topics you're most interested in. 
                      This helps us recommend the most relevant news articles for you.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
