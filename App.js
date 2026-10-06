import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import ViewShot, { captureRef } from 'react-native-view-shot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_WIDTH - 32;

const STICKER_SET = [
  '😂', '💀', '🔥', '💯', '👀', '😎', '🤣', '😭', '🤔', '👽',
  '💥', '⚡', '🌈', '✨', '💫', '🎯', '🏆', '👑', '💎', '🚀',
  '😈', '🤡', '👻', '💩', '🤮', '🥵', '🥶', '🤯', '😱', '🤤',
  '🍕', '🌮', '🍔', '🍩', '🍺', '🥂', '💊', '🧨', '🔫', '🗿',
  '🤖', '👾', '🎮', '🕹', '💣', '🎉', '🎊', '🎈', '🥳', '💅',
];

const TEXT_COLORS = ['#ffffff', '#ffd60a', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];

const DraggableSticker = ({ sticker, isSelected, onPress, onMove, onLongPress }) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => onPress(),
      onPanResponderMove: (_, gesture) => {
        onMove(sticker.id, gesture.dx, gesture.dy);
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      {...panResponder.panHandlers}
      style={[
        styles.sticker,
        {
          left: sticker.x * PREVIEW_SIZE,
          top: sticker.y * PREVIEW_SIZE,
          width: sticker.size,
          height: sticker.size,
          borderColor: isSelected ? '#ff5c00' : 'transparent',
          borderWidth: isSelected ? 2 : 0,
          backgroundColor: isSelected ? 'rgba(255, 92, 0, 0.15)' : 'transparent',
          shadowColor: isSelected ? '#ff5c00' : '#000',
          shadowOpacity: isSelected ? 0.8 : 0.15,
          shadowRadius: isSelected ? 14 : 6,
        },
      ]}
    >
      <Text style={{ fontSize: sticker.size * 0.7 }}>{sticker.emoji}</Text>
    </Pressable>
  );
};

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [expanded, setExpanded] = useState('image');
  const [topText, setTopText] = useState('QUAND TU');
  const [bottomText, setBottomText] = useState('DEEP FRY UN MÈME');
  const [fontSize, setFontSize] = useState(30);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fry, setFry] = useState(68);
  const [saturation, setSaturation] = useState(70);
  const [contrast, setContrast] = useState(60);
  const [vignette, setVignette] = useState(18);
  const [smoke, setSmoke] = useState(12);
  const [jpegArtifacts, setJpegArtifacts] = useState(true);
  const [chromatic, setChromatic] = useState(true);
  const [rainbowText, setRainbowText] = useState(false);
  const [shakeText, setShakeText] = useState(true);
  const [stickerList, setStickerList] = useState([
    { id: 1, emoji: '🔥', x: 0.68, y: 0.28, size: 56 },
    { id: 2, emoji: '👀', x: 0.28, y: 0.66, size: 52 },
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordStatus, setRecordStatus] = useState('');

  const previewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      Animated.spring(pulseAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 260, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.98, duration: 260, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 260, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      ])
    ).start();
  }, [isRecording]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'Autorisez l'accès à la galerie pour choisir une image.');
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
        setExpanded('fry');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger l'image.');
      console.error(error);
    }
  };

  const addSticker = (emoji) => {
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji,
      x: 0.52 + (Math.random() - 0.5) * 0.26,
      y: 0.52 + (Math.random() - 0.5) * 0.26,
      size: 54 + Math.random() * 22,
    };
    setStickerList((current) => [...current, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const removeSticker = (id) => {
    setStickerList((current) => current.filter((sticker) => sticker.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const clearStickers = () => {
    setStickerList([]);
    setSelectedStickerId(null);
  };

  const updateStickerPosition = (id, dx, dy) => {
    setStickerList((current) =>
      current.map((sticker) => {
        if (sticker.id !== id) return sticker;
        return {
          ...sticker,
          x: Math.min(0.92, Math.max(0.08, sticker.x + dx / PREVIEW_SIZE)),
          y: Math.min(0.92, Math.max(0.08, sticker.y + dy / PREVIEW_SIZE)),
        };
      })
    );
  };

  const renderSection = (sectionId, label, emoji, content) => (
    <View style={styles.section} key={sectionId}>
      <Pressable style={styles.sectionHeader} onPress={() => setExpanded((current) => (current === sectionId ? '' : sectionId))}>
        <Text style={styles.sectionTitle}>{emoji} {label}</Text>
        <Text style={[styles.chevron, { transform: [{ rotate: expanded === sectionId ? '180deg' : '0deg' }] }]}>▼</Text>
      </Pressable>
      {expanded === sectionId ? <View style={styles.sectionBody}>{content}</View> : null}
    </View>
  );

  const exportPNG = async () => {
    if (!previewRef.current) {
      Alert.alert('Aucune image', 'Charge une image avant d'exporter.');
      return;
    }

    setIsExporting(true);
    try {
      const uri = await captureRef(previewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l'accès à la galerie.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('✅ Succès', 'Votre mème a été enregistré dans la galerie.');
      setExpanded('export');
    } catch (error) {
      Alert.alert('Erreur', 'L'export PNG n'a pas fonctionné.');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const recordFrameSequence = async () => {
    if (!previewRef.current) {
      Alert.alert('Aucune image', 'Charge une image avant d'enregistrer.');
      return;
    }

    setIsRecording(true);
    setRecordStatus('Capture en cours...');

    try {
      const frameCount = 18;
      const frameURIs = [];
      const frameDelay = 80;

      for (let i = 0; i < frameCount; i += 1) {
        const uri = await captureRef(previewRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });
        frameURIs.push(uri);
        setRecordStatus(`Capture ${i + 1}/${frameCount}...`);
        await new Promise((resolve) => setTimeout(resolve, frameDelay));
      }

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Permission refusée');
      }

      for (let i = 0; i < frameURIs.length; i += 1) {
        await MediaLibrary.saveToLibraryAsync(frameURIs[i]);
      }

      Alert.alert(
        '🎬 Animation enregistrée',
        `${frameCount} images sauvegardées dans la galerie. Utilisez une app comme "GIF Maker" ou "Stop Motion Studio" pour créer une vidéo animée.`
      );
      setRecordStatus('');
    } catch (error) {
      Alert.alert('Erreur', 'L'enregistrement n'a pas fonctionné.');
      console.error(error);
      setRecordStatus('');
    } finally {
      setIsRecording(false);
    }
  };

  const previewOverlayStyle = useMemo(
    () => ({
      opacity: 0.44 + fry / 220,
      backgroundColor: `rgba(${Math.round(255 - fry * 0.6)}, ${Math.round(90 - fry * 0.4)}, ${Math.round(20 + fry * 0.1)}, 1)`,
    }),
    [fry]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>🔥 DEEP-FRIED</Text>
          <Text style={styles.subtitle}>MÈME STUDIO PREMIUM</Text>
        </View>

        <Animated.View style={[styles.previewWrap, { transform: [{ scale: pulseAnim }] }]}>
          <ViewShot ref={previewRef} style={styles.previewCanvas} options={{ format: 'png', quality: 1 }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Charge une image</Text>
              </View>
            )}

            <View style={[styles.fryOverlay, previewOverlayStyle]} />
            <View style={[styles.vignette, { opacity: vignette / 100 }]} />
            <View style={[styles.smoke, { opacity: smoke / 100 }]} />
            {chromatic ? <View style={styles.chromatic} /> : null}

            <Text
              style={[
                styles.memeText,
                styles.topText,
                {
                  color: rainbowText ? '#ff00ff' : textColor,
                  fontSize,
                  textShadowColor: '#000',
                  textShadowOffset: { width: 3, height: 3 },
                  textShadowRadius: 8,
                  transform: [{ translateY: shakeText && isRecording ? 3 : 0 }],
                },
              ]}
            >
              {topText.toUpperCase()}
            </Text>

            <Text
              style={[
                styles.memeText,
                styles.bottomText,
                {
                  color: rainbowText ? '#00ffff' : textColor,
                  fontSize,
                  textShadowColor: '#000',
                  textShadowOffset: { width: 3, height: 3 },
                  textShadowRadius: 8,
                  transform: [{ translateY: shakeText && isRecording ? -3 : 0 }],
                },
              ]}
            >
              {bottomText.toUpperCase()}
            </Text>

            {stickerList.map((sticker) => (
              <DraggableSticker
                key={sticker.id}
                sticker={sticker}
                isSelected={sticker.id === selectedStickerId}
                onPress={() => setSelectedStickerId(sticker.id)}
                onLongPress={() => removeSticker(sticker.id)}
                onMove={(id, dx, dy) => updateStickerPosition(id, dx, dy)}
              />
            ))}
          </ViewShot>
        </Animated.View>

        {renderSection(
          'image',
          'Image',
          '🖼️',
          <Pressable style={styles.primaryButton} onPress={pickImage}>
            <Text style={styles.primaryButtonText}>📁 Choisir une image</Text>
          </Pressable>
        )}

        {renderSection(
          'fry',
          'Deep Fry',
          '🍟',
          <View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Cuisson</Text>
              <Text style={styles.sliderValue}>{fry}%</Text>
            </View>
            <Slider value={fry} onValueChange={setFry} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#333333" />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Saturation</Text>
              <Text style={styles.sliderValue}>{saturation}%</Text>
            </View>
            <Slider value={saturation} onValueChange={setSaturation} minimumValue={0} maximumValue={150} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#333333" />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Contraste</Text>
              <Text style={styles.sliderValue}>{contrast}%</Text>
            </View>
            <Slider value={contrast} onValueChange={setContrast} minimumValue={0} maximumValue={150} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#333333" />

            <View style={styles.toggleRow}>
              <Pressable style={[styles.toggle, jpegArtifacts && styles.toggleActive]} onPress={() => setJpegArtifacts((value) => !value)}>
                <Text style={styles.toggleText}>{jpegArtifacts ? '✓' : '○'} JPEG Art.</Text>
              </Pressable>
              <Pressable style={[styles.toggle, chromatic && styles.toggleActive]} onPress={() => setChromatic((value) => !value)}>
                <Text style={styles.toggleText}>{chromatic ? '✓' : '○'} Aberration</Text>
              </Pressable>
            </View>
          </View>
        )}

        {renderSection(
          'effects',
          'Effets visuels',
          '✨',
          <View>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Vignette</Text>
              <Text style={styles.sliderValue}>{vignette}%</Text>
            </View>
            <Slider value={vignette} onValueChange={setVignette} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#333333" />

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Fumée</Text>
              <Text style={styles.sliderValue}>{smoke}%</Text>
            </View>
            <Slider value={smoke} onValueChange={setSmoke} minimumValue={0} maximumValue={100} step={1} thumbTintColor="#ff5c00" minimumTrackTintColor="#ff5c00" maximumTrackTintColor="#333333" />
          </View>
        )}

        {renderSection(
          'text',
          'Texte mème',
          '💬',
          <View>
            <Text style={styles.label}>Texte haut</Text>
            <TextInput value={topText} onChangeText={setTopText} maxLength={36} style={styles.input} placeholder="Texte du haut" placeholderTextColor="#7d7d7d" />

            <Text style={styles.label}>Texte bas</Text>
            <TextInput value={bottomText} onChangeText={setBottomText} maxLength={36} style={styles.input} placeholder="Texte du bas" placeholderTextColor="#7d7d7d" />

            <View style={styles.inlineRow}>
              <View style={styles.halfCell}>
                <Text style={styles.label}>Taille</Text>
                <TextInput
                  value={String(fontSize)}
                  onChangeText={(value) => setFontSize(Math.min(60, Math.max(18, Number(value) || 18)))}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.halfCell}>
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorsRow}>
                  {TEXT_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setTextColor(color)}
                      style={[styles.colorDot, { backgroundColor: color, borderWidth: textColor === color ? 3 : 1, borderColor: textColor === color ? '#fff' : '#333' }]}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <Pressable style={[styles.toggle, rainbowText && styles.toggleActive]} onPress={() => setRainbowText((value) => !value)}>
                <Text style={styles.toggleText}>{rainbowText ? '✓' : '○'} Rainbow</Text>
              </Pressable>
              <Pressable style={[styles.toggle, shakeText && styles.toggleActive]} onPress={() => setShakeText((value) => !value)}>
                <Text style={styles.toggleText}>{shakeText ? '✓' : '○'} Tremble</Text>
              </Pressable>
            </View>
          </View>
        )}

        {renderSection(
          'stickers',
          'Stickers emoji',
          '😎',
          <View>
            <Text style={styles.helper}>Ajoute un emoji, puis glisse-le sur le rendu.</Text>
            <View style={styles.emojiGrid}>
              {STICKER_SET.map((emoji) => (
                <Pressable key={emoji} onPress={() => addSticker(emoji)} style={styles.emojiButton}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            {stickerList.length > 0 ? (
              <View style={styles.stickerRack}>
                {stickerList.map((sticker) => (
                  <Pressable
                    key={`rack-${sticker.id}`}
                    onPress={() => setSelectedStickerId(sticker.id)}
                    onLongPress={() => removeSticker(sticker.id)}
                    style={[styles.stickerChip, selectedStickerId === sticker.id && styles.stickerChipActive]}
                  >
                    <Text style={{ fontSize: 22 }}>{sticker.emoji}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.secondaryButton} onPress={clearStickers}>
              <Text style={styles.secondaryButtonText}>🗑 Effacer</Text>
            </Pressable>
          </View>
        )}

        {renderSection(
          'export',
          'Export',
          '💾',
          <View>
            <Pressable style={[styles.primaryButton, isExporting && styles.disabledButton]} onPress={exportPNG} disabled={isExporting}>
              <Text style={styles.primaryButtonText}>{isExporting ? '⏳ Export...' : '📸 Sauvegarder PNG'}</Text>
            </Pressable>

            <Pressable style={[styles.recordButton, isRecording && styles.recordButtonActive]} onPress={recordFrameSequence} disabled={isRecording}>
              <Text style={styles.recordButtonText}>{isRecording ? '⏳ REC...' : '🎬 Export animation'}</Text>
            </Pressable>

            {recordStatus ? (
              <View style={styles.statusBox}>
                <ActivityIndicator size="small" color="#ff5c00" style={{ marginRight: 8 }} />
                <Text style={styles.recordStatus}>{recordStatus}</Text>
              </View>
            ) : null}
          </View>
        )}
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
    paddingTop: 18,
    paddingBottom: 42,
    backgroundColor: '#0d0d0d',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#ff5c00',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#f2f2f2',
    opacity: 0.7,
    letterSpacing: 4,
    fontSize: 12,
    marginTop: 4,
  },
  previewWrap: {
    marginBottom: 18,
    alignItems: 'center',
  },
  previewCanvas: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ff5c00',
    backgroundColor: '#111111',
    shadowColor: '#ff5c00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.62,
    shadowRadius: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  placeholderIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  placeholderText: {
    color: '#777',
    fontSize: 16,
    fontWeight: '700',
  },
  fryOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  smoke: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(180,170,160,0.25)',
  },
  chromatic: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 255, 0.12)',
  },
  memeText: {
    position: 'absolute',
    left: 14,
    right: 14,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  topText: {
    top: 20,
  },
  bottomText: {
    bottom: 20,
  },
  section: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
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
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 15,
  },
  chevron: {
    color: '#868686',
    fontSize: 12,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#ff5c00',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 15,
  },
  recordButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2b2b2b',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#7f1d1d',
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 15,
  },
  statusBox: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordStatus: {
    color: '#ffb07f',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sliderLabel: {
    color: '#e1e1e1',
    fontWeight: '700',
  },
  sliderValue: {
    color: '#ff9f66',
    fontWeight: '900',
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  toggle: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#2d2d2d',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#2b190f',
    borderColor: '#ff5c00',
  },
  toggleText: {
    color: '#f2f2f2',
    fontWeight: '700',
    fontSize: 12,
  },
  label: {
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f3f3f3',
    fontSize: 16,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  halfCell: {
    flex: 1,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  helper: {
    color: '#7c7c7c',
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#1d1d1d',
    borderColor: '#2d2d2d',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emojiText: {
    fontSize: 26,
  },
  stickerRack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
  },
  stickerChip: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  stickerChipActive: {
    borderColor: '#ff5c00',
    backgroundColor: '#2b190f',
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f3f3f3',
    fontWeight: '800',
    fontSize: 13,
  },
  sticker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
