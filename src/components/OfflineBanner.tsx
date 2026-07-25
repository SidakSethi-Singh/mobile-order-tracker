import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { api } from '@/services/api';
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner() {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    let unsubscribe: () => void;

    // Listen to network changes and combine with developer offline mock
    const checkStatus = async () => {
      // Monitor actual network state
      unsubscribe = NetInfo.addEventListener(async (state) => {
        const actualOffline = !state.isConnected;
        const devSettings = await api.getDevSettings();
        const offline = actualOffline || devSettings.isOffline;
        setIsOffline(!!offline);
      });

      // Poll dev settings periodicially in case they change
      const interval = setInterval(async () => {
        const netState = await NetInfo.fetch();
        const actualOffline = !netState.isConnected;
        const devSettings = await api.getDevSettings();
        const offline = actualOffline || devSettings.isOffline;
        setIsOffline(!!offline);
      }, 1000);

      return () => {
        if (unsubscribe) unsubscribe();
        clearInterval(interval);
      };
    };

    checkStatus();
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isOffline ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline]);

  if (!isOffline) return null;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.cancelled,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>No internet connection. Showing cached orders.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
