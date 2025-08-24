import { ThemedText } from '@/components/ThemedText';
import { tw } from '@/utils/tw';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.8} style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between bg-[#111827] border border-[#1f2937] rounded-2xl px-4 py-3`}>
          <ThemedText variant="bodyMedium" style={tw`text-white`}>{label}</ThemedText>
          <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>{value}</ThemedText>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={tw`flex-1 bg-black/60`} onPress={() => setOpen(false)}>
          <View style={tw`absolute left-4 right-4 bottom-6 bg-[#111827] rounded-2xl p-2 border border-[#1f2937]`}>
            <ThemedText variant="titleSmall" style={tw`px-3 py-2 text-white`}>{label}</ThemedText>
            <ScrollView style={tw`max-h-80`}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <View style={tw`px-3 py-3 rounded-xl ${value === opt ? 'bg-yellow-200' : ''}`}>
                    <ThemedText variant="bodyMedium" style={tw`${value === opt ? 'text-black font-semibold' : 'text-white'}`}>{opt}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}


