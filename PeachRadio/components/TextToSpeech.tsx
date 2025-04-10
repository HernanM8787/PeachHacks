import React, { useState, useRef } from 'react';
import { StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { textToSpeech, playAudio } from '@/services/elevenlabs';

interface TextToSpeechProps {
  text: string;
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handleSpeak = async () => {
    try {
      if (isSpeaking && soundRef.current) {
        await soundRef.current.stopAsync();
        setIsSpeaking(false);
        return;
      }

      setIsLoading(true);
      const audioUrl = await textToSpeech(text);
      const sound = await playAudio(audioUrl);
      soundRef.current = sound;
      
      sound.setOnPlaybackStatusUpdate(async (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        if (status.isLoaded && status.didJustFinish) {
          setIsSpeaking(false);
          setIsLoading(false);
        }
      });

      setIsSpeaking(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in text to speech:', error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isSpeaking && styles.buttonSpeaking
        ]}
        onPress={handleSpeak}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {isSpeaking ? 'Stop Speaking' : 'Speak Text'}
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonSpeaking: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 