import React from "react";
import { View } from "react-native";

import ImageAnalyzer from "@/components/ImageAnalyzer";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ImageAnalyzer />
    </View>
  );
}
