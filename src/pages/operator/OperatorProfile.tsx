import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X, Phone, Car, MapPin } from 'lucide-react';

const SERVICE_AREAS = [
  'Puerto Princesa',
  'Port Barton',
  'San Vicente',
  'Lumambong Beach',
  'El Nido',
  'Sabang',
  'Nacpan Beach'
];

export default function OperatorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    operator_name: '',
    whatsapp_number: '',
    transport_type: '',
    van_type: '',
    license_plate: '',
    capacity: '',
    base_price: '',
    operating_area: '',
    license_image_url: '',
    vehicle_photos: [] as string[]
  });

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [vehicleFiles, setVehicleFiles] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      loadOperatorData();
    }
  }, [user]);

  const loadOperatorData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFormData({
        operator_name: data.operator_name || '',
        whatsapp_number: data.whatsapp_number || '',
        transport_type: data.transport_type || '',
        van_type: data.van_type || '',
        license_plate: data.license_plate || '',
        capacity: data.capacity?.toString() || '',
        base_price: data.base_price?.toString() || '',
        operating_area: data.operating_area || '',
        license_image_url: data.license_image_url || '',
        vehicle_photos: data.vehicle_photos || []
      });
    }
    setLoading(false);
  };

  const uploadLicenseImage = async (): Promise<string | null> => {
    if (!licenseFile) return formData.license_image_url;
    
    const fileExt = licenseFile.name.split('.').pop();
    const fileName = `${user.id}-license-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('operator-documents')
      .upload(fileName, licenseFile);
    
    if (uploadError) {
      toast.error('Failed to upload license');
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('operator-documents')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const uploadVehiclePhotos = async (): Promise<string[]> => {
    if (vehicleFiles.length === 0) return formData.vehicle_photos;
    
    const uploadedUrls: string[] = [...formData.vehicle_photos];
    
    for (const file of vehicleFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('operator-documents')
        .upload(fileName, file);
      
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('operator-documents')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const licenseUrl = await uploadLicenseImage();
    const vehicleUrls = await uploadVehiclePhotos();
    
    if (!licenseUrl && licenseFile) {
      setSaving(false);
      return;
    }
    
    const operatorData = {
      user_id: user.id,
      operator_name: formData.operator_name,
      whatsapp_number: formData.whatsapp_number,
      transport_type: formData.transport_type,
      van_type: formData.van_type,
      license_plate: formData.license_plate,
      capacity: parseInt(formData.capacity) || 0,
      base_price: parseInt(formData.base_price) || 0,
      operating_area: formData.operating_area,
      license_image_url: licenseUrl,
      vehicle_photos: vehicleUrls,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('operators')
      .upsert(operatorData, { onConflict: 'user_id' });

    if (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } else {
      toast.success('Profile saved successfully');
      setVehicleFiles([]);
      setLicenseFile(null);
    }
    
    setSaving(false);
  };

  const removeVehiclePhoto = (index: number) => {
    const newPhotos = [...formData.vehicle_photos];
    newPhotos.splice(index, 1);
    setFormData({ ...formData, vehicle_photos: newPhotos });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">Operator Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.operator_name}
                onChange={(e) => setFormData({...formData, operator_name: e.target.value})}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp Number
              </Label>
              <Input
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                placeholder="09123456789"
                required
              />
              <p className="text-xs text-muted-foreground">Travelers will contact you via WhatsApp</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select 
                value={formData.transport_type} 
                onValueChange={(val) => setFormData({...formData, transport_type: val, van_type: ''})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private_van">Private Van</SelectItem>
                  <SelectItem value="4x4_truck">4x4 Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.transport_type === 'private_van' && (
              <div className="space-y-2">
                <Label>Van Type</Label>
                <Select 
                  value={formData.van_type} 
                  onValueChange={(val) => setFormData({...formData, van_type: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select van type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Van (10-12 seats)</SelectItem>
                    <SelectItem value="luxury">Luxury Van (6-8 seats)</SelectItem>
                    <SelectItem value="family">Family Van (14-16 seats)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>License Plate</Label>
                <Input
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                  placeholder="ABC-1234"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Passenger Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base Price (PHP)</Label>
              <Input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                placeholder="2500"
                required
              />
              <p className="text-xs text-muted-foreground">Starting price for your service</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={formData.operating_area} 
              onValueChange={(val) => setFormData({...formData, operating_area: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary service area" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_AREAS.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">License / Permit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.license_image_url && (
              <div className="relative w-32 h-32">
                <img 
                  src={formData.license_image_url} 
                  alt="License" 
                  className="w-full h-full object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                className="hidden"
                id="license-upload"
              />
              <label htmlFor="license-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {licenseFile ? licenseFile.name : 'Click to upload license/permit'}
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.vehicle_photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formData.vehicle_photos.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img 
                      src={url} 
                      alt={`Vehicle ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeVehiclePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setVehicleFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="vehicle-upload"
              />
              <label htmlFor="vehicle-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {vehicleFiles.length > 0 
                    ? `${vehicleFiles.length} files selected` 
                    : 'Click to upload vehicle photos'}
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Upload multiple photos of your vehicle (interior and exterior)</p>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
