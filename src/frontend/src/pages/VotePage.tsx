import { ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetWebsiteConfig } from '../hooks/useQueries';

export default function VotePage() {
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
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="card-glow">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="inline-block p-4 bg-pink-500/10 rounded-lg">
                <img src="/assets/generated/minecraft-block.dim_64x64.png" alt="Vote" className="h-20 w-20" />
              </div>
              
              <h1 className="text-3xl md:text-4xl heading-pixel">Vote for the Server</h1>
              
              <p className="text-gray-300 text-lg">
                Support CupCakeMC by voting on popular Minecraft server listing sites!
              </p>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
                </div>
              ) : (
                <div className="space-y-4 pt-6">
                  {votingSites.map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 border border-pink-500/20 rounded-lg hover:border-pink-500/50 hover:bg-pink-500/5 transition-all cursor-pointer">
                        <span className="text-lg font-medium text-gray-300">{site.name}</span>
                        <ExternalLink className="h-5 w-5 text-pink-400" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
