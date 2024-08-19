import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export default function Index() {
  const [imageUri, setImageUri] = useState("");
  const [labels, setLabels] = useState([]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
      console.log(result);
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const analyzeImage = async () => {
    try {
      if (!imageUri) {
        alert("Please select an image first.");
        return;
      }

      // Replace 'YOUR_GOOGLE_CLOUD_VISION_API_KEY' with your actual API key
      const apiKey = process.env.EXPO_PUBLIC_VISION_API_KEY;
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      // Read the image file from local URI and convert it to base64
      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
          },
        ],
      };

      const apiResponse = await axios.post(apiUrl, requestData);
      setLabels(apiResponse.data.responses[0].labelAnnotations);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image. Please try again later.");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />
      )}
      <TouchableOpacity onPress={pickImage}>
        <Text>Pick Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={analyzeImage}>
        <Text>Analyze Image</Text>
      </TouchableOpacity>
      {labels.length > 0 && (
        <View>
          <Text>Labels:</Text>
          {labels.map((label) => (
            <Text key={label.mid}>{label.description}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
