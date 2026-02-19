import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, X, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CartItem } from '../backend';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
  upiId: string;
  merchantName: string;
  onPaymentComplete: (minecraftUsername: string, discordUsername: string) => Promise<void>;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  upiId,
  merchantName,
  onPaymentComplete,
}: CheckoutModalProps) {
  const [step, setStep] = useState<'account' | 'payment'>('account');
  const [discordUsername, setDiscordUsername] = useState('');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (step === 'payment' && upiId && totalAmount > 0) {
      generateQRCode();
    }
  }, [step, upiId, totalAmount]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const encodedMerchantName = encodeURIComponent(merchantName);
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedMerchantName}&am=${totalAmount.toFixed(2)}&cu=INR`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`;
      
      const img = new Image();
      img.onload = () => {
        setQrCodeUrl(qrApiUrl);
        setIsGenerating(false);
      };
      img.onerror = () => {
        throw new Error('Failed to load QR code image');
      };
      img.src = qrApiUrl;
    } catch (err) {
      console.error('QR Code generation error:', err);
      setError('Failed to generate QR code. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!discordUsername.trim() || !minecraftUsername.trim()) {
      setError('Please fill in both Discord and Minecraft usernames');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleConfirmPayment = async () => {
    setIsCompleting(true);
    try {
      await onPaymentComplete(minecraftUsername.trim(), discordUsername.trim());
    } catch (error) {
      console.error('Payment completion error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRetry = () => {
    generateQRCode();
  };

  const handleBack = () => {
    setStep('account');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-900 to-pink-900/20 border-2 border-pink-500/40 text-white max-w-xl p-0 overflow-hidden">
        <div className="relative bg-gradient-to-r from-pink-500 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Confirm Purchase</h2>
                <p className="text-pink-100 text-xs">CupCakeMC STORE</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {step === 'account' ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>WHAT'S INCLUDED</span>
                </div>
                <div className="space-y-1.5">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-pink-500/20"
                    >
                      <CheckCircle2 className="h-4 w-4 text-pink-400 shrink-0" />
                      <span className="text-white font-medium text-sm">{item.shopItem.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-pink-500/20" />

              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base">Account Information</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="discord" className="text-gray-300 text-sm">
                    Discord Username <span className="text-pink-400">*</span>
                  </Label>
                  <Input
                    id="discord"
                    type="text"
                    placeholder="Enter your Discord username"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    className="bg-gray-800/50 border-pink-500/30 text-white placeholder:text-gray-500 focus:border-pink-500 h-9"
                  />
                  <p className="text-xs text-gray-400">• To get the receipt, add the right username</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minecraft" className="text-gray-300 text-sm">
                    Minecraft Username <span className="text-pink-400">*</span>
                  </Label>
                  <Input
                    id="minecraft"
                    type="text"
                    placeholder="Enter your Minecraft username"
                    value={minecraftUsername}
                    onChange={(e) => setMinecraftUsername(e.target.value)}
                    className="bg-gray-800/50 border-pink-500/30 text-white placeholder:text-gray-500 focus:border-pink-500 h-9"
                  />
                  <p className="text-xs text-gray-400">• Rank will be provided to the username entered here</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
              </div>

              <Separator className="bg-pink-500/20" />

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-pink-500/20">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Product</span>
                    <span className="text-white font-medium">
                      {cart.length === 1 ? cart[0].shopItem.name : `${cart.length} items`}
                    </span>
                  </div>
                  <Separator className="bg-pink-500/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-sm">Total</span>
                    <span className="text-xl font-bold text-pink-400">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-5 text-base shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 transition-all duration-300"
              >
                <Zap className="h-4 w-4 mr-2" />
                Pay with UPI
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 border border-pink-500/20">
                  <div className="text-center space-y-1">
                    <p className="text-gray-400 text-xs">Pay to</p>
                    <p className="text-white font-semibold text-base">{merchantName}</p>
                    <p className="text-pink-400 text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-center items-center min-h-[280px] bg-white rounded-lg p-3">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
                      <p className="text-gray-600 text-xs">Generating QR code...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center gap-2 text-center p-3">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                      <p className="text-gray-700 text-xs">{error}</p>
                      <Button
                        onClick={handleRetry}
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                        size="sm"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-[260px] h-[260px]" crossOrigin="anonymous" />
                  )}
                </div>

                {!isGenerating && !error && (
                  <div className="space-y-2">
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-pink-500/20">
                      <h4 className="text-pink-400 font-semibold mb-1.5 text-xs">How to pay:</h4>
                      <ol className="text-gray-300 text-xs space-y-0.5 list-decimal list-inside">
                        <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                        <li>Scan the QR code above</li>
                        <li>Verify the amount and merchant name</li>
                        <li>Complete the payment</li>
                        <li>Click "I've Completed Payment" below</li>
                      </ol>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleBack}
                        disabled={isCompleting}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-pink-500/30 text-gray-300 hover:bg-pink-500/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleConfirmPayment}
                        disabled={isCompleting}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white gap-2 shadow-lg shadow-pink-500/50"
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            I've Completed Payment
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                      Note: After payment, it may take a few moments for your purchase to be processed.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
