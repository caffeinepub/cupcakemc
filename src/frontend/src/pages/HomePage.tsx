import { memo } from 'react';
import { Server, Users, Loader2, ExternalLink } from 'lucide-react';
import { SiDiscord } from 'react-icons/si';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetWebsiteConfig } from '../hooks/useQueries';

const FeatureCard = memo(({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <Card className="card-glow">
    <CardContent className="p-6 text-center space-y-4">
      <div className="inline-block p-3 bg-pink-500/10 rounded-lg">
        <img src={icon} alt={title} className="h-16 w-16" loading="lazy" />
      </div>
      <h3 className="text-lg font-bold text-pink-400">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

export default function HomePage() {
  const { data: config, isLoading } = useGetWebsiteConfig();

  const votingSites = config?.votePageUrls && config.votePageUrls.length > 0
    ? config.votePageUrls.map((url, index) => {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        return {
          name: domain.charAt(0).toUpperCase() + domain.slice(1),
          url,
        };
      })
    : [
        { name: 'Minecraft-mp.com', url: 'https://minecraft-mp.com' },
        { name: 'TopG.org', url: 'https://topg.org' },
      ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/hero-bg-blur.dim_1920x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl lg:text-6xl heading-pixel leading-relaxed">
              CupCakeMC
            </h1>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
              </div>
            ) : (
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                {config?.homeTagline || 'Welcome to CupCakeMC - The Pinkest Minecraft Server!'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Server Status Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Server className="h-6 w-6 text-pink-400" />
                <h2 className="text-2xl font-bold text-white">Server Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${config?.serverOnlineStatus ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      <span className={`font-medium ${config?.serverOnlineStatus ? 'text-green-400' : 'text-red-400'}`}>
                        {config?.serverOnlineStatus ? 'Online' : 'Offline'}
                      </span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Players:
                  </span>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                  ) : (
                    <span className="text-white font-medium">{config?.serverMemberCount?.toString() || '0'}</span>
                  )}
                </div>
                
                <div className="pt-4 border-t border-pink-500/20">
                  <span className="text-gray-400 text-sm">Server IP:</span>
                  <div className="mt-2 p-3 bg-gray-800/50 rounded-lg border border-pink-500/20">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                      </div>
                    ) : (
                      <code className="text-pink-400 font-mono">{config?.serverIp || 'cupcakemc.net'}</code>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vote Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="text-center space-y-4 mb-6">
                <div className="inline-block p-3 bg-pink-500/10 rounded-lg">
                  <img src="/assets/generated/minecraft-block.dim_64x64.png" alt="Vote" className="h-16 w-16" loading="lazy" />
                </div>
                <h2 className="text-2xl heading-pixel">Vote for the Server</h2>
                <p className="text-gray-300">
                  Support CupCakeMC by voting on popular Minecraft server listing sites!
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {votingSites.map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-pink-500/20 rounded-lg hover:border-pink-500/50 hover:bg-pink-500/5 transition-all cursor-pointer">
                        <span className="text-gray-300 font-medium">{site.name}</span>
                        <ExternalLink className="h-5 w-5 text-pink-400" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Discord Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="inline-block p-4 bg-pink-500/10 rounded-lg">
                  <SiDiscord className="h-16 w-16 text-pink-400" />
                </div>
                
                <h2 className="text-2xl heading-pixel">Join Our Discord</h2>
                
                <p className="text-gray-300">
                  Connect with our community, get support, and stay updated with server news!
                </p>

                <div className="pt-4">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
                    </div>
                  ) : (
                    <a
                      href={config?.discordInviteLink || 'https://discord.gg/YRRE9ugFAw'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white gap-3 px-8 py-6">
                        <SiDiscord className="h-5 w-5" />
                        Join CupCakeMC Discord
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose CupCakeMC Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl heading-pixel text-center mb-12">Why Choose CupCakeMC?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
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
