import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const EMOJIS = [
  '😂', '💀', '🔥', '💯', '👀', '😎', '🤣', '😭', '🤔', '👽',
  '💥', '⚡', '🌈', '✨', '💫', '🎯', '🏆', '👑', '💎', '🚀',
  '😈', '🤡', '👻', '💩', '🤮', '🥵', '🥶', '🤯', '😱', '🤤',
  '🍕', '🌮', '🍔', '🍩', '🍺', '🥂', '💊', '🧨', '🔫', '🗿',
  '🤖', '👾', '🎮', '🕹', '💣', '🎉', '🎊', '🎈', '🥳', '💅'
];

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [topText, setTopText] = useState('QUAND TU');
  const [bottomText, setBottomText] = useState('DEEP FRY UN MÈME');
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fry, setFry] = useState(60);
  const [saturation, setSaturation] = useState(55);
  const [contrast, setContrast] = useState(38);
  const [vignette, setVignette] = useState(12);
  const [smoke, setSmoke] = useState(10);
  const [rainbowText, setRainbowText] = useState(false);
  const [shakeText, setShakeText] = useState(true);
  const [stickerList, setStickerList] = useState([
    { id: 1, emoji: '🔥', x: 0.65, y: 0.35, size: 46 },
    { id: 2, emoji: '👀', x: 0.35, y: 0.65, size: 42 }
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const tileStyle = useMemo(() => ({
    backgroundColor: `rgba(255, 120, 30, ${fry / 100 * 0.55})`,
  }), [fry]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Vous devez autoriser l’accès à la galerie pour choisir une image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji,
      x: 0.5,
      y: 0.5,
      size: 46,
    };
    setStickerList((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const removeSticker = (id) => {
    setStickerList((prev) => prev.filter((sticker) => sticker.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const exportMeme = async () => {
    if (!previewRef.current) return;
    try {
      setIsExporting(true);
      const uri = await captureRef(previewRef, {
        format: 'png',
        quality: 1,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L’accès à la galerie est nécessaire pour enregistrer la création.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Succès', 'Votre mème a été enregistré dans la galerie.');
    } catch (error) {
      Alert.alert('Erreur', 'Le rendu ne s’est pas terminé correctement.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderSticker = (sticker) => {
    const isSelected = sticker.id === selectedStickerId;

    return (
      <Pressable
        key={sticker.id}
        onPress={() => setSelectedStickerId(sticker.id)}
        style={[
          styles.sticker,
          {
            left: `${sticker.x * 100}%`,
            top: `${sticker.y * 100}%`,
            width: sticker.size,
            height: sticker.size,
            borderWidth: isSelected ? 2 : 0,
            borderColor: '#ff5c00',
          },
        ]}
      >
        <Text style={{ fontSize: sticker.size * 0.8 }}>{sticker.emoji}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔥 DEEP-FRIED</Text>
          <Text style={styles.subtitle}>MÈME STUDIO</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image</Text>
          <Pressable style={styles.primaryButton} onPress={pickImage}>
            <Text style={styles.primaryButtonText}>Choisir une image</Text>
          </Pressable>
        </View>

        <View style={styles.previewSection}>
          <ViewShot ref={previewRef} style={styles.previewWrapper}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Aucune image</Text>
              </View>
            )}

            <View style={[styles.fryOverlay, tileStyle]} />
            <View style={[styles.darkOverlay, { opacity: vignette / 100 * 0.8 }]} />
            <View style={[styles.smokeOverlay, { opacity: smoke / 100 * 0.8 }]} />

            <Text
              style={[
                styles.textTop,
                {
                  color: rainbowText ? '#ff5c00' : textColor,
                  fontSize: fontSize,
                  transform: [{ translateY: shakeText ? -2 : 0 }],
                },
              ]}
            >
              {topText.toUpperCase()}
            </Text>

            <Text
              style={[
                styles.textBottom,
                {
                  color: rainbowText ? '#00eaff' : textColor,
                  fontSize: fontSize,
                  transform: [{ translateY: shakeText ? 2 : 0 }],
                },
              ]}
            >
              {bottomText.toUpperCase()}
            </Text>

            {stickerList.map(renderSticker)}
          </ViewShot>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deep fry</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Cuisson</Text>
            <Text style={styles.sliderValue}>{fry}%</Text>
          </View>
          <Slider value={fry} onValueChange={setFry} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#343434" />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Saturation</Text>
            <Text style={styles.sliderValue}>{saturation}%</Text>
          </View>
          <Slider value={saturation} onValueChange={setSaturation} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#343434" />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Contraste</Text>
            <Text style={styles.sliderValue}>{contrast}%</Text>
          </View>
          <Slider value={contrast} onValueChange={setContrast} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#343434" />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Vignette</Text>
            <Text style={styles.sliderValue}>{vignette}%</Text>
          </View>
          <Slider value={vignette} onValueChange={setVignette} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#343434" />

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Fumée</Text>
            <Text style={styles.sliderValue}>{smoke}%</Text>
          </View>
          <Slider value={smoke} onValueChange={setSmoke} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#343434" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Texte</Text>
          <Text style={styles.inputLabel}>Texte haut</Text>
          <TextInput
            value={topText}
            onChangeText={setTopText}
            placeholder="Texte du haut"
            placeholderTextColor="#767676"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Texte bas</Text>
          <TextInput
            value={bottomText}
            onChangeText={setBottomText}
            placeholder="Texte du bas"
            placeholderTextColor="#767676"
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.halfCell}>
              <Text style={styles.inputLabel}>Taille</Text>
              <TextInput
                value={String(fontSize)}
                onChangeText={(value) => setFontSize(Number(value) || 18)}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.halfCell}>
              <Text style={styles.inputLabel}>Couleur</Text>
              <View style={styles.colorRow}>
                {['#ffffff', '#ffd60a', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'].map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setTextColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color, borderWidth: textColor === color ? 3 : 0, borderColor: '#fff' },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <Pressable onPress={() => setRainbowText((prev) => !prev)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{rainbowText ? '🌈 Rainbow ON' : '🌈 Rainbow OFF'}</Text>
            </Pressable>
            <Pressable onPress={() => setShakeText((prev) => !prev)} style={styles.toggleButton}>
              <Text style={styles.toggleText}>{shakeText ? '💥 Tremble ON' : '💥 Tremble OFF'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stickers</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((emoji) => (
              <Pressable key={emoji} onPress={() => addSticker(emoji)} style={styles.emojiButton}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>

          {stickerList.length > 0 && (
            <View style={styles.stickerBar}>
              {stickerList.map((sticker) => (
                <Pressable
                  key={`bar-${sticker.id}`}
                  onPress={() => setSelectedStickerId(sticker.id)}
                  onLongPress={() => removeSticker(sticker.id)}
                  style={[styles.stickerChip, selectedStickerId === sticker.id && styles.stickerChipSelected]}
                >
                  <Text>{sticker.emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Pressable style={styles.primaryButton} onPress={exportMeme} disabled={isExporting}>
            <Text style={styles.primaryButtonText}>{isExporting ? 'Enregistrement...' : 'Exporter le mème'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#0d0d0d',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ff5c00',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#f2f2f2',
    letterSpacing: 5,
    opacity: 0.8,
  },
  section: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
  },
  sectionTitle: {
    color: '#ff5c00',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  primaryButton: {
    backgroundColor: '#ff5c00',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewSection: {
    backgroundColor: '#111',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b2b2b',
  },
  previewWrapper: {
    width: '100%',
    height: 420,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 18,
  },
  fryOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  smokeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d9d9d9',
    opacity: 0.18,
  },
  textTop: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.2,
  },
  textBottom: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1.2,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#f0f0f0',
    fontSize: 14,
    fontWeight: '600',
  },
  sliderValue: {
    color: '#ff5c00',
    fontWeight: '900',
  },
  inputLabel: {
    color: '#a8a8a8',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f5f5f5',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfCell: {
    flex: 1,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#202020',
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emojiText: {
    fontSize: 24,
  },
  stickerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  stickerChip: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  stickerChipSelected: {
    borderColor: '#ff5c00',
    backgroundColor: '#2b190f',
  },
  sticker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
});
