import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGetAllShopItems, useAddShopItem, useEditShopItem, useDeleteShopItem, useIsCallerAdmin } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { ShopItem } from '../backend';

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
};

export default function ShopManagementPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const { data: items = [], isLoading: isLoadingItems } = useGetAllShopItems();
  const addItem = useAddShopItem();
  const editItem = useEditShopItem();
  const deleteItem = useDeleteShopItem();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ShopItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: 'Rank',
    available: true,
  });

  useEffect(() => {
    if (!isCheckingAdmin && isAdmin === false) {
      toast.error('Access denied: Admin only');
      navigate({ to: '/' });
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Rank',
      available: true,
    });
    setEditingItem(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEditModal = (item: ShopItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: (Number(item.price) / 100).toString(),
      category: item.category,
      available: item.available,
    });
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    resetForm();
  };

  const handleOpenDeleteDialog = (item: ShopItem) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingItem(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const priceInPaise = BigInt(Math.round(Number(formData.price) * 100));

    try {
      if (editingItem) {
        await editItem.mutateAsync({
          id: editingItem.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: priceInPaise,
          category: formData.category,
          available: formData.available,
        });
        toast.success('Item updated successfully');
      } else {
        await addItem.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: priceInPaise,
          category: formData.category,
          available: formData.available,
        });
        toast.success('Item created successfully');
      }
      handleCloseFormModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteItem.mutateAsync({ id: deletingItem.id });
      toast.success('Item deleted successfully');
      handleCloseDeleteDialog();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto">
        <Button
          onClick={() => navigate({ to: '/admin' })}
          variant="ghost"
          className="mb-6 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl heading-pixel mb-2">Shop Management</h1>
            <p className="text-gray-300 text-sm">Create, edit, and manage shop items</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <Plus className="h-4 w-4" />
            Create Item
          </Button>
        </div>

        {isLoadingItems ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading items...</div>
        ) : items.length === 0 ? (
          <Card className="card-glow">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 mb-4">No shop items yet</p>
              <Button onClick={handleOpenCreateModal} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
                <Plus className="h-4 w-4" />
                Create First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={Number(item.id)} className="card-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-pink-400 text-base">{item.name}</CardTitle>
                    <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-pink-500' : 'bg-gray-600'}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 text-xs line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-pink-500/30 text-pink-400 text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-lg font-bold text-pink-400">₹{(Number(item.price) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleOpenEditModal(item)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-pink-500/30 text-pink-400 hover:bg-pink-500/10 gap-2"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleOpenDeleteDialog(item)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showFormModal} onOpenChange={handleCloseFormModal}>
          <DialogContent className="bg-gray-900 border-pink-500/40 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-pink-400">{editingItem ? 'Edit Item' : 'Create New Item'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Name <span className="text-pink-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  className="bg-gray-800/50 border-pink-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description <span className="text-pink-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  className="bg-gray-800/50 border-pink-500/30 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">
                  Price (₹) <span className="text-pink-400">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-800/50 border-pink-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category <span className="text-pink-400">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-pink-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-pink-500/30 text-white">
                    <SelectItem value="Rank">Rank</SelectItem>
                    <SelectItem value="CrateKey">Crate Key</SelectItem>
                    <SelectItem value="Perk">Perk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="available" className="text-gray-300">
                  Available for purchase
                </Label>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseFormModal} variant="outline" className="border-pink-500/30 text-gray-300 hover:bg-pink-500/10">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={addItem.isPending || editItem.isPending}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {addItem.isPending || editItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingItem ? (
                  'Update Item'
                ) : (
                  'Create Item'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent className="bg-gray-900 border-pink-500/40 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-pink-400">Delete Item</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-pink-500/30 text-gray-300 hover:bg-pink-500/10">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteItem.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
