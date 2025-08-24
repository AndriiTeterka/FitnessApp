import { ThemedText } from '@/components/ThemedText';
import { tw } from '@/utils/tw';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

type Props = { isActive: boolean; onPermissionChange?: (b: boolean) => void };

export function CameraView({ isActive, onPermissionChange }: Props) {
  const camRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      try {
        if (!permission) {
          const p = await requestPermission();
          const grantedNow = !!p?.granted;
          setHasPermission(grantedNow);
          onPermissionChange?.(grantedNow);
        } else {
          const granted = !!permission.granted;
          setHasPermission(granted);
          onPermissionChange?.(granted);
        }
      } catch {
        setHasPermission(false);
        onPermissionChange?.(false);
      }
    })();
  }, [permission, requestPermission, onPermissionChange]);

  if (hasPermission === false) {
    return (
      <View style={tw`bg-[#1f2937] rounded-lg items-center justify-center h-60`}>
        <ThemedText variant="bodyMedium" style={tw`text-gray-400`}>Camera permission is required</ThemedText>
      </View>
    );
  }

  return (
    <View style={tw`relative rounded-lg overflow-hidden h-60`}>
      {isActive ? (
        <ExpoCameraView ref={camRef} style={tw`w-full h-full`} facing={'front'} />
      ) : (
        <View style={tw`bg-[#1f2937] w-full h-full items-center justify-center`}>
          <ThemedText variant="bodySmall" style={tw`text-gray-400`}>Click &quot;Start Tracking&quot; to activate the camera</ThemedText>
        </View>
      )}
    </View>
  );
}


