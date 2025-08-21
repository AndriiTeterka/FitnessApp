import { ThemedText } from '@/components/ThemedText';
import tw from '@/utils/tw';
import React from 'react';
import { View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

type BannerProps = {
  title: string;
  description: string;
  actionText?: string;
  onClose?: () => void;
  onAction?: () => void;
};

export default function Banner({ title, description, actionText = 'Learn more', onClose, onAction }: BannerProps) {
  return (
    <View style={tw`bg-black rounded-2xl p-4 mb-4`}> 
      <View style={tw`flex-row justify-between`}>
        <ThemedText variant="titleMedium" style={tw`text-white`}>{title}</ThemedText>
        <IconButton icon="close" size={18} onPress={onClose} iconColor="#fff" style={tw`-mr-2 -mt-2`} />
      </View>
      <ThemedText variant="bodyMedium" style={tw`text-gray-300 mt-1`}>{description}</ThemedText>
      <View style={tw`mt-3`}>
        <Button mode="outlined" onPress={onAction} textColor="#fff" style={tw`border-white/30`}>
          {actionText}
        </Button>
      </View>
    </View>
  );
}


