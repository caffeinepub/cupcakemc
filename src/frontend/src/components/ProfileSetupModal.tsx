import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedMinecraftUsername = minecraftUsername.trim();

    if (!trimmedName) {
      toast.error('Please enter your name');
      return;
    }

    if (!trimmedMinecraftUsername) {
      toast.error('Please enter your Minecraft username');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: trimmedName,
        minecraftUsername: trimmedMinecraftUsername,
      });
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error('Failed to create profile', {
        description: error.message || 'Please try again',
      });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-pink-400">Welcome to CupCakeMC!</DialogTitle>
          <DialogDescription className="text-gray-400">
            Let's set up your profile. This information will be used for your purchases and in-game rewards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-900 border-pink-500/30 text-white placeholder:text-gray-500"
              disabled={saveProfile.isPending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minecraft" className="text-gray-300">Minecraft Username</Label>
            <Input
              id="minecraft"
              type="text"
              placeholder="Enter your Minecraft username"
              value={minecraftUsername}
              onChange={(e) => setMinecraftUsername(e.target.value)}
              className="bg-gray-900 border-pink-500/30 text-white placeholder:text-gray-500"
              disabled={saveProfile.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
