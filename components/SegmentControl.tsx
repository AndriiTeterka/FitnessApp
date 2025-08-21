import tw from '@/utils/tw';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type SegmentControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
};

export default function SegmentControl<T extends string>({ options, value, onChange }: SegmentControlProps<T>) {
  return (
    <View style={tw`flex-row bg-[#111827] rounded-2xl p-1 border border-[#1f2937]`}> 
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <TouchableOpacity key={String(opt)} onPress={() => onChange(opt)} style={tw`flex-1`}>
            <View style={tw.style('rounded-xl py-2 items-center', selected ? 'bg-yellow-200' : '')}>
              <Text style={tw`${selected ? 'text-black font-semibold' : 'text-white'}`}>{String(opt)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


