import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, useTheme, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RenewalBadge } from '@/components/services/RenewalBadge';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { COMMON_CURRENCIES } from '@/constants/currencies';
import type { Service } from '@/lib/db/schema';

type Props = {
  service: Service;
  onPress: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  active: '#E8F5E9',
  inactive: '#F5F5F5',
  cancelled: '#FFEBEE',
  pending: '#FFF3E0',
};

function formatCost(cost: number | null, currency: string | null, frequency: string | null): string {
  if (!cost) return '';
  const symbol = COMMON_CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency ?? '';
  const freq = frequency === 'monthly' ? '/mo' : frequency === 'annual' ? '/yr' : '';
  return `${symbol}${cost}${freq}`;
}

export function ServiceCard({ service, onPress }: Props) {
  const theme = useTheme();
  const categoryConfig = SERVICE_CATEGORIES.find((c) => c.value === service.category);
  const bgColor = STATUS_COLORS[service.status ?? 'active'];
  const costLabel = formatCost(service.cost ?? null, service.costCurrency ?? null, service.costFrequency ?? null);

  const left = () => (
    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons
        name={(categoryConfig?.icon ?? 'folder') as any}
        size={22}
        color={theme.colors.primary}
      />
    </View>
  );

  const right = () => (
    <View style={styles.right}>
      {costLabel ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {costLabel}
        </Text>
      ) : null}
      {service.renewalDate ? <RenewalBadge dateMs={service.renewalDate} /> : null}
    </View>
  );

  return (
    <List.Item
      title={service.name}
      description={service.provider ?? service.category}
      left={left}
      right={right}
      onPress={onPress}
      style={styles.item}
    />
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 6 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    alignSelf: 'center',
  },
  right: { alignItems: 'flex-end', justifyContent: 'center', gap: 4, paddingRight: 4 },
});
