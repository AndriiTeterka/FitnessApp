import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function TopMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} accessibilityLabel="Open menu" hitSlop={10}>
        <Text style={{ fontSize: 22, color: '#ffffff', paddingHorizontal: 8 }}>≡</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOpen(false)}>
          <View style={{ position: 'absolute', top: 52, right: 12, backgroundColor: 'white', borderRadius: 12, paddingVertical: 8, width: 180, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 }}>
            <Link href="/(tabs)" asChild>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                <ThemedText variant="bodyMedium" style={{ color: '#111827' }}>Home</ThemedText>
              </TouchableOpacity>
            </Link>
            <Link href="/exercises" asChild>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                <ThemedText variant="bodyMedium" style={{ color: '#111827' }}>Exercises</ThemedText>
              </TouchableOpacity>
            </Link>
            <Link href="/profile" asChild>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                <ThemedText variant="bodyMedium" style={{ color: '#111827' }}>Profile</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}


