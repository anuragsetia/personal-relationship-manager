import React from 'react';
import { Chip } from 'react-native-paper';
import { differenceInDays } from 'date-fns';

type Props = {
  dateMs: number; // unix ms
  compact?: boolean;
};

function getBadgeConfig(daysLeft: number): { label: string; color: string; textColor: string } {
  if (daysLeft < 0) return { label: 'Expired', color: '#FFCDD2', textColor: '#B71C1C' };
  if (daysLeft === 0) return { label: 'Today', color: '#FFCDD2', textColor: '#B71C1C' };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: '#FFE0B2', textColor: '#E65100' };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, color: '#FFF9C4', textColor: '#F57F17' };
  return { label: `${daysLeft}d left`, color: '#E8F5E9', textColor: '#2E7D32' };
}

export function RenewalBadge({ dateMs, compact = true }: Props) {
  const daysLeft = differenceInDays(new Date(dateMs), new Date());
  const { label, color, textColor } = getBadgeConfig(daysLeft);

  return (
    <Chip
      compact={compact}
      style={{ backgroundColor: color, alignSelf: 'flex-start' }}
      textStyle={{ color: textColor, fontSize: 11 }}
    >
      {label}
    </Chip>
  );
}
