import tw from '@/utils/tw';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
        <View style={tw`flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3`}>
          <Text style={tw`text-gray-900`}>{label}</Text>
          <Text style={tw`text-gray-500`}>{value}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={tw`flex-1 bg-black/30`} onPress={() => setOpen(false)}>
          <View style={tw`absolute left-4 right-4 bottom-6 bg-white rounded-2xl p-2 border border-gray-100`}>
            <Text style={tw`px-3 py-2 text-gray-900 font-semibold`}>{label}</Text>
            <ScrollView style={tw`max-h-80`}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <View style={tw`px-3 py-3 rounded-xl ${value === opt ? 'bg-blue-50' : ''}`}>
                    <Text style={tw`${value === opt ? 'text-blue-700 font-semibold' : 'text-gray-800'}`}>{opt}</Text>
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


