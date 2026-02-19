import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetAllShopItems, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams({ strict: false });
  const [quantity, setQuantity] = useState(1);
  const { identity } = useInternetIdentity();
  const { data: allItems = [], isLoading } = useGetAllShopItems();
  const addToCart = useAddToCart();

  const item = allItems.find((i) => i.id.toString() === itemId);

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!item) {
      toast.error('Item not found');
      return;
    }

    try {
      await addToCart.mutateAsync({ itemId: item.id, quantity: BigInt(quantity) });
      toast.success(`${quantity}x ${item.name} added to cart!`);
      navigate({ to: '/shop' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="container mx-auto">
          <div className="text-center py-8 text-gray-400 text-sm">Loading item details...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="container mx-auto">
          <Button
            onClick={() => navigate({ to: '/shop' })}
            variant="ghost"
            className="mb-6 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
          <div className="text-center py-8 text-gray-400 text-sm">Item not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => navigate({ to: '/shop' })}
          variant="ghost"
          className="mb-6 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <Card className="card-glow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {item.category === 'Rank' && (
                  <img
                    src="/assets/generated/golden-crown.dim_64x64.png"
                    alt="Rank"
                    className="h-16 w-16"
                    loading="lazy"
                  />
                )}
                {item.category === 'CrateKey' && (
                  <img
                    src="/assets/generated/golden-key.dim_64x64.png"
                    alt="Key"
                    className="h-16 w-16"
                    loading="lazy"
                  />
                )}
                {item.category === 'Perk' && (
                  <img
                    src="/assets/generated/diamond-sword.dim_64x64.png"
                    alt="Perk"
                    className="h-16 w-16"
                    loading="lazy"
                  />
                )}
                <div>
                  <CardTitle className="text-pink-400 text-2xl mb-2">{item.name}</CardTitle>
                  <Badge
                    variant={item.available ? 'default' : 'secondary'}
                    className={`${item.available ? 'bg-pink-500' : 'bg-gray-600'}`}
                  >
                    {item.available ? 'Available' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{item.description}</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Category</h3>
              <Badge variant="outline" className="border-pink-500/30 text-pink-400">
                {item.category}
              </Badge>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-pink-500/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Price</span>
                <span className="text-3xl font-bold text-pink-400">
                  ₹{(Number(item.price) / 100).toFixed(2)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || !item.available}
                      variant="outline"
                      size="icon"
                      className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-semibold text-xl w-12 text-center">{quantity}</span>
                    <Button
                      onClick={incrementQuantity}
                      disabled={!item.available}
                      variant="outline"
                      size="icon"
                      className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-pink-500/20">
                  <span className="text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-pink-400">
                    ₹{((Number(item.price) * quantity) / 100).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!item.available || addToCart.isPending}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white gap-2 py-6 text-lg"
                >
                  {addToCart.isPending ? (
                    <>Adding to Cart...</>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                {!item.available && (
                  <p className="text-center text-sm text-gray-400">This item is currently unavailable</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
