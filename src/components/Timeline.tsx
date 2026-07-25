import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Order, TimelineEvent } from '@/services/api';

interface TimelineProps {
  order: Order;
}

export function Timeline({ order }: TimelineProps) {
  const theme = useTheme();

  // Standard milestones
  const standardMilestones = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  // Animation values for fading/drawing effect
  const animValues = React.useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Run staggered animation on load
    const animations = animValues.map((val, idx) =>
      Animated.timing(val, {
        toValue: 1,
        duration: 400,
        delay: idx * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  }, [order.id]);

  // Formatting date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  // Determine current active milestone index
  const getMilestoneIndex = (status: string) => {
    return standardMilestones.indexOf(status);
  };

  const currentStatusIndex = getMilestoneIndex(order.status);

  // Status-specific theme color lookup
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cancelled':
        return theme.cancelled;
      case 'Delivered':
        return theme.delivered;
      case 'Out for Delivery':
        return theme.outForDelivery;
      case 'Shipped':
        return theme.shipped;
      default:
        return theme.primary;
    }
  };

  const activeColor = getStatusColor(order.status);

  // Helper to render individual timeline item
  const renderTimelineItem = (
    title: string,
    isCompleted: boolean,
    isActive: boolean,
    timeText: string,
    descText: string,
    isLast: boolean,
    animIndex: number
  ) => {
    // Choose status indicator style
    let dotBg: string = theme.backgroundElement;
    let dotBorder: string = theme.textMuted;
    let lineColor: string = theme.backgroundElement;
    let lineStyle: 'solid' | 'dashed' = 'solid';

    if (isCompleted) {
      dotBg = theme.primaryLight;
      dotBorder = theme.primary;
      lineColor = theme.primary;
    }

    if (isActive) {
      dotBg = activeColor;
      dotBorder = activeColor;
      lineColor = theme.backgroundElement;
      lineStyle = 'dashed';
    }

    const opacity = animValues[animIndex] || new Animated.Value(1);

    return (
      <Animated.View
        key={title}
        style={[
          styles.row,
          {
            opacity,
            transform: [
              {
                translateY: opacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [15, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.leftColumn}>
          {/* Vertical line connector */}
          {!isLast && (
            <View
              style={[
                styles.verticalLine,
                {
                  backgroundColor: lineStyle === 'solid' ? lineColor : 'transparent',
                  borderColor: lineColor,
                  borderStyle: lineStyle,
                  borderWidth: lineStyle === 'dashed' ? 1 : 0,
                },
              ]}
            />
          )}

          {/* Timeline node */}
          <View
            style={[
              styles.nodeCircle,
              {
                backgroundColor: dotBg,
                borderColor: dotBorder,
                transform: [{ scale: isActive ? 1.2 : 1.0 }],
              },
            ]}
          >
            {isCompleted && !isActive && (
              <View style={[styles.innerCheck, { backgroundColor: theme.primary }]} />
            )}
            {isActive && <View style={styles.innerPulse} />}
          </View>
        </View>

        {/* Content detail card */}
        <View style={styles.rightColumn}>
          <View style={styles.contentHeader}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: isActive ? activeColor : isCompleted ? theme.text : theme.textMuted,
                  fontWeight: isActive ? '700' : '600',
                },
              ]}
            >
              {title}
            </Text>
            {timeText ? (
              <Text style={[styles.itemTime, { color: theme.textMuted }]}>
                {timeText}
              </Text>
            ) : null}
          </View>
          <Text
            style={[
              styles.itemDesc,
              { color: isCompleted || isActive ? theme.textSecondary : theme.textMuted },
            ]}
          >
            {descText}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // If the order is cancelled, we render a simplified two-step timeline
  if (order.status === 'Cancelled') {
    const placedEvent = order.timeline.find((t) => t.status === 'Order Placed') || {
      time: order.placed_at,
      description: 'Order placed by customer.',
    };
    const cancelledEvent = order.timeline.find((t) => t.status === 'Cancelled') || {
      time: order.placed_at,
      description: 'Order cancelled.',
    };

    return (
      <View style={styles.container}>
        {renderTimelineItem(
          'Order Placed',
          true,
          false,
          formatDate(placedEvent.time),
          placedEvent.description,
          false,
          0
        )}
        {renderTimelineItem(
          'Cancelled',
          false,
          true,
          formatDate(cancelledEvent.time),
          cancelledEvent.description,
          true,
          1
        )}
      </View>
    );
  }

  // Otherwise render standard progress
  return (
    <View style={styles.container}>
      {standardMilestones.map((milestone, idx) => {
        const milestoneIndex = getMilestoneIndex(milestone);
        const isCompleted = milestoneIndex <= currentStatusIndex;
        const isActive = milestoneIndex === currentStatusIndex;

        // Find match in actual timeline data
        const actualEvent = order.timeline.find((t) => t.status === milestone);

        let timeText = '';
        let descText = '';

        if (actualEvent) {
          timeText = formatDate(actualEvent.time);
          descText = actualEvent.description;
        } else {
          // Placeholder messages for future states
          switch (milestone) {
            case 'Processing':
              descText = 'Awaiting warehouse packing and verification.';
              break;
            case 'Shipped':
              descText = 'Package awaits pickup from shipping carrier.';
              break;
            case 'Out for Delivery':
              descText = 'Awaiting local facility scan and delivery dispatch.';
              break;
            case 'Delivered':
              descText = 'Awaiting final drop-off at delivery address.';
              break;
            default:
              descText = 'Pending.';
          }
        }

        return renderTimelineItem(
          milestone,
          isCompleted,
          isActive,
          timeText,
          descText,
          idx === standardMilestones.length - 1,
          idx
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  verticalLine: {
    position: 'absolute',
    top: 24,
    bottom: -10,
    width: 2,
    alignSelf: 'center',
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  innerCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  innerPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 24,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemTime: {
    fontSize: 12,
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
