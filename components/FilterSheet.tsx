import SheetHandle from '@/components/SheetHandle';
import { ThemedText } from '@/components/ThemedText';
import tw from '@/utils/tw';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Button, Chip } from 'react-native-paper';

type Option = string;

type Props = {
  open: boolean;
  onClose: () => void;
  goal: string;
  env: string;
  difficulty: string;
  goals: Option[];
  envs: Option[];
  onChange: (next: { goal?: string; env?: string; difficulty?: string }) => void;
  onReset?: () => void;
};

export default function FilterSheet({ open, onClose, goal, env, difficulty, goals, envs, onChange, onReset }: Props) {
  const [local, setLocal] = useState({ goal, env, difficulty });

  React.useEffect(() => { setLocal({ goal, env, difficulty }); }, [goal, env, difficulty]);

  function Pill({ label, value, current, onPress }: { label: string; value: string; current: string; onPress: () => void }) {
    const selected = current === value;
    return (
      <Chip
        selected={selected}
        onPress={onPress}
        style={tw`${selected ? 'bg-yellow-200' : 'bg-[#1f2937]'} mr-2 mb-2`}
        selectedColor="#111827"
        textStyle={tw`${selected ? 'text-black' : 'text-white'}`}
      >
        {label}
      </Chip>
    );
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/60`} onPress={onClose}>
        <View style={tw`absolute left-0 right-0 bottom-0 bg-[#111827] rounded-t-3xl p-4 border border-[#1f2937]`}> 
          <SheetHandle />
          <ThemedText variant="headlineLarge" style={tw`text-white mb-2`}>Filters</ThemedText>
          <ScrollView style={tw`max-h-96`}>
            <ThemedText variant="titleMedium" style={tw`text-white mb-2`}>Training Goal</ThemedText>
            <View style={tw`flex-row flex-wrap`}>
              {goals.map((g) => (
                <Pill key={g} label={g} value={g} current={local.goal} onPress={() => setLocal((p) => ({ ...p, goal: g }))} />
              ))}
            </View>
            <ThemedText variant="titleMedium" style={tw`text-white my-2`}>Environment</ThemedText>
            <View style={tw`flex-row flex-wrap`}>
              {envs.map((e) => (
                <Pill key={e} label={e} value={e} current={local.env} onPress={() => setLocal((p) => ({ ...p, env: e }))} />
              ))}
            </View>
            <ThemedText variant="titleMedium" style={tw`text-white my-2`}>Difficulty</ThemedText>
            <View style={tw`flex-row flex-wrap`}>
              {['All','Beginner','Intermediate','Advanced'].map((d) => (
                <Pill key={d} label={d} value={d} current={local.difficulty} onPress={() => setLocal((p) => ({ ...p, difficulty: d }))} />
              ))}
            </View>
          </ScrollView>
          <View style={tw`flex-row justify-between mt-3`}>
            <Button mode="outlined" onPress={() => { onReset?.(); onClose(); }} textColor="#fff" style={tw`border-white/20`}>
              Reset
            </Button>
            <Button mode="contained" onPress={() => { onChange(local); onClose(); }}>
              Apply
            </Button>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}


