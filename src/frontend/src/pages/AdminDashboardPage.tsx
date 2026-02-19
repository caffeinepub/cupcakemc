import { useState } from 'react';
import { useGetWebsiteConfig, useUpdateWebsiteConfig, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import type { Logo, BackgroundSetting } from '../backend';
import { getLogoSrc, getBackgroundStyle } from '../utils/websiteAppearance';

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: config, isLoading: configLoading } = useGetWebsiteConfig();
  const updateConfig = useUpdateWebsiteConfig();

  // Logo state
  const [logoType, setLogoType] = useState<'url' | 'blob'>('url');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  // Background state
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');

  const isLoading = adminCheckLoading || configLoading;

  // Initialize form when config loads
  useState(() => {
    if (config) {
      // Set logo
      if (config.logo.__kind__ === 'url') {
        setLogoType('url');
        setLogoUrl(config.logo.url);
      } else if (config.logo.__kind__ === 'blob') {
        setLogoType('blob');
        setLogoPreview(config.logo.blob.getDirectURL());
      }

      // Set background
      if (config.backgroundSetting.__kind__ === 'color') {
        setBackgroundType('color');
        setBackgroundColor(config.backgroundSetting.color.value);
      } else if (config.backgroundSetting.__kind__ === 'image') {
        setBackgroundType('image');
        setBackgroundImageUrl(config.backgroundSetting.image.value);
      }
    }
  });

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!config) {
      toast.error('Configuration not loaded');
      return;
    }

    try {
      let logo: Logo;

      if (logoType === 'url') {
        logo = { __kind__: 'url', url: logoUrl.trim() };
      } else {
        if (logoFile) {
          // Upload new file
          const arrayBuffer = await logoFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setLogoUploadProgress(percentage);
          });
          logo = { __kind__: 'blob', blob };
        } else if (config.logo.__kind__ === 'blob') {
          // Keep existing blob
          logo = config.logo;
        } else {
          toast.error('Please select a logo image');
          return;
        }
      }

      let backgroundSetting: BackgroundSetting;
      if (backgroundType === 'color') {
        backgroundSetting = { __kind__: 'color', color: { value: backgroundColor } };
      } else {
        backgroundSetting = { __kind__: 'image', image: { value: backgroundImageUrl.trim() } };
      }

      await updateConfig.mutateAsync({
        discordInviteLink: config.discordInviteLink,
        votePageUrls: config.votePageUrls,
        serverIp: config.serverIp,
        homeTagline: config.homeTagline,
        serverOnlineStatus: config.serverOnlineStatus,
        serverMemberCount: config.serverMemberCount,
        logo,
        backgroundSetting,
      });

      toast.success('Appearance settings saved successfully');
      setLogoUploadProgress(0);
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-pink-500/30 bg-black/40">
          <CardHeader>
            <CardTitle className="text-2xl text-pink-400">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard. Only administrators can manage website appearance and settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="heading-pixel text-4xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your website appearance and settings</p>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-pink-500/30">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo Settings */}
              <Card className="border-pink-500/30 bg-black/40 card-glow">
                <CardHeader>
                  <CardTitle className="text-xl text-pink-400">Header Logo</CardTitle>
                  <CardDescription>
                    Choose how your logo appears in the header
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={logoType} onValueChange={(v) => setLogoType(v as 'url' | 'blob')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="logo-url" />
                      <Label htmlFor="logo-url">Image URL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blob" id="logo-upload" />
                      <Label htmlFor="logo-upload">Upload Image</Label>
                    </div>
                  </RadioGroup>

                  {logoType === 'url' ? (
                    <div className="space-y-2">
                      <Label htmlFor="logo-url-input">Logo URL</Label>
                      <Input
                        id="logo-url-input"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="bg-black/60 border-pink-500/30"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="logo-file-input">Upload Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="bg-black/60 border-pink-500/30"
                        />
                      </div>
                      {logoUploadProgress > 0 && logoUploadProgress < 100 && (
                        <div className="text-sm text-pink-400">
                          Uploading: {logoUploadProgress}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Logo Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border border-pink-500/30 rounded-lg p-4 bg-black/60 flex items-center justify-center min-h-[120px]">
                      {logoPreview || logoUrl ? (
                        <img
                          src={logoPreview || logoUrl}
                          alt="Logo preview"
                          className="max-h-20 max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png';
                          }}
                        />
                      ) : (
                        <div className="text-gray-500 text-sm">No logo selected</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background Settings */}
              <Card className="border-pink-500/30 bg-black/40 card-glow">
                <CardHeader>
                  <CardTitle className="text-xl text-pink-400">Background</CardTitle>
                  <CardDescription>
                    Customize the site background
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={backgroundType} onValueChange={(v) => setBackgroundType(v as 'color' | 'image')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="color" id="bg-color" />
                      <Label htmlFor="bg-color">Solid Color</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="bg-image" />
                      <Label htmlFor="bg-image">Image URL</Label>
                    </div>
                  </RadioGroup>

                  {backgroundType === 'color' ? (
                    <div className="space-y-2">
                      <Label htmlFor="bg-color-input">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color-input"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-20 h-10 p-1 bg-black/60 border-pink-500/30"
                        />
                        <Input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#1a1a1a"
                          className="flex-1 bg-black/60 border-pink-500/30"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="bg-image-input">Background Image URL</Label>
                      <Input
                        id="bg-image-input"
                        type="url"
                        placeholder="https://example.com/background.jpg"
                        value={backgroundImageUrl}
                        onChange={(e) => setBackgroundImageUrl(e.target.value)}
                        className="bg-black/60 border-pink-500/30"
                      />
                    </div>
                  )}

                  {/* Background Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div
                      className="border border-pink-500/30 rounded-lg min-h-[120px]"
                      style={
                        backgroundType === 'color'
                          ? { backgroundColor }
                          : { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateConfig.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8"
              >
                {updateConfig.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="mt-6">
            <Card className="border-pink-500/30 bg-black/40">
              <CardHeader>
                <CardTitle className="text-2xl text-pink-400 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Deployment Troubleshooting
                </CardTitle>
                <CardDescription>
                  Common issues and solutions for deployment failures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="build-errors">
                    <AccordionTrigger className="text-pink-400 hover:text-pink-300">
                      1. Build and Type Errors
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 space-y-2">
                      <p>Check for TypeScript compilation errors or missing dependencies:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Review build logs for syntax errors or type mismatches</li>
                        <li>Ensure all imported modules are installed in package.json</li>
                        <li>Verify that all component props match their type definitions</li>
                        <li>Check for unused imports or variables that may cause warnings</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="asset-paths">
                    <AccordionTrigger className="text-pink-400 hover:text-pink-300">
                      2. Static Asset Path Issues
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 space-y-2">
                      <p>Verify that all asset references are correct:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Default logo path: <code className="bg-black/60 px-2 py-1 rounded text-pink-400">/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png</code></li>
                        <li>Ensure uploaded images are properly stored and accessible</li>
                        <li>Check that image URLs are valid and publicly accessible</li>
                        <li>Verify blob storage is functioning correctly for uploaded files</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="canister-upgrade">
                    <AccordionTrigger className="text-pink-400 hover:text-pink-300">
                      3. Canister Upgrade and Migration
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 space-y-2">
                      <p>State migration issues during canister upgrades:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Ensure migration.mo properly handles schema changes</li>
                        <li>Verify that new WebsiteConfig fields have default values</li>
                        <li>Check that stable variables are correctly preserved</li>
                        <li>Test upgrades on a local replica before production deployment</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="environment">
                    <AccordionTrigger className="text-pink-400 hover:text-pink-300">
                      4. Environment and Configuration
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 space-y-2">
                      <p>Check environment-specific settings:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Verify canister IDs are correct for the target network</li>
                        <li>Ensure Internet Identity integration is properly configured</li>
                        <li>Check that all environment variables are set correctly</li>
                        <li>Confirm network connectivity to the Internet Computer</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="logs">
                    <AccordionTrigger className="text-pink-400 hover:text-pink-300">
                      5. Collecting Logs and Reproducing Issues
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 space-y-2">
                      <p>Steps to diagnose deployment failures:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Check browser console for frontend errors</li>
                        <li>Review deployment logs from the build system</li>
                        <li>Test locally with <code className="bg-black/60 px-2 py-1 rounded text-pink-400">dfx start</code> and <code className="bg-black/60 px-2 py-1 rounded text-pink-400">dfx deploy</code></li>
                        <li>Verify canister status with <code className="bg-black/60 px-2 py-1 rounded text-pink-400">dfx canister status</code></li>
                        <li>Check for memory or cycle-related issues in canister logs</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong className="text-pink-400">Note:</strong> If deployment continues to fail after checking these items, 
                    the issue may be with the platform's deployment pipeline itself. Contact support with detailed error logs 
                    and reproduction steps for further assistance.
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
