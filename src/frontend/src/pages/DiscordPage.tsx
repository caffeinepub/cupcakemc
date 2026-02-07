import { SiDiscord } from 'react-icons/si';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetWebsiteConfig } from '../hooks/useQueries';

export default function DiscordPage() {
  const { data: config, isLoading } = useGetWebsiteConfig();

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="card-glow">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-pink-500/10 rounded-lg">
                <SiDiscord className="h-20 w-20 text-pink-400" />
              </div>
              
              <h1 className="text-3xl md:text-4xl heading-pixel">Join Our Discord</h1>
              
              <p className="text-gray-300 text-lg">
                Connect with our community, get support, and stay updated with server news!
              </p>

              <div className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                  </div>
                ) : (
                  <a
                    href={config?.discordInviteLink || 'https://discord.gg/YRRE9ugFAw'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white gap-3 px-8 py-6 text-lg">
                      <SiDiscord className="h-6 w-6" />
                      Join CupCakeMC Discord
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
