import tw from '@/utils/tw';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
    const active = current === value;
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={tw.style('px-3 py-2 rounded-full mr-2 mb-2', active ? 'bg-blue-600' : 'bg-gray-100')}>
          <Text style={tw.style('text-xs', active ? 'text-white' : 'text-gray-700')}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/30`} onPress={onClose}>
        <View style={tw`absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-4 border border-gray-100`}> 
          <View style={tw`h-1.5 w-10 bg-gray-300 self-center rounded-full mb-3`} />
          <Text style={tw`text-lg font-semibold text-gray-900 mb-2`}>Filters</Text>
          <ScrollView style={tw`max-h-96`}>
            <Text style={tw`text-gray-900 font-semibold mb-2`}>Training Goal</Text>
            <View style={tw`flex-row flex-wrap`}>
              {goals.map((g) => (
                <Pill key={g} label={g} value={g} current={local.goal} onPress={() => setLocal((p) => ({ ...p, goal: g }))} />
              ))}
            </View>
            <Text style={tw`text-gray-900 font-semibold my-2`}>Environment</Text>
            <View style={tw`flex-row flex-wrap`}>
              {envs.map((e) => (
                <Pill key={e} label={e} value={e} current={local.env} onPress={() => setLocal((p) => ({ ...p, env: e }))} />
              ))}
            </View>
            <Text style={tw`text-gray-900 font-semibold my-2`}>Difficulty</Text>
            <View style={tw`flex-row flex-wrap`}>
              {['All','Beginner','Intermediate','Advanced'].map((d) => (
                <Pill key={d} label={d} value={d} current={local.difficulty} onPress={() => setLocal((p) => ({ ...p, difficulty: d }))} />
              ))}
            </View>
          </ScrollView>
          <View style={tw`flex-row justify-between mt-3`}>
            <TouchableOpacity onPress={() => { onReset?.(); onClose(); }}>
              <View style={tw`px-4 py-3 rounded-2xl border border-gray-200`}>
                <Text style={tw`text-gray-800`}>Reset</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onChange(local); onClose(); }}>
              <View style={tw`px-6 py-3 rounded-2xl bg-blue-600`}>
                <Text style={tw`text-white font-semibold`}>Apply</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}


