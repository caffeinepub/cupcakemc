import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

// persistent imports must not be used
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var upiConfig : UPIConfig = {
    upiId = "cupcakemc@upi";
    merchantName = "CupCakeMC STORE";
  };

  var websiteConfig : WebsiteConfig = {
    discordInviteLink = "https://discord.gg/YRRE9ugFAw";
    votePageUrls = [
      "https://minecraftservers.org/vote/cupcakemc",
      "https://topg.org/vote/cupcakemc"
    ];
    serverIp = "cupcakemc.net";
    homeTagline = "Welcome to CupCakeMC - The Pinkest Minecraft Server!";
    serverOnlineStatus = true;
    serverMemberCount = 0;
    logo = #url("");
    backgroundSetting = #color({ value = "#FFFFFF" });
  };

  // Persistent actor state wrapped in "Self" type.
  type Self = {
    upiConfig : UPIConfig;
    websiteConfig : WebsiteConfig;
    nextItemId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    shopItems : Map.Map<Nat, ShopItem>;
    userCarts : Map.Map<Principal, List.List<CartItem>>;
    userPurchases : Map.Map<Principal, List.List<PurchaseRecord>>;
  };

  var nextItemId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let shopItems = Map.empty<Nat, ShopItem>();
  let userCarts = Map.empty<Principal, List.List<CartItem>>();
  let userPurchases = Map.empty<Principal, List.List<PurchaseRecord>>();

  public type UserProfile = {
    name : Text;
    minecraftUsername : Text;
  };

  public type UPIConfig = {
    upiId : Text;
    merchantName : Text;
  };

  public type ShopItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    available : Bool;
  };

  public type CartItem = {
    shopItem : ShopItem;
    quantity : Nat;
  };

  public type PurchaseStatus = { #approved; #unapproved };

  public type PurchaseRecord = {
    items : [CartItem];
    totalAmount : Nat;
    timestamp : Int;
    status : PurchaseStatus;
    minecraftUsername : Text;
    discordUsername : Text;
  };

  public type Logo = {
    #url : Text;
    #blob : Storage.ExternalBlob;
  };

  public type BackgroundSetting = {
    #color : { value : Text };
    #image : { value : Text };
  };

  public type WebsiteConfig = {
    discordInviteLink : Text;
    votePageUrls : [Text];
    serverIp : Text;
    homeTagline : Text;
    serverOnlineStatus : Bool;
    serverMemberCount : Nat;
    logo : Logo;
    backgroundSetting : BackgroundSetting;
  };

  public type OrderDetails = {
    purchaser : Principal;
    items : [CartItem];
    totalAmount : Nat;
    timestamp : Int;
    status : PurchaseStatus;
    minecraftUsername : Text;
    discordUsername : Text;
    identityName : Text;
  };

  // Required profile functions per instructions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy registration function - kept for backward compatibility
  public shared ({ caller }) func registerWithMinecraftUsername(name : Text, minecraftUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    let existingProfile = userProfiles.get(caller);
    let newProfile : UserProfile = switch (existingProfile) {
      case (null) {
        {
          name;
          minecraftUsername;
        };
      };
      case (?profile) {
        {
          name;
          minecraftUsername = profile.minecraftUsername;
        };
      };
    };

    userProfiles.add(caller, newProfile);
  };

  // Admin-only function to update any user's Minecraft username
  public shared ({ caller }) func updateUserMinecraftUsername(user : Principal, newMinecraftUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let existingProfile = switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      name = existingProfile.name;
      minecraftUsername = newMinecraftUsername;
    };

    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func addShopItem(name : Text, description : Text, price : Nat, category : Text, available : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let id = nextItemId;
    nextItemId += 1;

    let item : ShopItem = {
      id;
      name;
      description;
      price;
      category;
      available;
    };

    shopItems.add(id, item);
    id;
  };

  public shared ({ caller }) func editShopItem(id : Nat, name : Text, description : Text, price : Nat, category : Text, available : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (shopItems.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?_item) { () };
    };

    let updatedItem : ShopItem = {
      id;
      name;
      description;
      price;
      category;
      available;
    };

    shopItems.add(id, updatedItem);
  };

  public shared ({ caller }) func deleteShopItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (shopItems.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?_item) { () };
    };

    shopItems.remove(id);
  };

  public query func getAllShopItems() : async [ShopItem] {
    let iter = shopItems.values();
    iter.toArray();
  };

  public query func getShopItemsByCategory(category : Text) : async [ShopItem] {
    let allItems = shopItems.values().toArray();
    allItems.filter(func(item) { item.category == category });
  };

  public shared ({ caller }) func addToCart(itemId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    let shopItem = switch (shopItems.get(itemId)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?item) { item };
    };

    let cartItem : CartItem = {
      shopItem;
      quantity;
    };

    let currentCart = switch (userCarts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };

    currentCart.add(cartItem);
    userCarts.add(caller, currentCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    userCarts.remove(caller);
  };

  public shared ({ caller }) func completePurchaseWithUPI(minecraftUsername : Text, discordUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete purchases");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) {
        Runtime.trap("Cart is empty");
      };
      case (?cart) { cart };
    };

    let cartArray = cart.toArray();
    if (cartArray.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let totalAmount = cartArray.foldLeft(
      0,
      func(acc, item) { acc + (item.shopItem.price * item.quantity) },
    );

    let purchase : PurchaseRecord = {
      items = cartArray;
      totalAmount;
      timestamp = Time.now();
      status = #unapproved;
      minecraftUsername;
      discordUsername;
    };

    let currentPurchases = switch (userPurchases.get(caller)) {
      case (null) { List.empty<PurchaseRecord>() };
      case (?purchases) { purchases };
    };

    currentPurchases.add(purchase);
    userPurchases.add(caller, currentPurchases);

    userCarts.remove(caller);
  };

  public query ({ caller }) func getPurchaseHistory() : async [PurchaseRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchase history");
    };

    switch (userPurchases.get(caller)) {
      case (null) { [] };
      case (?purchases) { purchases.toArray() };
    };
  };

  public query ({ caller }) func getAllOrders() : async [OrderDetails] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    // Build array of OrderDetails (including purchaser profile)
    let ordersList = List.empty<OrderDetails>();

    for ((purchaser, purchases) in userPurchases.entries()) {
      let profileOpt = userProfiles.get(purchaser);
      let identityName = switch (profileOpt) {
        case (?profile) { profile.name };
        case (null) { "" }; // Fallback if profile is missing
      };

      for (purchase in purchases.values()) {
        let order : OrderDetails = {
          purchaser;
          items = purchase.items;
          totalAmount = purchase.totalAmount;
          timestamp = purchase.timestamp;
          status = purchase.status;
          minecraftUsername = purchase.minecraftUsername;
          discordUsername = purchase.discordUsername;
          identityName;
        };
        ordersList.add(order);
      };
    };

    ordersList.toArray();
  };

  public shared ({ caller }) func approveOrder(user : Principal, orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let userOrders = switch (userPurchases.get(user)) {
      case (null) {
        Runtime.trap("User has no orders");
      };
      case (?orders) { orders };
    };

    let ordersArray = userOrders.toArray();

    if (orderId >= ordersArray.size()) {
      Runtime.trap("Order ID out of range");
    };

    let updatedOrders = Array.tabulate(
      ordersArray.size(),
      func(idx) {
        if (idx == orderId) {
          let order = ordersArray[idx];
          {
            items = order.items;
            totalAmount = order.totalAmount;
            timestamp = order.timestamp;
            status = #approved;
            minecraftUsername = order.minecraftUsername;
            discordUsername = order.discordUsername;
          };
        } else {
          ordersArray[idx];
        };
      }
    );

    let updatedOrdersList = List.fromArray<PurchaseRecord>(updatedOrders);
    userPurchases.add(user, updatedOrdersList);
  };

  public shared ({ caller }) func updateUPIConfig(upiId : Text, merchantName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let trimmedMerchantName = merchantName.trim(#char ' ');
    if (trimmedMerchantName.size() == 0) {
      Runtime.trap("Merchant name cannot be empty");
    };

    let trimmedUpiId = upiId.trim(#char ' ');
    if (trimmedUpiId.size() == 0) {
      Runtime.trap("UPI ID cannot be empty");
    };

    upiConfig := {
      upiId = trimmedUpiId;
      merchantName = trimmedMerchantName;
    };
  };

  public query func getUPIConfig() : async UPIConfig {
    upiConfig;
  };

  public shared ({ caller }) func updateWebsiteConfig(
    discordInviteLink : Text,
    votePageUrls : [Text],
    serverIp : Text,
    homeTagline : Text,
    serverOnlineStatus : Bool,
    serverMemberCount : Nat,
    logo : Logo,
    backgroundSetting : BackgroundSetting,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let trimmedDiscordInviteLink = discordInviteLink.trim(#char ' ');
    if (trimmedDiscordInviteLink.size() == 0) {
      Runtime.trap("Discord invite link cannot be empty");
    };

    let trimmedServerIp = serverIp.trim(#char ' ');
    if (trimmedServerIp.size() == 0) {
      Runtime.trap("Server IP cannot be empty");
    };

    let trimmedHomeTagline = homeTagline.trim(#char ' ');
    if (trimmedHomeTagline.size() == 0) {
      Runtime.trap("Home tagline cannot be empty");
    };

    let newConfig = {
      discordInviteLink = trimmedDiscordInviteLink;
      votePageUrls;
      serverIp = trimmedServerIp;
      homeTagline = trimmedHomeTagline;
      serverOnlineStatus;
      serverMemberCount;
      logo;
      backgroundSetting;
    };
    websiteConfig := newConfig;
  };

  public query func getWebsiteConfig() : async WebsiteConfig {
    websiteConfig;
  };
};
