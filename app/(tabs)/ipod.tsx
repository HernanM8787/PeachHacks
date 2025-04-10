import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextToSpeech } from '@/components/TextToSpeech';

export default function IPodScreen() {
  const router = useRouter();
  const songInfo = "Now playing Song Title by Artist Name";
  const testSpeech = "here is an example I am your host Peach!";

  return (
    <ThemedView style={styles.container}>
      {/* Test TTS Button - Moved above iPod */}
      <View style={styles.testContainer}>
        <ThemedText style={styles.testLabel}>Test Voice:</ThemedText>
        <TextToSpeech text={testSpeech} />
      </View>
      
      {/* iPod Body */}
      <View style={styles.ipodBody}>
        {/* Screen */}
        <View style={styles.screen}>
          <ThemedText style={styles.nowPlaying}>Now Playing</ThemedText>
          <ThemedText style={styles.songTitle}>Song Title</ThemedText>
          <ThemedText style={styles.artist}>Artist Name</ThemedText>
          
          {/* Album Art Placeholder */}
          <View style={styles.albumArt}>
            <ThemedText style={styles.albumArtText}>Album Art</ThemedText>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progress} />
            </View>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>0:00</ThemedText>
              <ThemedText style={styles.timeText}>3:45</ThemedText>
            </View>
          </View>

          {/* Text to Speech Button */}
          <TextToSpeech text={songInfo} />
        </View>

        {/* Click Wheel */}
        <View style={styles.clickWheel}>
          <View style={styles.clickWheelInner}>
            <View style={styles.clickWheelCenter} />
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <Pressable style={styles.controlButton}>
            <ThemedText style={styles.controlText}>⏮</ThemedText>
          </Pressable>
          <Pressable style={[styles.controlButton, styles.playButton]}>
            <ThemedText style={styles.controlText}>▶</ThemedText>
          </Pressable>
          <Pressable style={styles.controlButton}>
            <ThemedText style={styles.controlText}>⏭</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Menu Button */}
      <Pressable 
        style={styles.menuButton}
        onPress={() => router.back()}>
        <ThemedText style={styles.menuButtonText}>Menu</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  ipodBody: {
    width: '90%',
    aspectRatio: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 40,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 20,
  },
  screen: {
    width: '100%',
    height: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  nowPlaying: {
    fontSize: 12,
    color: '#666',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  albumArt: {
    width: '60%',
    aspectRatio: 1,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArtText: {
    color: '#666',
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#ddd',
    borderRadius: 1,
  },
  progress: {
    width: '30%',
    height: '100%',
    backgroundColor: '#666',
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontSize: 10,
    color: '#666',
  },
  clickWheel: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickWheelInner: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickWheelCenter: {
    width: '40%',
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#e0e0e0',
  },
  controlText: {
    fontSize: 16,
  },
  menuButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#666',
    borderRadius: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  testContainer: {
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
}); 