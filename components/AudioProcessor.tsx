import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

interface AudioProcessorProps {
  audioData: string; // Base64 audio data
  onProcessedAudio: (processedAudioUri: string) => void;
}

export function AudioProcessor({ audioData, onProcessedAudio }: AudioProcessorProps) {
  const webViewRef = useRef<WebView>(null);

  // HTML and JavaScript for audio processing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Audio Processor</title>
      </head>
      <body>
        <script>
          // Create audio context
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          
          // Function to process audio
          async function processAudio(base64Audio) {
            try {
              // Convert base64 to ArrayBuffer
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              // Decode audio data
              const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
              
              // Create source
              const source = audioContext.createBufferSource();
              source.buffer = audioBuffer;
              
              // Create effects
              
              // 1. AM Radio simulation - extremely narrow bandwidth
              const amFilter = audioContext.createBiquadFilter();
              amFilter.type = 'bandpass';
              amFilter.frequency.value = 1000; // Center frequency
              amFilter.Q.value = 10; // Extremely narrow bandwidth
              
              // 2. Low-pass filter to simulate old radio
              const lowPass = audioContext.createBiquadFilter();
              lowPass.type = 'lowpass';
              lowPass.frequency.value = 1500; // Very low frequency cutoff
              lowPass.Q.value = 0.7; // More resonance
              
              // 3. High-pass filter to remove low frequencies
              const highPass = audioContext.createBiquadFilter();
              highPass.type = 'highpass';
              highPass.frequency.value = 400; // Remove more low frequencies
              
              // 4. Radio static noise generator - much louder
              const noiseBuffer = createNoiseBuffer();
              const noiseSource = audioContext.createBufferSource();
              noiseSource.buffer = noiseBuffer;
              noiseSource.loop = true;
              
              const noiseGain = audioContext.createGain();
              noiseGain.gain.value = 0.25; // Much more noticeable static
              
              // 5. Interference simulation (random frequency modulation) - more pronounced
              const interferenceOsc = audioContext.createOscillator();
              interferenceOsc.frequency.value = 0.8; // Faster modulation
              interferenceOsc.type = 'sine';
              
              const interferenceGain = audioContext.createGain();
              interferenceGain.gain.value = 0.2; // More interference
              
              // 6. Echo effect for old radio sound - more pronounced
              const delay = audioContext.createDelay();
              delay.delayTime.value = 0.15; // 150ms delay
              
              const feedback = audioContext.createGain();
              feedback.gain.value = 0.4; // More echo
              
              // 7. Distortion for "crunchy" old radio sound - more pronounced
              const distortion = audioContext.createWaveShaper();
              distortion.curve = makeDistortionCurve(60); // Much more distortion
              
              // 8. Compression to simulate old radio characteristics - more aggressive
              const compressor = audioContext.createDynamicsCompressor();
              compressor.threshold.value = -30;
              compressor.knee.value = 40;
              compressor.ratio.value = 20;
              compressor.attack.value = 0.002;
              compressor.release.value = 0.2;
              
              // 9. Sample rate reduction simulation - more aggressive
              const sampleRateReducer = audioContext.createScriptProcessor(1024, 1, 1);
              let lastSample = 0;
              
              sampleRateReducer.onaudioprocess = function(e) {
                const input = e.inputBuffer.getChannelData(0);
                const output = e.outputBuffer.getChannelData(0);
                
                // Much more aggressive downsampling
                for (let i = 0; i < output.length; i++) {
                  if (i % 4 === 0) { // Only keep every 4th sample
                    output[i] = input[i];
                  } else {
                    output[i] = lastSample;
                  }
                  lastSample = output[i];
                }
              };
              
              // 10. Occasional "dropout" effect - more frequent and pronounced
              const dropoutGain = audioContext.createGain();
              dropoutGain.gain.value = 1.0;
              
              // Create random dropouts - more frequent
              setInterval(() => {
                if (Math.random() < 0.15) { // 15% chance of dropout
                  dropoutGain.gain.setValueAtTime(0.05, audioContext.currentTime); // More severe dropout
                  dropoutGain.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 0.15); // Longer recovery
                }
              }, 300); // Check more frequently
              
              // 11. Add occasional "tuning" effect
              const tuningOsc = audioContext.createOscillator();
              tuningOsc.frequency.value = 0.2; // Very slow oscillation
              tuningOsc.type = 'sine';
              
              const tuningGain = audioContext.createGain();
              tuningGain.gain.value = 0.3;
              
              // 12. Add occasional "crackle" effect
              const crackleBuffer = createCrackleBuffer();
              const crackleSource = audioContext.createBufferSource();
              crackleSource.buffer = crackleBuffer;
              crackleSource.loop = true;
              
              const crackleGain = audioContext.createGain();
              crackleGain.gain.value = 0.2;
              
              // Connect nodes
              source.connect(highPass);
              highPass.connect(lowPass);
              lowPass.connect(amFilter);
              amFilter.connect(distortion);
              distortion.connect(delay);
              delay.connect(feedback);
              feedback.connect(delay); // Create feedback loop
              delay.connect(compressor);
              
              // Connect interference
              interferenceOsc.connect(interferenceGain);
              interferenceGain.connect(amFilter.frequency);
              
              // Connect tuning effect
              tuningOsc.connect(tuningGain);
              tuningGain.connect(amFilter.frequency);
              
              // Connect noise
              noiseSource.connect(noiseGain);
              noiseGain.connect(compressor);
              
              // Connect crackle
              crackleSource.connect(crackleGain);
              crackleGain.connect(compressor);
              
              // Connect dropout effect
              compressor.connect(dropoutGain);
              dropoutGain.connect(sampleRateReducer);
              
              // Final output
              sampleRateReducer.connect(audioContext.destination);
              
              // Start playback
              source.start(0);
              noiseSource.start(0);
              interferenceOsc.start(0);
              tuningOsc.start(0);
              crackleSource.start(0);
              
              // When audio finishes, send message back to React Native
              source.onended = function() {
                noiseSource.stop();
                interferenceOsc.stop();
                tuningOsc.stop();
                crackleSource.stop();
                window.ReactNativeWebView.postMessage('finished');
              };
            } catch (error) {
              window.ReactNativeWebView.postMessage('error: ' + error.message);
            }
          }
          
          // Helper function to create distortion curve
          function makeDistortionCurve(amount) {
            const k = typeof amount === 'number' ? amount : 50;
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            const deg = Math.PI / 180;
            
            for (let i = 0; i < n_samples; i++) {
              const x = (i * 2) / n_samples - 1;
              curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
            }
            
            return curve;
          }
          
          // Helper function to create noise buffer
          function createNoiseBuffer() {
            const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
              output[i] = Math.random() * 2 - 1; // Random values between -1 and 1
            }
            
            return noiseBuffer;
          }
          
          // Helper function to create crackle buffer
          function createCrackleBuffer() {
            const bufferSize = audioContext.sampleRate * 1; // 1 second of crackle
            const crackleBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = crackleBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
              // Create occasional sharp spikes for crackle effect
              if (Math.random() < 0.01) { // 1% chance of crackle
                output[i] = Math.random() * 2 - 1; // Random value
              } else {
                output[i] = 0; // Silence
              }
            }
            
            return crackleBuffer;
          }
          
          // Listen for messages from React Native
          document.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'processAudio') {
              processAudio(data.audioData);
            }
          });
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    // Send audio data to WebView for processing
    if (webViewRef.current && audioData) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'processAudio',
        audioData: audioData
      }));
    }
  }, [audioData]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    const message = event.nativeEvent.data;
    
    if (message === 'finished') {
      // Audio processing finished
      onProcessedAudio(audioData); // For now, just pass back the original audio
      // In a more complete implementation, we would capture the processed audio
    } else if (message.startsWith('error:')) {
      console.error('Audio processing error:', message.substring(6));
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  webview: {
    width: 0,
    height: 0,
  },
}); 