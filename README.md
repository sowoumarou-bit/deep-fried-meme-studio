# 🔥 Deep-Fried Mème Studio – Version Mobile PREMIUM

Une application mobile React Native / Expo ultra-crispy pour créer, éditer et exporter des mèmes deep-fried avec effets visuels époustouflants.

## 🌟 Fonctionnalités

✅ **Édition d'image complète**
- Charge n'importe quelle image depuis ta galerie
- Aperçu en temps réel du rendu "deep-fried"

✅ **Effets Deep-Fry premium**
- Curseurs de cuisson, saturation, contraste
- Artefacts JPEG pour ce look authentiquement croquant
- Aberration chromatique RGB

✅ **Texte mème avancé**
- Textes haut/bas personnalisables
- 6 couleurs prédéfinies + mode Rainbow
- Animations texte (tremblement)

✅ **Stickers emoji**
- 50+ emojis à poser librement
- Glissez-déposez intuitivement
- Gestion multi-stickers fluide

✅ **Effets visuels**
- Vignette progressive
- Fumée/overlay
- Aberration chromatique

✅ **Exports**
- **PNG haute qualité** → Galerie
- **Animation séquence** → 18 frames pour vidéo en post-prod

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+
- npm ou yarn
- Expo Go (gratuit, sur iOS/Android)

### Installation

```bash
git clone https://github.com/sowoumarou-bit/deep-fried-meme-studio.git
cd deep-fried-meme-studio
npm install
```

### Lancer l'app

```bash
npm start
```

Puis :
- **iOS** : Appuyez sur `i` → Expo Go
- **Android** : Appuyez sur `a` → Expo Go
- **Web** : Appuyez sur `w` (version allégée, export PNG recommandé)

Ou scannez le QR code avec l'app Expo Go sur votre téléphone.

## 🎯 Utilisation

1. **Charge une image** → Section "Image" → "📁 Choisir une image"
2. **Ajuste les effets** → Section "🍟 Deep Fry" (curseurs)
3. **Ajoute du texte** → Section "💬 Texte mème"
4. **Pose des stickers** → Section "😎 Stickers emoji"
5. **Exporte** → Section "💾 Export"
   - PNG → image haute qualité directement dans ta galerie
   - Animation → 18 frames pour créer une vidéo avec une app externe

## 📱 Scripts disponibles

```bash
npm start          # Lance le serveur Expo
npm run android    # Sur émulateur Android
npm run ios        # Sur iPhone (macOS)
npm run web        # Navigateur (limité)
```

## 🔧 Technos

- **React Native** 0.74.5
- **Expo** 51.0.0
- **react-native-view-shot** (capture PNG)
- **expo-image-picker** (galerie photo)
- **expo-media-library** (enregistrement)

## 🐛 Bugs connus & solutions

### L'app ne charge pas l'image
→ Vérifiez les permissions galerie/photo dans les paramètres du téléphone

### Export PNG échoue
→ Autorisez l'accès à la galerie → "Paramètres" → "Permissions" → "Photos/Galerie"

### Animation export lent
→ Normal, la capture de 18 frames peut prendre 2-3 secondes

## 📲 Build & déploiement

Pour publier sur les app stores :

```bash
npm run build:android   # APK/AAB pour Google Play
npm run build:ios       # IPA pour Apple App Store
```

Note : Vous aurez besoin d'un compte EAS (Expo App Services).

## 📄 License

MIT © sowoumarou-bit

## 🤝 Contribution

Les PRs sont bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des nouvelles fonctionnalités
- Améliorer la UI/UX

---

**Made with 🔥 by Copilot**
