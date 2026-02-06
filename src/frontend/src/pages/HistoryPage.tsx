import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetPurchaseHistory } from '../hooks/useQueries';
import { PurchaseStatus } from '../backend';

export default function HistoryPage() {
  const { data: purchases = [], isLoading } = useGetPurchaseHistory();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    if (status === PurchaseStatus.approved) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1 text-xs">
          <CheckCircle className="h-2.5 w-2.5" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 text-xs">
        <XCircle className="h-2.5 w-2.5" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-pink-400 mb-2">Purchase History</h1>
          <p className="text-gray-300 text-sm">View all your past orders and their status.</p>
        </div>

        {isLoading ? (
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-400 border-t-transparent" />
            </CardContent>
          </Card>
        ) : purchases.length === 0 ? (
          <Card className="bg-gray-900/50 border-pink-500/30">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-base">No purchase history yet</p>
              <p className="text-gray-500 text-xs mt-1">Your completed orders will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase, index) => (
              <Card key={index} className="bg-gray-900/50 border-pink-500/30 hover:border-pink-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <CardTitle className="text-pink-400 flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        Order #{purchases.length - index}
                      </CardTitle>
                      <p className="text-xs text-gray-400">{formatDate(purchase.timestamp)}</p>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    {purchase.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-pink-500/20"
                      >
                        <div className="flex items-center gap-2">
                          {item.shopItem.category === 'Rank' && (
                            <img src="/assets/generated/golden-crown.dim_64x64.png" alt="Rank" className="h-6 w-6" />
                          )}
                          {item.shopItem.category === 'CrateKey' && (
                            <img src="/assets/generated/golden-key.dim_64x64.png" alt="Key" className="h-6 w-6" />
                          )}
                          {item.shopItem.category === 'Perk' && (
                            <img src="/assets/generated/diamond-sword.dim_64x64.png" alt="Perk" className="h-6 w-6" />
                          )}
                          <div>
                            <p className="text-white font-medium text-sm">{item.shopItem.name}</p>
                            <p className="text-xs text-gray-400">Quantity: {Number(item.quantity)}</p>
                          </div>
                        </div>
                        <span className="text-pink-400 font-bold text-sm">
                          ₹{((Number(item.shopItem.price) * Number(item.quantity)) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-pink-500/20" />

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium text-sm">Total Amount:</span>
                    <span className="text-xl font-bold text-pink-400">₹{(Number(purchase.totalAmount) / 100).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
