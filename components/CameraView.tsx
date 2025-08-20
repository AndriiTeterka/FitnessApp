import { tw } from '@/utils/tw';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

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
      <View style={tw`bg-gray-100 rounded-lg items-center justify-center h-60`}>
        <Text style={tw`text-gray-500`}>Camera permission is required</Text>
      </View>
    );
  }

  return (
    <View style={tw`relative rounded-lg overflow-hidden h-60`}>
      {isActive ? (
        <ExpoCameraView ref={camRef} style={tw`w-full h-full`} facing={'front'} />
      ) : (
        <View style={tw`bg-gray-100 w-full h-full items-center justify-center`}>
          <Text style={tw`text-sm text-gray-500`}>Click "Start Tracking" to activate the camera</Text>
        </View>
      )}
    </View>
  );
}


