import { useState, useMemo, memo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  useGetAllShopItems,
  useGetCart,
  useAddToCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useClearCart,
  useCompletePurchaseWithUPI,
  useGetUPIConfig,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { ShopItem, CartItem } from '../backend';
import CheckoutModal from '../components/CheckoutModal';

type Category = 'All Items' | 'Ranks' | 'Crate Keys' | 'Perks';

const ShopItemCard = memo(
  ({
    item,
    onViewDetails,
    onAddToCart,
    isAdding,
  }: {
    item: ShopItem;
    onViewDetails: (item: ShopItem) => void;
    onAddToCart: (item: ShopItem) => void;
    isAdding: boolean;
  }) => (
    <Card className="card-glow cursor-pointer hover:border-pink-500/50 transition-colors">
      <div onClick={() => onViewDetails(item)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {item.category === 'Rank' && (
                <img src="/assets/generated/golden-crown.dim_64x64.png" alt="Rank" className="h-10 w-10" loading="lazy" />
              )}
              {item.category === 'CrateKey' && (
                <img src="/assets/generated/golden-key.dim_64x64.png" alt="Key" className="h-10 w-10" loading="lazy" />
              )}
              {item.category === 'Perk' && (
                <img src="/assets/generated/diamond-sword.dim_64x64.png" alt="Perk" className="h-10 w-10" loading="lazy" />
              )}
              <CardTitle className="text-pink-400 text-base">{item.name}</CardTitle>
            </div>
            <Badge
              variant={item.available ? 'default' : 'secondary'}
              className={`${item.available ? 'bg-pink-500' : 'bg-gray-600'} text-xs`}
            >
              {item.available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-300 text-xs line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-pink-400">₹{(Number(item.price) / 100).toFixed(2)}</span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              disabled={!item.available || isAdding}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600 text-white gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
);

ShopItemCard.displayName = 'ShopItemCard';

export default function ShopPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Items');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: allItems = [], isLoading } = useGetAllShopItems();
  const { data: cart = [] } = useGetCart();
  const { data: upiConfig } = useGetUPIConfig();
  const addToCart = useAddToCart();
  const updateCartQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const completePurchase = useCompletePurchaseWithUPI();

  const categories: Category[] = ['All Items', 'Ranks', 'Crate Keys', 'Perks'];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedCategory === 'All Items') return true;
      return item.category === selectedCategory.replace(' ', '');
    });
  }, [allItems, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.shopItem.price) * Number(item.quantity);
    }, 0) / 100;
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  }, [cart]);

  const handleViewDetails = (item: ShopItem) => {
    navigate({ to: `/shop/${item.id.toString()}` });
  };

  const handleAddToCart = async (item: ShopItem) => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart.mutateAsync({ itemId: item.id, quantity: 1n });
      toast.success(`${item.name} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartQuantity.mutateAsync({ itemId: item.shopItem.id, quantity: BigInt(newQuantity) });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveFromCart = async (item: CartItem) => {
    try {
      await removeFromCart.mutateAsync({ itemId: item.shopItem.id });
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!upiConfig) {
      toast.error('Payment configuration not available');
      return;
    }

    setShowCheckoutModal(true);
  };

  const handlePaymentComplete = async (minecraftUsername: string, discordUsername: string) => {
    try {
      await completePurchase.mutateAsync({ minecraftUsername, discordUsername });
      setShowCheckoutModal(false);
      toast.success('Payment confirmed! Thank you for your purchase');
    } catch (error: any) {
      toast.error('Payment confirmation failed, please try again.');
      throw error;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl heading-pixel mb-4">Shop</h1>
          <p className="text-gray-300 text-sm">
            Browse our collection of ranks, crate keys, and perks to enhance your gameplay.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className={
                selectedCategory === category
                  ? 'bg-pink-500 hover:bg-pink-600 text-white'
                  : 'border-pink-500/30 text-gray-300 hover:bg-pink-500/10 hover:text-pink-400'
              }
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No items found in this category</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <ShopItemCard
                    key={Number(item.id)}
                    item={item}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                    isAdding={addToCart.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="card-glow sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-pink-400 text-base">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Shopping Cart
                  </div>
                  {cartItemCount > 0 && (
                    <Badge className="bg-pink-500 text-white">{cartItemCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">Your cart is empty</div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={index} className="p-2 bg-gray-800/50 rounded-lg border border-pink-500/20">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-white font-medium text-xs">{item.shopItem.name}</span>
                            <Button
                              onClick={() => handleRemoveFromCart(item)}
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleUpdateQuantity(item, Number(item.quantity) - 1)}
                                disabled={Number(item.quantity) <= 1 || updateCartQuantity.isPending}
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-white text-sm w-8 text-center">{Number(item.quantity)}</span>
                              <Button
                                onClick={() => handleUpdateQuantity(item, Number(item.quantity) + 1)}
                                disabled={updateCartQuantity.isPending}
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-pink-400 font-bold text-sm">
                              ₹{((Number(item.shopItem.price) * Number(item.quantity)) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-pink-500/20" />

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total:</span>
                        <span className="text-xl font-bold text-pink-400">₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleCheckout}
                        disabled={completePurchase.isPending}
                        size="sm"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white gap-2"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Checkout with UPI
                      </Button>
                      <Button
                        onClick={handleClearCart}
                        disabled={clearCart.isPending}
                        variant="outline"
                        size="sm"
                        className="w-full border-pink-500/30 text-gray-300 hover:bg-pink-500/10 gap-2"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear Cart
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showCheckoutModal && upiConfig && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          cart={cart}
          totalAmount={cartTotal}
          upiId={upiConfig.upiId}
          merchantName={upiConfig.merchantName}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
