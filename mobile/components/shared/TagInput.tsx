import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, TextInput, useTheme } from 'react-native-paper';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
};

export function TagInput({ value, onChange, label = 'Tags' }: Props) {
  const [input, setInput] = useState('');
  const theme = useTheme();

  function addTag() {
    const tag = input.trim().toLowerCase();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={addTag}
        blurOnSubmit={false}
        right={<TextInput.Icon icon="plus" onPress={addTag} />}
        mode="outlined"
        style={styles.input}
      />
      {value.length > 0 && (
        <View style={styles.chips}>
          {value.map((tag) => (
            <Chip
              key={tag}
              onClose={() => removeTag(tag)}
              style={{ backgroundColor: theme.colors.secondaryContainer }}
              compact
            >
              {tag}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  input: { marginBottom: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
