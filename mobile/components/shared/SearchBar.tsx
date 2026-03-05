import React from 'react';
import { Searchbar } from 'react-native-paper';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search…' }: Props) {
  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={{ margin: 12, borderRadius: 12 }}
      elevation={0}
    />
  );
}
