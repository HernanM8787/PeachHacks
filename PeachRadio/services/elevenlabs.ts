import { Audio } from 'expo-av';

const ELEVENLABS_API_KEY = 'YOUR_API_KEY'; // You'll need to replace this with your actual API key
const VOICE_ID = 'YOUR_VOICE_ID'; // You'll need to replace this with your preferred voice ID

export async function textToSpeech(text: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

export async function playAudio(audioUrl: string) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: true }
    );
    return sound;
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
} 