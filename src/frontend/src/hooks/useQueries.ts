import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ShopItem, CartItem, UPIConfig, WebsiteConfig, PurchaseRecord, OrderDetails } from '../backend';
import type { Principal } from '@dfinity/principal';

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !identity.getPrincipal().isAnonymous(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useGetAllShopItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShopItem[]>({
    queryKey: ['shopItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShopItems();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAddShopItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { name: string; description: string; price: bigint; category: string; available: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addShopItem(item.name, item.description, item.price, item.category, item.available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
    },
  });
}

export function useEditShopItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { id: bigint; name: string; description: string; price: bigint; category: string; available: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editShopItem(item.id, item.name, item.description, item.price, item.category, item.available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
    },
  });
}

export function useDeleteShopItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShopItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
    },
  });
}

export function useGetUPIConfig() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UPIConfig>({
    queryKey: ['upiConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUPIConfig();
    },
    enabled: !!actor && !actorFetching && !!identity && !identity.getPrincipal().isAnonymous(),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: 500,
  });
}

export function useUpdateUPIConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { upiId: string; merchantName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUPIConfig(config.upiId, config.merchantName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiConfig'] });
    },
  });
}

export function useGetWebsiteConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WebsiteConfig>({
    queryKey: ['websiteConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWebsiteConfig();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}

export function useUpdateWebsiteConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { 
      discordInviteLink: string; 
      votePageUrls: string[]; 
      serverIp: string; 
      homeTagline: string;
      serverOnlineStatus: boolean;
      serverMemberCount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWebsiteConfig(
        config.discordInviteLink, 
        config.votePageUrls, 
        config.serverIp, 
        config.homeTagline,
        config.serverOnlineStatus,
        config.serverMemberCount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websiteConfig'] });
    },
  });
}

export function useGetCart() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CartItem[]>({
    queryKey: ['cart', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCart();
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !identity.getPrincipal().isAnonymous(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useCompletePurchaseWithUPI() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ minecraftUsername, discordUsername }: { minecraftUsername: string; discordUsername: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completePurchaseWithUPI(minecraftUsername, discordUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseHistory'] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useGetPurchaseHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PurchaseRecord[]>({
    queryKey: ['purchaseHistory', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPurchaseHistory();
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !identity.getPrincipal().isAnonymous(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<OrderDetails[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllOrders();
      } catch (error) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity && !identity.getPrincipal().isAnonymous(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useApproveOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, orderId }: { user: Principal; orderId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveOrder(user, orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseHistory'] });
    },
  });
}
