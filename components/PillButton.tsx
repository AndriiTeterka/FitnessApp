import { tw } from '@/utils/tw';
import React from 'react';
import { Button } from 'react-native-paper';

type PillButtonProps = {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined';
};

export default function PillButton({ label, onPress, mode = 'contained' }: PillButtonProps) {
  return (
    <Button mode={mode} onPress={onPress} style={tw`rounded-full`} contentStyle={tw`py-1 px-4`}>
      {label}
    </Button>
  );
}


