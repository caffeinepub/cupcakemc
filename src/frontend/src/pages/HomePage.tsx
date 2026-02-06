import { memo } from 'react';
import { Server, Users, Loader2 } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetWebsiteConfig } from '../hooks/useQueries';

// Memoized feature card component
const FeatureCard = memo(({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <Card className="bg-gray-900/50 border-pink-500/30 hover:border-pink-500/50 transition-colors">
    <CardContent className="p-5 text-center space-y-3">
      <div className="inline-block p-3 bg-pink-500/10 rounded-full">
        <img src={icon} alt={title} className="h-12 w-12" loading="lazy" />
      </div>
      <h3 className="text-xl font-bold text-pink-400">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

export default function HomePage() {
  const { data: config, isLoading } = useGetWebsiteConfig();

  return (
    <div className="min-h-screen">
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">Welcome to </span>
              <span className="text-pink-400">CupCakeMC</span>
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
              </div>
            ) : (
              <p className="text-base text-gray-300 max-w-2xl mx-auto">
                {config?.homeTagline || 'Join the sweetest Minecraft server community! Experience unique gameplay, exclusive ranks, and amazing rewards.'}
              </p>
            )}
            <div className="flex flex-wrap gap-3 justify-center pt-3">
              <Link to="/shop">
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white px-6">
                  Visit Shop
                </Button>
              </Link>
              <Link to="/discord">
                <Button size="sm" variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 px-6">
                  Join Discord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-pink-400" />
                <h2 className="text-xl font-bold text-white">Server Status</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status:</span>
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${config?.serverOnlineStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      <span className={`font-medium text-sm ${config?.serverOnlineStatus ? 'text-green-400' : 'text-red-400'}`}>
                        {config?.serverOnlineStatus ? 'Online' : 'Offline'}
                      </span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2 text-sm">
                    <Users className="h-3.5 w-3.5" />
                    Players:
                  </span>
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
                  ) : (
                    <span className="text-white font-medium text-sm">{config?.serverMemberCount?.toString() || '0'}</span>
                  )}
                </div>
                
                <div className="pt-3 border-t border-pink-500/20">
                  <span className="text-gray-400 text-xs">Server IP:</span>
                  <div className="mt-1.5 p-2 bg-gray-800/50 rounded-lg border border-pink-500/20">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
                      </div>
                    ) : (
                      <code className="text-pink-400 font-mono text-sm">{config?.serverIp || 'cupcakemc.net'}</code>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-5">
              <div className="text-center space-y-3">
                <div className="inline-block p-3 bg-pink-500/10 rounded-full">
                  <img src="/assets/generated/minecraft-block.dim_64x64.png" alt="Vote" className="h-12 w-12" loading="lazy" />
                </div>
                <h2 className="text-2xl font-bold text-pink-400">Vote for the Server</h2>
                <p className="text-gray-300 text-sm">
                  Support CupCakeMC by voting on popular Minecraft server listing sites!
                </p>
                <Link to="/vote">
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white mt-3">
                    Vote Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="p-5">
              <div className="text-center space-y-3">
                <div className="inline-block p-3 bg-pink-500/10 rounded-full">
                  <SiDiscord className="h-12 w-12 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-pink-400">Join Our Discord</h2>
                <p className="text-gray-300 text-sm">
                  Connect with our community, get support, and stay updated with server news!
                </p>
                {isLoading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
                  </div>
                ) : (
                  <a
                    href={config?.discordInviteLink || 'https://discord.gg/cupcakemc'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white mt-3 gap-2">
                      <SiDiscord className="h-4 w-4" />
                      Join CupCakeMC Discord
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-white">Why Choose </span>
            <span className="text-pink-400">CupCakeMC?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon="/assets/generated/golden-crown.dim_64x64.png"
              title="Exclusive Ranks"
              description="Unlock special permissions, commands, and cosmetics with our premium ranks."
            />
            <FeatureCard
              icon="/assets/generated/golden-key.dim_64x64.png"
              title="Crate Keys"
              description="Open mystery crates to receive rare items, resources, and exclusive rewards."
            />
            <FeatureCard
              icon="/assets/generated/diamond-sword.dim_64x64.png"
              title="Special Perks"
              description="Get temporary abilities like flight, speed boosts, and more to enhance gameplay."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
