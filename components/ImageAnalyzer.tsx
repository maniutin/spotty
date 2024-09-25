import React, { useState } from "react";
import { Buffer } from "buffer";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export default function ImageAnalyzer() {
  const [imageUri, setImageUri] = useState("");
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");

  let token: string;
  // get spotify token
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "b9ea31627fce4ea38ea844bde051c161",
        client_secret: "d6b83b8b3b7e4ad4a94a8268979c55a4",
      })
    )
    .then(function (response) {
      // handle success
      console.log(response.data);
      token = response.data.access_token;
      axios
        .get(
          `https://api.spotify.com/v1/search?q=${artist} ${title}&type=album`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) =>
          console.log("==== FIND: ", res.data.albums.items[0].external_urls)
        );
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });

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
            features: [{ type: "WEB_DETECTION", maxResults: 5 }],
          },
        ],
      };

      const apiResponse = await axios.post(apiUrl, requestData);

      setArtist(
        apiResponse.data.responses[0].webDetection.webEntities[0].description
      );
      setTitle(
        apiResponse.data.responses[0].webDetection.webEntities[1].description
      );
      console.log(
        "=====",
        JSON.stringify(apiResponse.data.responses[0].webDetection.webEntities)
      );
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Select an image from Library and click "Analyze Image"
      </Text>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />
      )}
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.text}>Pick Image</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={analyzeImage} style={styles.button}>
        <Text style={styles.text}>Analyze Image</Text>
      </TouchableOpacity>
      {(artist || title) && (
        <Text style={styles.label}>{`${artist} ${title}`}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 50,
    marginTop: 100,
  },
  button: {
    backgroundColor: "#dddddd",
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
});
