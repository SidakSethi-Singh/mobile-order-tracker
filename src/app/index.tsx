import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
  SafeAreaView
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { api, Order } from '@/services/api';
import { OrderCard } from '@/components/OrderCard';
import { CreditFooter } from '@/components/CreditFooter';
import { Spacing, Shadows } from '@/constants/theme';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

export default function OrdersListScreen() {
  const theme = useTheme();
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Dev tools panel state
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devOffline, setDevOffline] = useState(false);
  const [devError, setDevError] = useState(false);
  const [mockUrlInput, setMockUrlInput] = useState('');

  // Status options for filter bar
  const filterStatuses = ['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  // Initial load
  useEffect(() => {
    loadDevSettings();
    loadOrders(true);
  }, []);

  const loadDevSettings = async () => {
    try {
      const settings = await api.getDevSettings();
      setDevOffline(settings.isOffline);
      setDevError(settings.isError);
      setMockUrlInput(settings.mockUrl || '');
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const data = await api.fetchOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders(false);
  };

  const saveDevSettings = async () => {
    await api.setDevSettings({
      isOffline: devOffline,
      isError: devError,
      mockUrl: mockUrlInput.trim() || undefined,
    });
    // Trigger re-fetch
    loadOrders(true);
  };

  const resetDevSettings = async () => {
    setDevOffline(false);
    setDevError(false);
    setMockUrlInput('');
    await api.setDevSettings({
      isOffline: false,
      isError: false,
      mockUrl: undefined,
    });
    // Trigger re-fetch
    loadOrders(true);
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Compute dashboard metrics
  const stats = orders.reduce(
    (acc, order) => {
      acc.total++;
      if (order.status === 'Processing') acc.pending++;
      else if (order.status === 'Shipped' || order.status === 'Out for Delivery') acc.transit++;
      else if (order.status === 'Delivered') acc.delivered++;
      return acc;
    },
    { total: 0, pending: 0, transit: 0, delivered: 0 }
  );

  // Skeleton shimmer placeholder component
  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.skeletonCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.skeletonHeader}>
              <View style={[styles.skeletonLineShort, { backgroundColor: theme.backgroundElement }]} />
              <View style={[styles.skeletonBadge, { backgroundColor: theme.backgroundElement }]} />
            </View>
            <View style={styles.skeletonDivider} />
            <View style={styles.skeletonBody}>
              <View style={[styles.skeletonLine, { backgroundColor: theme.backgroundElement }]} />
              <View style={[styles.skeletonLine, { backgroundColor: theme.backgroundElement }]} />
            </View>
            <View style={styles.skeletonFooter}>
              <View style={[styles.skeletonLineShort, { backgroundColor: theme.backgroundElement }]} />
              <View style={[styles.skeletonLineMedium, { backgroundColor: theme.backgroundElement }]} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header Container */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]}>Track Orders</Text>
          <TouchableOpacity
            onPress={() => setShowDevPanel(!showDevPanel)}
            style={[
              styles.devButton,
              { backgroundColor: showDevPanel ? theme.primaryLight : theme.backgroundElement },
            ]}
          >
            <Text style={[styles.devButtonText, { color: showDevPanel ? theme.primary : theme.textSecondary }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Developer controls panel */}
        {showDevPanel && (
          <Animated.View
            entering={FadeIn.duration(250)}
            style={[
              styles.devPanel,
              { backgroundColor: theme.card, borderColor: theme.cardBorder, ...Shadows },
            ]}
          >
            <Text style={[styles.devPanelTitle, { color: theme.text }]}>Developer Settings</Text>
            <Text style={[styles.devPanelSubtitle, { color: theme.textMuted }]}>
              Use these to easily test error states & offline behavior for your Loom demo.
            </Text>

            <View style={styles.devSettingRow}>
              <Text style={[styles.devSettingLabel, { color: theme.textSecondary }]}>
                Simulate Offline Mode
              </Text>
              <Switch
                value={devOffline}
                onValueChange={(val) => setDevOffline(val)}
                trackColor={{ true: theme.primary }}
              />
            </View>

            <View style={styles.devSettingRow}>
              <Text style={[styles.devSettingLabel, { color: theme.textSecondary }]}>
                Simulate Server Error (500)
              </Text>
              <Switch
                value={devError}
                onValueChange={(val) => setDevError(val)}
                trackColor={{ true: theme.cancelled }}
              />
            </View>

            <View style={styles.devUrlInputContainer}>
              <Text style={[styles.devUrlLabel, { color: theme.textSecondary }]}>
                Mock API URL (Optional)
              </Text>
              <TextInput
                value={mockUrlInput}
                onChangeText={setMockUrlInput}
                placeholder="https://mockapi.io/orders"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.devUrlInput,
                  { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.background },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={saveDevSettings}
              style={[styles.saveDevButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.saveDevButtonText}>Apply & Refetch</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Search bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by Order ID, Customer, or Item name..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              color: theme.text,
            },
          ]}
        />

        {/* Dashboard Mini-Stats Bar */}
        <View style={styles.statsBar}>
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total</Text>
            <Text style={[styles.statsValue, { color: theme.text }]}>{stats.total}</Text>
          </View>
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statsLabel, { color: theme.processing }]}>Pending</Text>
            <Text style={[styles.statsValue, { color: theme.processing }]}>{stats.pending}</Text>
          </View>
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statsLabel, { color: theme.shipped }]}>In Transit</Text>
            <Text style={[styles.statsValue, { color: theme.shipped }]}>{stats.transit}</Text>
          </View>
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.statsLabel, { color: theme.delivered }]}>Completed</Text>
            <Text style={[styles.statsValue, { color: theme.delivered }]}>{stats.delivered}</Text>
          </View>
        </View>

        {/* Categories / Filter scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterStatuses.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setSelectedStatus(status);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#ffffff' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List Area */}
      {loading ? (
        renderSkeleton()
      ) : error ? (
        /* Error State */
        <View style={styles.centerContainer}>
          <View style={[styles.errorIndicator, { backgroundColor: theme.cancelled }]} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to load orders</Text>
          <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadOrders(true)}
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetDevSettings}
            style={[styles.retryButton, { backgroundColor: theme.backgroundElement, marginTop: 8 }]}
          >
            <Text style={[styles.retryButtonText, { color: theme.text }]}>Reset Simulation Settings</Text>
          </TouchableOpacity>
        </View>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIndicator, { backgroundColor: theme.cardBorder }]} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Try clearing filters or checking another search query.
          </Text>
          {(searchQuery || selectedStatus !== 'All') && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.retryButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Orders List */
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <OrderCard order={item} index={index} />}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListFooterComponent={<CreditFooter />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  devButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  devButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  devPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    gap: 12,
  },
  devPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  devPanelSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  devSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devSettingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  devUrlInputContainer: {
    gap: 4,
  },
  devUrlLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  devUrlInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveDevButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDevButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  skeletonCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonLineShort: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  skeletonLineMedium: {
    width: 60,
    height: 18,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 70,
    height: 22,
    borderRadius: 11,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.05)',
    marginVertical: 12,
  },
  skeletonBody: {
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 4,
    width: '100%',
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
  },
});
