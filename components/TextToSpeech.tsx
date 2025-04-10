import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { Audio } from 'expo-av';
import { ELEVENLABS_API_KEY } from '../constants/Config';
import * as FileSystem from 'expo-file-system';
import { AudioProcessor } from './AudioProcessor';

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);

  const generateSpeech = async () => {
    if (isPlaying && sound) {
      // Stop the current sound if it's playing
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a temporary file URI for saving
      const fileUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.mp3`;
      
      // ElevenLabs API endpoint with custom voice ID
      const url = 'https://api.elevenlabs.io/v1/text-to-speech/Jw18Gw14Xf0XCznOPKkl';
      
      // Request body
      const requestBody = {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.35
        }
      };
      
      // Make the API request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Get the audio data as an array buffer
      const audioData = await response.arrayBuffer();

      // Convert to base64
      const base64Audio = arrayBufferToBase64(audioData);
      
      // Set the audio data for processing
      setAudioData(base64Audio);

      // Write the audio data to a file
      await FileSystem.writeAsStringAsync(
        fileUri,
        base64Audio,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      // Set up the onPlaybackStatusUpdate callback
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Audio has finished playing
          setIsPlaying(false);
          await newSound.unloadAsync();
          setSound(null);
          
          // Clean up the temporary file
          try {
            await FileSystem.deleteAsync(fileUri);
          } catch (error) {
            console.error('Error cleaning up audio file:', error);
          }
        }
      });
      
    } catch (error) {
      console.error('Error in text to speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessedAudio = (processedAudioUri: string) => {
    console.log('Audio processed with 2000s effects');
    // In a more complete implementation, we would play the processed audio here
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.button, isPlaying && styles.buttonPlaying]} 
        onPress={generateSpeech}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {isPlaying ? 'Stop' : 'Play'}
          </ThemedText>
        )}
      </Pressable>
      
      {/* Audio Processor (hidden) */}
      {audioData && (
        <AudioProcessor 
          audioData={audioData} 
          onProcessedAudio={handleProcessedAudio} 
        />
      )}
    </View>
  );
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonPlaying: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 