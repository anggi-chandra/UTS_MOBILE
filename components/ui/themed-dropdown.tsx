import React, { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type DropdownItem = { label: string; value: string };

type Props = {
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
};

// Simple themed dropdown intended for web; on native you should use Picker.
export default function ThemedDropdown({ items, selectedValue, onValueChange, placeholder, disabled, maxHeight = 220 }: Props) {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const boxRef = useRef<any>(null);
  const selectedLabel = useMemo(() => {
    const found = items.find(i => i.value === selectedValue);
    return found ? found.label : (placeholder ?? 'Pilih');
  }, [items, selectedValue, placeholder]);

  // For non-web platforms, just render a disabled box to avoid confusion
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.box, { borderColor: border, backgroundColor: bg }]}> 
        <Text style={{ color: text }}>{selectedLabel}</Text>
      </View>
    );
  }

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        ref={boxRef}
        disabled={disabled}
        onPress={() => {
          // hitung posisi untuk menu (web)
          if (Platform.OS === 'web') {
            const rect = boxRef.current?.getBoundingClientRect?.();
            if (rect) {
              setMenuPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
            }
          }
          setOpen(o => !o);
        }}
        style={({ pressed }) => [
          styles.box,
          {
            borderColor: border,
            backgroundColor: bg,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        <Text style={[styles.boxText, { color: text }]}>{selectedLabel}</Text>
        <View style={[styles.chevron, { borderTopColor: text }]} />
      </Pressable>

      {open && !disabled && (
        Platform.OS === 'web' ? (
          <Modal transparent animationType="none" visible onRequestClose={() => setOpen(false)}>
            {/* overlay to close when clicking outside */}
            <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
            <View
              style={[
                styles.dropdown,
                {
                  backgroundColor: bg,
                  borderColor: border,
                  position: 'absolute',
                  top: menuPos?.top,
                  left: menuPos?.left,
                  width: menuPos?.width,
                  zIndex: 100000,
                },
              ]}
            >
              <ScrollView style={{ maxHeight, backgroundColor: bg }}>
                {items.map((it) => {
                  const active = it.value === selectedValue;
                  return (
                    <Pressable
                      key={it.value}
                      onPress={() => { onValueChange(it.value); setOpen(false); }}
                      style={({ hovered }) => [
                        styles.item,
                        {
                          backgroundColor: active ? tint : (hovered ? (Platform.OS === 'web' ? '#ffffff10' : '#00000020') : bg),
                          borderColor: active ? tint : 'transparent',
                        },
                      ]}
                    >
                      <Text style={{ color: text }}>{it.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Modal>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxText: {
    fontSize: 16,
  },
  chevron: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginLeft: 8,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
    elevation: 20,
  } as any,
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});