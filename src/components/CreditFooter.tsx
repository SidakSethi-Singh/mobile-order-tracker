import React from 'react';
import { StyleSheet, TouchableOpacity, Linking, View, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function CreditFooter() {
  const theme = useTheme();

  const handlePress = () => {
    Linking.openURL('https://digitalheroesco.com');
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.cardBorder }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        Built for{' '}
      </Text>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Text style={[styles.linkText, { color: theme.primary }]}>
          Digital Heroes Training Task
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderTopWidth: 1,
    width: '100%',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
