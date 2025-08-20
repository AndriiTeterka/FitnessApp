import { CameraView } from '@/components/CameraView';
import tw from '@/lib/tw';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Capture() {
  const [isCapturing, setIsCapturing] = useState(false);
  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`px-6 py-6`}>
        <Text style={tw`text-2xl font-extrabold text-gray-900 text-center mb-2`}>Motion Capture</Text>
        <Text style={tw`text-gray-600 text-center text-base leading-5`}>
          Position yourself in view of the camera and follow the exercise instructions.
        </Text>
      </View>

      {/* Camera Container */}
      <View style={tw`mx-4 mb-6`}>
        <View style={tw`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100`}>
          <View style={tw`relative`}>
            <CameraView isActive={isCapturing} />
            {/* Floating control */}
            <View style={tw`absolute left-0 right-0 bottom-3 px-4`}>
              <TouchableOpacity
                onPress={() => setIsCapturing((v) => !v)}
                style={tw.style(
                  `rounded-full py-3 items-center mx-auto w-60`,
                  isCapturing ? `bg-red-600` : `bg-blue-600`
                )}
                activeOpacity={0.9}
              >
                <Text style={tw`text-white font-bold`}>
                  {isCapturing ? 'Stop Tracking' : 'Start Tracking'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={tw`mx-4`}>
        <View style={tw`bg-blue-50 rounded-2xl p-4 border border-blue-100`}>
          <Text style={tw`text-blue-900 font-semibold text-center mb-2`}>💡 Tips for Best Results</Text>
          <View style={tw`gap-2`}>
            <Text style={tw`text-blue-800 text-sm`}>• Ensure good lighting in your space</Text>
            <Text style={tw`text-blue-800 text-sm`}>• Stand 6-8 feet from the camera</Text>
            <Text style={tw`text-blue-800 text-sm`}>• Wear form-fitting clothing</Text>
            <Text style={tw`text-blue-800 text-sm`}>• Keep your full body in view</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

