import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Phone, MapPin, Settings, Camera, Upload } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get current user data from database
  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    enabled: !!user,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Type assertions for arrays
  const userAddresses = (addresses as any[]) || [];
  const userOrders = (orders as any[]) || [];

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/users/${user?.uid}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // Convert image to base64 for simple storage (in production, use cloud storage)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const base64Image = await convertToBase64(file);
      await apiRequest("PUT", `/api/users/${user?.uid}/profile-image`, {
        profileImage: base64Image,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-user-name">
                  {user.displayName || "User"}
                </h1>
                <p className="text-muted-foreground" data-testid="text-user-email">
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">Addresses</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex items-center space-x-4">
                    {currentUser?.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex flex-col space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex items-center space-x-2"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            <span>Change Photo</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          data-testid="input-profile-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          data-testid="input-profile-email"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        data-testid="input-profile-phone"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-update-profile"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="border border-border rounded-lg p-4" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <p className="font-medium mt-1">${order.total}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} items
                          </p>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </span>
                  <Button size="sm" data-testid="button-add-address">
                    Add Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userAddresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No addresses saved.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAddresses.map((address: any) => (
                      <div key={address.id} className="border border-border rounded-lg p-4" data-testid={`address-${address.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {address.firstName} {address.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your orders and account
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text messages about your orders
                    </p>
                  </div>
                  <Switch data-testid="switch-sms-notifications" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about promotions and new products
                    </p>
                  </div>
                  <Switch data-testid="switch-marketing-emails" />
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" data-testid="button-delete-account">
                    Delete Account
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
