import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';
import { api, Order } from '@/services/api';
import { Timeline } from '@/components/Timeline';
import { TrackingMap } from '@/components/TrackingMap';
import { CreditFooter } from '@/components/CreditFooter';
import { Spacing, Shadows } from '@/constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchOrderById(id);
      if (data) {
        setOrder(data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async () => {
    if (!order) return;
    try {
      const updated = await api.advanceOrderStatus(order.id);
      if (updated) {
        setOrder(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  // Determine status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Processing':
        return theme.processing;
      case 'Shipped':
        return theme.shipped;
      case 'Out for Delivery':
        return theme.outForDelivery;
      case 'Delivered':
        return theme.delivered;
      case 'Cancelled':
        return theme.cancelled;
      default:
        return theme.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.primary} /><Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading order details...</Text></View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}><View style={[styles.errorIndicator, { backgroundColor: theme.cancelled }]} /><Text style={[styles.errorTitle, { color: theme.text }]}>Order Details Error</Text><Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>{error || 'Unable to retrieve order details.'}</Text><TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.primary }]}><Text style={styles.backButtonText}>Go Back</Text></TouchableOpacity></View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(order.status);
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0.00; // Free shipping
  const estimatedTax = subtotal * 0.08; // 8% sales tax

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <Text style={[styles.iconButtonText, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Order Details</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main overview card */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[
            styles.overviewCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder, ...Shadows },
          ]}
        >
          <View style={styles.overviewHeader}>
            <View>
              <Text style={[styles.orderIdText, { color: theme.text }]}>{order.id}</Text>
              <Text style={[styles.orderDateText, { color: theme.textMuted }]}>
                Placed on {formatDate(order.placed_at)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAdvanceStatus}
            activeOpacity={0.7}
            style={[styles.simulatorButton, { backgroundColor: theme.primaryLight }]}
          >
            <Text style={[styles.simulatorButtonText, { color: theme.primary }]}>
              Advance Tracking Status
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Timeline section */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder, ...Shadows },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tracking History</Text>
          <Timeline order={order} />
        </Animated.View>

        {/* Tracking Map Simulation */}
        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <TrackingMap status={order.status} customerName={order.customer.name} />
        </Animated.View>

        {/* Customer details section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder, ...Shadows },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Shipping & Customer Information</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Name</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{order.customer.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{order.customer.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Phone</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{order.customer.phone}</Text>
          </View>
          <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Address</Text>
            <Text style={[styles.detailValue, { color: theme.text, textAlign: 'right', flex: 1.5 }]}>
              {order.customer.address}
            </Text>
          </View>
        </Animated.View>

        {/* Items list section */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder, ...Shadows },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemQtyPrice, { color: theme.textSecondary }]}>
                  {item.quantity} × ${item.price.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.itemSubtotal, { color: theme.text }]}>
                ${(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.costDivider} />

          {/* Subtotals & total */}
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.costValue, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Shipping</Text>
            <Text style={[styles.costValue, { color: theme.delivered }]}>Free</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { color: theme.textSecondary }]}>Estimated Tax (8%)</Text>
            <Text style={[styles.costValue, { color: theme.text }]}>${estimatedTax.toFixed(2)}</Text>
          </View>
          <View style={[styles.costRow, styles.grandTotalRow]}>
            <Text style={[styles.grandTotalLabel, { color: theme.text }]}>Total Amount</Text>
            <Text style={[styles.grandTotalValue, { color: theme.primary }]}>
              ${order.amount.toFixed(2)}
            </Text>
          </View>
        </Animated.View>

        <CreditFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  overviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  simulatorButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  simulatorButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orderDateText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQtyPrice: {
    fontSize: 12,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    marginVertical: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  grandTotalRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.08)',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
});
