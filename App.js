import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  Alert,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EMOJIS = [
  '😂', '💀', '🔥', '💯', '👀', '😎', '🤣', '😭', '🤔', '👽',
  '💥', '⚡', '🌈', '✨', '💫', '🎯', '🏆', '👑', '💎', '🚀',
  '😈', '🤡', '👻', '💩', '🤮', '🥵', '🥶', '🤯', '😱', '🤤',
  '🍕', '🌮', '🍔', '🍩', '🍺', '🥂', '💊', '🧨', '🔫', '🗿',
  '🤖', '👾', '🎮', '🕹', '💣', '🎉', '🎊', '🎈', '🥳', '💅'
];

const DraggableSticker = ({ sticker, isSelected, onPress, onMove }) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isSelected,
      onMoveShouldSetPanResponder: () => isSelected,
      onPanResponderMove: (evt, gestureState) => {
        onMove(sticker.id, gestureState.dx, gestureState.dy);
      },
    })
  ).current;

  return (
    <Pressable
      onPress={onPress}
      {...panResponder.panHandlers}
      style={[
        styles.draggableSticker,
        {
          left: `${sticker.x * 100}%`,
          top: `${sticker.y * 100}%`,
          width: sticker.size,
          height: sticker.size,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? '#ff5c00' : 'transparent',
          backgroundColor: isSelected ? 'rgba(255,92,0,0.2)' : 'transparent',
          shadowColor: isSelected ? '#ff5c00' : '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isSelected ? 0.8 : 0.3,
          shadowRadius: isSelected ? 12 : 4,
          elevation: isSelected ? 8 : 2,
        },
      ]}
    >
      <Text style={{ fontSize: sticker.size * 0.7, fontWeight: '900' }}>
        {sticker.emoji}
      </Text>
    </Pressable>
  );
};

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [topText, setTopText] = useState('QUAND TU');
  const [bottomText, setBottomText] = useState('DEEP FRY UN MÈME');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fry, setFry] = useState(70);
  const [saturation, setSaturation] = useState(65);
  const [contrast, setContrast] = useState(45);
  const [vignette, setVignette] = useState(20);
  const [smoke, setSmoke] = useState(15);
  const [jpegArtifacts, setJpegArtifacts] = useState(true);
  const [chromatic, setChromatic] = useState(true);
  const [rainbowText, setRainbowText] = useState(false);
  const [shakeText, setShakeText] = useState(true);
  const [stickerList, setStickerList] = useState([
    { id: 1, emoji: '🔥', x: 0.65, y: 0.35, size: 56 },
    { id: 2, emoji: '👀', x: 0.35, y: 0.65, size: 52 }
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('image');
  const previewRef = useRef(null);
  const [stickerDragOffset, setStickerDragOffset] = useState({ dx: 0, dy: 0 });

  const previewWidth = screenWidth - 32;
  const previewHeight = previewWidth;

  const tileStyle = useMemo(() => ({
    backgroundColor: `rgba(255, ${100 - fry * 0.4}, ${50 - fry * 0.3}, ${fry / 100 * 0.6})`,
  }), [fry]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie pour choisir une image.');
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
      x: 0.4 + Math.random() * 0.2,
      y: 0.4 + Math.random() * 0.2,
      size: 48 + Math.random() * 20,
    };
    setStickerList((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateStickerPosition = useCallback((id, dx, dy) => {
    setStickerList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              x: Math.max(0, Math.min(1, s.x + dx / previewWidth)),
              y: Math.max(0, Math.min(1, s.y + dy / previewHeight)),
            }
          : s
      )
    );
  }, [previewWidth, previewHeight]);

  const removeSticker = (id) => {
    setStickerList((prev) => prev.filter((sticker) => sticker.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(stickerList.find(s => s.id !== id)?.id || null);
    }
  };

  const clearAllStickers = () => {
    setStickerList([]);
    setSelectedStickerId(null);
  };

  const exportMeme = async () => {
    if (!previewRef.current) return;
    try {
      setIsExporting(true);
      const uri = await captureRef(previewRef, {
        format: 'png',
        quality: 1,
        height: previewHeight * 2,
        width: previewWidth * 2,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire pour enregistrer la création.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('🔥 Succès !', 'Votre mème crispy a été enregistré dans la galerie.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Le rendu ne s\'est pas terminé correctement.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderSection = (title, content, sectionKey, emoji) => (
    <View style={styles.section}>
      <Pressable
        style={styles.sectionHeader}
        onPress={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
      >
        <Text style={styles.sectionTitle}>
          {emoji} {title.toUpperCase()}
        </Text>
        <Text style={[styles.arrow, { transform: [{ rotate: expandedSection === sectionKey ? '180deg' : '0deg' }] }]}>
          ▼
        </Text>
      </Pressable>
      {expandedSection === sectionKey && (
        <View style={styles.sectionContent}>
          {content}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#0d0d0d" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🔥 DEEP-FRIED</Text>
          <Text style={styles.subtitle}>MÈME STUDIO PREMIUM</Text>
        </View>

        {/* PREVIEW */}
        <View style={styles.previewSection}>
          <ViewShot
            ref={previewRef}
            style={[styles.previewWrapper, { width: previewWidth, height: previewHeight }]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Charge une image</Text>
              </View>
            )}

            {/* Overlays d'effets */}
            <View style={[styles.fryOverlay, tileStyle]} />
            <View style={[styles.darkOverlay, { opacity: vignette / 100 * 0.7 }]} />
            <View
              style={[
                styles.smokeOverlay,
                {
                  opacity: smoke / 100 * 0.5,
                  backgroundColor: `rgba(200, 180, 160, ${smoke / 100 * 0.4})`,
                },
              ]}
            />
            <View style={[styles.chromaShift, { opacity: chromatic ? 0.15 : 0 }]} />

            {/* Textes mème */}
            <Text
              style={[
                styles.textTop,
                {
                  color: rainbowText ? '#ff00ff' : textColor,
                  fontSize: fontSize,
                  transform: [{ translateY: shakeText ? Math.sin(Date.now() / 100) * 2 : 0 }],
                  textShadowColor: '#000',
                  textShadowOffset: { width: 3, height: 3 },
                  textShadowRadius: 8,
                },
              ]}
            >
              {topText.toUpperCase()}
            </Text>

            <Text
              style={[
                styles.textBottom,
                {
                  color: rainbowText ? '#00ffff' : textColor,
                  fontSize: fontSize,
                  transform: [{ translateY: shakeText ? -Math.sin(Date.now() / 100) * 2 : 0 }],
                  textShadowColor: '#000',
                  textShadowOffset: { width: 3, height: 3 },
                  textShadowRadius: 8,
                },
              ]}
            >
              {bottomText.toUpperCase()}
            </Text>

            {/* Stickers */}
            {stickerList.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                isSelected={sticker.id === selectedStickerId}
                onPress={() => setSelectedStickerId(sticker.id)}
                onMove={updateStickerPosition}
              />
            ))}
          </ViewShot>
        </View>

        {/* IMAGE SECTION */}
        {renderSection('Image', (
          <Pressable style={styles.primaryButton} onPress={pickImage}>
            <Text style={styles.primaryButtonText}>📁 Choisir une image</Text>
          </Pressable>
        ), 'image', '🖼️')}

        {/* DEEP FRY SECTION */}
        {renderSection('Deep Fry', (
          <View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Cuisson</Text>
              <Text style={styles.sliderValue}>{Math.round(fry)}%</Text>
            </View>
            <Slider
              value={fry}
              onValueChange={setFry}
              minimumValue={0}
              maximumValue={100}
              step={1}
              thumbTintColor="#ff5c00"
              minimumTrackTintColor="#ff5c00"
              maximumTrackTintColor="#343434"
              style={styles.slider}
            />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Saturation</Text>
              <Text style={styles.sliderValue}>{Math.round(saturation)}%</Text>
            </View>
            <Slider
              value={saturation}
              onValueChange={setSaturation}
              minimumValue={0}
              maximumValue={150}
              step={1}
              thumbTintColor="#ff5c00"
              minimumTrackTintColor="#ff5c00"
              maximumTrackTintColor="#343434"
              style={styles.slider}
            />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Contraste</Text>
              <Text style={styles.sliderValue}>{Math.round(contrast)}%</Text>
            </View>
            <Slider
              value={contrast}
              onValueChange={setContrast}
              minimumValue={0}
              maximumValue={150}
              step={1}
              thumbTintColor="#ff5c00"
              minimumTrackTintColor="#ff5c00"
              maximumTrackTintColor="#343434"
              style={styles.slider}
            />

            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleButton, jpegArtifacts && styles.toggleButtonActive]}
                onPress={() => setJpegArtifacts(!jpegArtifacts)}
              >
                <Text style={styles.toggleText}>
                  {jpegArtifacts ? '✓' : '○'} Artefacts JPEG
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, chromatic && styles.toggleButtonActive]}
                onPress={() => setChromatic(!chromatic)}
              >
                <Text style={styles.toggleText}>
                  {chromatic ? '✓' : '○'} Chromatic
                </Text>
              </Pressable>
            </View>
          </View>
        ), 'fry', '🍟')}

        {/* EFFETS VISUELS SECTION */}
        {renderSection('Effets visuels', (
          <View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Vignette</Text>
              <Text style={styles.sliderValue}>{Math.round(vignette)}%</Text>
            </View>
            <Slider
              value={vignette}
              onValueChange={setVignette}
              minimumValue={0}
              maximumValue={100}
              step={1}
              thumbTintColor="#ff5c00"
              minimumTrackTintColor="#ff5c00"
              maximumTrackTintColor="#343434"
              style={styles.slider}
            />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Fumée</Text>
              <Text style={styles.sliderValue}>{Math.round(smoke)}%</Text>
            </View>
            <Slider
              value={smoke}
              onValueChange={setSmoke}
              minimumValue={0}
              maximumValue={100}
              step={1}
              thumbTintColor="#ff5c00"
              minimumTrackTintColor="#ff5c00"
              maximumTrackTintColor="#343434"
              style={styles.slider}
            />
          </View>
        ), 'effects', '✨')}

        {/* TEXTE SECTION */}
        {renderSection('Texte mème', (
          <View>
            <Text style={styles.inputLabel}>Texte haut</Text>
            <TextInput
              value={topText}
              onChangeText={setTopText}
              placeholder="Texte du haut"
              placeholderTextColor="#767676"
              style={styles.input}
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Texte bas</Text>
            <TextInput
              value={bottomText}
              onChangeText={setBottomText}
              placeholder="Texte du bas"
              placeholderTextColor="#767676"
              style={styles.input}
              maxLength={50}
            />

            <View style={styles.row}>
              <View style={styles.halfCell}>
                <Text style={styles.inputLabel}>Taille</Text>
                <TextInput
                  value={String(fontSize)}
                  onChangeText={(value) => setFontSize(Math.max(12, Math.min(60, Number(value) || 28)))}
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
                        {
                          backgroundColor: color,
                          borderWidth: textColor === color ? 3 : 1,
                          borderColor: textColor === color ? '#fff' : '#444',
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleButton, rainbowText && styles.toggleButtonActive]}
                onPress={() => setRainbowText(!rainbowText)}
              >
                <Text style={styles.toggleText}>{rainbowText ? '✓' : '○'} 🌈 Rainbow</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, shakeText && styles.toggleButtonActive]}
                onPress={() => setShakeText(!shakeText)}
              >
                <Text style={styles.toggleText}>{shakeText ? '✓' : '○'} 💥 Tremble</Text>
              </Pressable>
            </View>
          </View>
        ), 'text', '💬')}

        {/* STICKERS SECTION */}
        {renderSection('Stickers emoji', (
          <View>
            <Text style={styles.hint}>Touche un emoji pour l\'ajouter, puis glisse-le sur la preview</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => addSticker(emoji)}
                  style={styles.emojiButton}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            {stickerList.length > 0 && (
              <>
                <Text style={styles.inputLabel} style={{ marginTop: 12 }}>Stickers posés</Text>
                <View style={styles.stickerBar}>
                  {stickerList.map((sticker) => (
                    <Pressable
                      key={`bar-${sticker.id}`}
                      onPress={() => setSelectedStickerId(sticker.id)}
                      onLongPress={() => removeSticker(sticker.id)}
                      style={[
                        styles.stickerChip,
                        selectedStickerId === sticker.id && styles.stickerChipSelected,
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>{sticker.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.secondaryButton} onPress={clearAllStickers}>
                  <Text style={styles.secondaryButtonText}>🗑 Effacer tous les stickers</Text>
                </Pressable>
              </>
            )}
          </View>
        ), 'stickers', '😎')}

        {/* EXPORT SECTION */}
        {renderSection('Export', (
          <Pressable
            style={[styles.primaryButton, isExporting && styles.disabledButton]}
            onPress={exportMeme}
            disabled={isExporting}
          >
            <Text style={styles.primaryButtonText}>
              {isExporting ? '⏳ ENREGISTREMENT...' : '💾 EXPORTER LE MÈME'}
            </Text>
          </Pressable>
        ), 'export', '💾')}
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#0d0d0d',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ff5c00',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#f2f2f2',
    letterSpacing: 4,
    opacity: 0.7,
    marginTop: 4,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  previewWrapper: {
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ff5c00',
    shadowColor: '#ff5c00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  fryOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  smokeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  chromaShift: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff00ff',
  },
  draggableSticker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  textTop: {
    position: 'absolute',
    top: 24,
    left: 12,
    right: 12,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  textBottom: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  section: {
    backgroundColor: '#111',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#151515',
  },
  sectionTitle: {
    color: '#ff5c00',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrow: {
    color: '#666',
    fontSize: 12,
    transition: 'transform 0.25s',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
  },
  sliderValue: {
    color: '#ff5c00',
    fontWeight: '900',
    fontSize: 12,
  },
  slider: {
    height: 32,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#a8a8a8',
    fontSize: 11,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
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
    gap: 6,
    marginTop: 4,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  toggleButton: {
    flex: 1,
    minWidth: '48%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    borderWidth: 1.5,
    borderColor: '#2d2d2d',
    alignItems: 'center',
  },
  toggleButtonActive: {
    borderColor: '#ff5c00',
    backgroundColor: '#2b190f',
  },
  toggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: 'linear-gradient(135deg, #ff5c00, #ff0050)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#ff5c00',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiButton: {
    width: '20%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 4,
  },
  emojiText: {
    fontSize: 26,
  },
  stickerBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  stickerChip: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2d2d2d',
  },
  stickerChipSelected: {
    borderColor: '#ff5c00',
    backgroundColor: '#2b190f',
    shadowColor: '#ff5c00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
});
