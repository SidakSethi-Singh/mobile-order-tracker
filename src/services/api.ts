import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import localOrders from '../data/orders.json';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface TimelineEvent {
  status: string;
  time: string;
  description: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  amount: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  placed_at: string;
  timeline: TimelineEvent[];
}

const ORDERS_CACHE_KEY = 'orders_cache';
const DEV_OFFLINE_KEY = 'dev_offline_mode';
const DEV_ERROR_KEY = 'dev_error_mode';
const MOCK_API_URL_KEY = 'mock_api_url';

// Default mock API URL: can be configured by user, defaults to empty (which triggers local simulation)
let currentMockApiUrl: string | null = null;

export const api = {
  /**
   * Get developer mode settings
   */
  async getDevSettings() {
    const isOffline = (await AsyncStorage.getItem(DEV_OFFLINE_KEY)) === 'true';
    const isError = (await AsyncStorage.getItem(DEV_ERROR_KEY)) === 'true';
    const mockUrl = await AsyncStorage.getItem(MOCK_API_URL_KEY);
    return { isOffline, isError, mockUrl };
  },

  /**
   * Set developer mode settings
   */
  async setDevSettings(settings: { isOffline?: boolean; isError?: boolean; mockUrl?: string }) {
    if (settings.isOffline !== undefined) {
      await AsyncStorage.setItem(DEV_OFFLINE_KEY, String(settings.isOffline));
    }
    if (settings.isError !== undefined) {
      await AsyncStorage.setItem(DEV_ERROR_KEY, String(settings.isError));
    }
    if (settings.mockUrl !== undefined) {
      await AsyncStorage.setItem(MOCK_API_URL_KEY, settings.mockUrl);
    }
  },

  /**
   * Fetches orders list, applying loading delays, offline conditions, and cached lookups.
   */
  async fetchOrders(forceRefresh = false): Promise<Order[]> {
    const devSettings = await this.getDevSettings();

    // 1. Force Error State injection
    if (devSettings.isError) {
      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      throw new Error('Developer Mode: Simulated server error (500). Please disable simulated error state to retry.');
    }

    // 2. Determine network status (incorporating Force Offline mode)
    const netState = await NetInfo.fetch();
    const isActuallyOffline = !netState.isConnected;
    const isOffline = isActuallyOffline || devSettings.isOffline;

    // Simulate standard network latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (isOffline) {
      // Return cache if available, else throw error
      const cached = await AsyncStorage.getItem(ORDERS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw new Error('You are currently offline. Check your internet connection or disable Simulated Offline Mode.');
    }

    // 3. Attempt to fetch from configured remote mock URL
    const urlToFetch = devSettings.mockUrl || currentMockApiUrl;
    if (urlToFetch) {
      try {
        const response = await fetch(urlToFetch);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        const data = await response.json();
        // Simple structure validation
        if (Array.isArray(data)) {
          await AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(data));
          return data as Order[];
        }
      } catch (err) {
        console.warn('Remote fetch failed, falling back to local cache or files', err);
      }
    }

    // 4. Default: Use local mock data file (simulating online fetch behavior)
    // Save to cache
    await AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(localOrders));
    return localOrders as Order[];
  },

  /**
   * Fetches a single order by ID
   */
  async fetchOrderById(id: string): Promise<Order | null> {
    const orders = await this.fetchOrders();
    return orders.find((o) => o.id === id) || null;
  },

  /**
   * Advanced simulation: Advance status of an order dynamically in cache
   */
  async advanceOrderStatus(id: string): Promise<Order | null> {
    // Force direct fetch to bypass errors/offline checks if user is advancing in dev mode
    const cached = await AsyncStorage.getItem(ORDERS_CACHE_KEY);
    let orders: Order[] = cached ? JSON.parse(cached) : localOrders;
    
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) return null;
    
    const order = { ...orders[orderIndex] };
    const statusSequence: Order['status'][] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = statusSequence.indexOf(order.status);
    
    if (currentIdx === -1 || currentIdx === statusSequence.length - 1) {
      // Loop back or reset for simulation testing
      order.status = 'Processing';
      order.timeline = [
        { status: 'Order Placed', time: new Date().toISOString(), description: 'Order initialized.' },
        { status: 'Processing', time: new Date().toISOString(), description: 'Order placed in queue.' }
      ];
    } else {
      const nextStatus = statusSequence[currentIdx + 1];
      order.status = nextStatus;
      
      let description = '';
      switch (nextStatus) {
        case 'Shipped':
          description = 'Carrier: FedEx (Tracking: FX-742918). Left sorting facility.';
          break;
        case 'Out for Delivery':
          description = 'Courier is en route to delivery address.';
          break;
        case 'Delivered':
          description = 'Delivered & signed. Thank you!';
          break;
      }
      
      // Ensure we don't duplicate timeline entries
      if (!order.timeline.some(t => t.status === nextStatus)) {
        order.timeline = [
          ...order.timeline,
          {
            status: nextStatus,
            time: new Date().toISOString(),
            description
          }
        ];
      }
    }
    
    orders[orderIndex] = order;
    await AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orders));
    return order;
  }
};
