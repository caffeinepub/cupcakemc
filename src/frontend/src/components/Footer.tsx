import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-pink-500/20 bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>© 2025. Built with</span>
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
          <div className="text-sm text-gray-400">
            Secure UPI payments
          </div>
        </div>
      </div>
    </footer>
  );
}
