import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

interface TrackingMapProps {
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  customerName: string;
}

export function TrackingMap({ status, customerName }: TrackingMapProps) {
  const theme = useTheme();

  const progress = useSharedValue(status === 'Out for Delivery' ? 0.75 : 0.35);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(2, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    const baseProgress = status === 'Out for Delivery' ? 0.75 : 0.35;
    progress.value = withRepeat(
      withSequence(
        withTiming(baseProgress + 0.04, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(baseProgress, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [status]);

  const markerStyle = useAnimatedStyle(() => {
    const width = Dimensions.get('window').width - 72;
    const startX = 40;
    const endX = width - 40;
    const startY = 80;
    const endY = 40;

    const currentX = startX + (endX - startX) * progress.value;
    const currentY = startY + (endY - startY) * progress.value;

    return {
      transform: [
        { translateX: currentX - 12 },
        { translateY: currentY - 12 }
      ]
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: 1 - (pulse.value - 1)
    };
  });

  // Early return moved below all hooks to satisfy Rules of Hooks
  if (status === 'Cancelled' || status === 'Processing' || status === 'Delivered') {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
      <View style={styles.mapHeader}>
        <Text style={[styles.title, { color: theme.text }]}>Transit Route</Text>
        <Text style={[styles.timeText, { color: theme.primary }]}>
          {status === 'Out for Delivery' ? 'Arriving soon' : 'In transit'}
        </Text>
      </View>

      <View style={styles.canvas}>
        {/* Custom minimalist road grid */}
        <View style={[styles.street, { left: 40, top: 0, bottom: 0, width: 1, backgroundColor: `${theme.cardBorder}50` }]} />
        <View style={[styles.street, { left: 160, top: 0, bottom: 0, width: 1, backgroundColor: `${theme.cardBorder}50` }]} />
        <View style={[styles.street, { left: 280, top: 0, bottom: 0, width: 1, backgroundColor: `${theme.cardBorder}50` }]} />
        <View style={[styles.street, { top: 40, left: 0, right: 0, height: 1, backgroundColor: `${theme.cardBorder}50` }]} />
        <View style={[styles.street, { top: 80, left: 0, right: 0, height: 1, backgroundColor: `${theme.cardBorder}50` }]} />

        {/* Start Point */}
        <View style={[styles.pointContainer, { left: 40 - 16, top: 80 - 16 }]}>
          <View style={[styles.pointCircle, { backgroundColor: theme.primary }]} />
          <Text style={[styles.pointLabel, { color: theme.textSecondary }]}>HUB</Text>
        </View>

        {/* End Point */}
        <View style={[styles.pointContainer, { right: 40 - 16, top: 40 - 16 }]}>
          <View style={[styles.pointCircle, { backgroundColor: theme.delivered }]} />
          <Text style={[styles.pointLabel, { color: theme.textSecondary }]}>DEST</Text>
        </View>

        {/* Route connecting line */}
        <View style={[styles.dashedPath, { borderColor: theme.primary }]} />

        {/* Pulsing GPS location marker */}
        <Animated.View style={[styles.markerContainer, markerStyle]}>
          <Animated.View style={[styles.pulseWave, { borderColor: theme.primary }, pulseStyle]} />
          <View style={[styles.markerCore, { backgroundColor: theme.primary }]} />
        </Animated.View>
      </View>

      <View style={styles.mapFooter}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Delivery address: <Text style={{ color: theme.text, fontWeight: '600' }}>{customerName}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 12,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.08)',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  canvas: {
    height: 120,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  street: {
    position: 'absolute',
  },
  pointContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 32,
  },
  pointCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dashedPath: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: 60,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    zIndex: 1,
  },
  markerContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pulseWave: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  markerCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapFooter: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.08)',
  },
  footerText: {
    fontSize: 12,
  },
});
