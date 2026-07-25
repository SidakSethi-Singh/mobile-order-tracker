import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { Order } from '@/services/api';
import { Spacing, Shadows } from '@/constants/theme';

interface OrderCardProps {
  order: Order;
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  const theme = useTheme();

  // Get status color
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

  // Formatting date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' • ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const statusColor = getStatusColor(order.status);

  // Generate item overview text
  const itemOverview = order.items
    .map((item) => `${item.name} (x${item.quantity})`)
    .join(', ');

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify().damping(12)}
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          ...Shadows,
        },
      ]}
    >
      <Link href={`/orders/${order.id}`} asChild>
        <TouchableOpacity activeOpacity={0.7} style={styles.touchable}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.orderId, { color: theme.text }]}>
                {order.id}
              </Text>
              <Text style={[styles.dateText, { color: theme.textMuted }]}>
                {formatDate(order.placed_at)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` }, // 15% opacity background
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Customer</Text>
              <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                {order.customer.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Items</Text>
              <Text style={[styles.value, { color: theme.textSecondary }]} numberOfLines={1}>
                {itemOverview}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.amountLabel, { color: theme.textMuted }]}>Total Amount</Text>
            <Text style={[styles.amountValue, { color: theme.primary }]}>
              ${order.amount.toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  touchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.05)',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
