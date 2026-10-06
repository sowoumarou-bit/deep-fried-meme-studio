# 🔥 Deep-Fried Mème Studio - Guide de Production

## ✅ Checklist avant la build

### Configuration de base
- [x] Version app.json à jour (2.0.0)
- [x] Bundle identifier iOS : `com.deepfriedmeme.studio`
- [x] Package name Android : `com.deepfriedmeme.studio`
- [x] Permissions photo/galerie configurées
- [x] eas.json préparé

### Prérequis obligatoires
- [ ] Node.js 16+ installé
- [ ] npm/yarn à jour
- [ ] Compte Expo créé (expo.dev)
- [ ] Compte Apple Developer (pour iOS)
- [ ] Compte Google Play Developer (pour Android)
- [ ] EAS CLI installé (`npm install -g eas-cli`)

---

## 🚀 Étapes de build

### 1. Installation & configuration EAS

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Vérifier la config
eas build --list
```

### 2. Build Android (AAB pour Google Play)

```bash
# Build de production AAB
eas build --platform android --profile production

# Durée estimée : 10-15 minutes
# Récupérer le lien AAB quand c'est fini
```

### 3. Build iOS (IPA pour App Store)

```bash
# Build de production IPA
eas build --platform ios --profile production

# Durée estimée : 15-20 minutes
# Récupérer le lien IPA quand c'est fini
```

### 4. Test en local avant soumission

```bash
# Android : installer sur un device/émulateur
eas build --platform android --profile preview
# Puis : adb install ./deep-fried-meme-studio.apk

# iOS : build simulator (sur macOS)
eas build --platform ios --profile preview2
```

---

## 📱 Soumission sur les app stores

### Google Play Store (Android)

1. **Créer une fiche app :**
   - Nom : "Deep-Fried Mème Studio"
   - Description : "Créez des mèmes crispy avec effets deep-fried ultra-réalistes"
   - Catégorie : "Photography" ou "Entertainment"
   - Contenu : Photos/galerie

2. **Soumettre l'AAB :**
   ```bash
   eas submit --platform android --latest
   ```
   Ou manuellement via Google Play Console :
   - App Release → Production → Upload AAB

3. **Remplir les formulaires :**
   - Screenshots (4-5 images du gameplay)
   - Description courte (80 caractères max)
   - Description longue (4000 caractères max)
   - Notes de version
   - Contenu approprié (12+)
   - Politique de confidentialité

4. **Attendre validation :** 2-4 heures généralement

### Apple App Store (iOS)

1. **Créer la fiche app :**
   - Accès via App Store Connect
   - Remplir les métadonnées (nom, description, keywords, category)

2. **Soumettre l'IPA :**
   ```bash
   eas submit --platform ios --latest
   ```
   Ou via Transporter :
   - Télécharger l'IPA
   - Ouvrir Transporter
   - Drag & drop l'IPA
   - Submit

3. **Remplir les infos obligatoires :**
   - Screenshots (6-8 par device)
   - Description détaillée
   - Copyright & contact
   - Notes de version
   - Catégorie (Photography)
   - Contenu approprié (12+)
   - Politique de confidentialité

4. **Signature & certificats :**
   - EAS gère automatiquement
   - Vérifier que le certificat est valide

5. **Attendre validation :** 24-48 heures généralement

---

## 🔧 Configuration des credentials

### Android (Google Play)

1. Créer un **Service Account** sur Google Cloud
2. Télécharger la clé JSON
3. Placer dans le projet : `./service-account-key.json`
4. Remplir dans `eas.json` :
   ```json
   "serviceAccount": "./service-account-key.json"
   ```

### iOS (App Store Connect)

1. Créer un **App-Specific Password** sur appleid.apple.com
2. Remplir dans `eas.json` :
   ```json
   "appleId": "votre-email@apple.com",
   "ascAppId": "votre-app-id-numerique",
   "appleTeamId": "votre-team-id-10-chars"
   ```

---

## 📊 Métadonnées pour les stores

### Titre
**Deep-Fried Mème Studio**

### Description courte (80 char max)
"Studio de création de mèmes deep-fried ultra-crispy 🔥"

### Description longue
```
🔥 Créez les mèmes les plus croquants du web!

Deep-Fried Mème Studio est l'app ultime pour transformer vos images en mèmes
ultracrispy avec des effets visuels époustouflants.

✨ Fonctionnalités:
- Effets "Deep-Fry" réalistes (cuisson, saturation, contraste)
- Artefacts JPEG authentiques
- Aberration chromatique RGB
- Textes mème haut/bas avec 6 couleurs + mode Rainbow
- 50+ stickers emoji à poser librement
- Effets visuels (vignette, fumée)
- Export PNG haute qualité
- Animation séquence pour vidéos

🎯 Parfait pour:
- Créer des mèmes drôles
- Éditer des photos dans un style rétro
- Générer du contenu viral
- S'amuser avec vos amis

📸 Charge n'importe quelle image et laisse la magie opérer!
```

### Keywords
deep fried, mème, meme, éditeur photo, photo editor, meme creator, funny, édition, retro, crispy, viral

### Catégorie
**Photography** (ou Entertainment selon le store)

### Rating
**12+** (contenu : user-generated content potentiellement, mais pas d'âge requis spécifique)

---

## 🐛 Dépannage courant

### "Build failed - Native dependency error"
→ Vérifier que toutes les dépendances npm sont à jour
```bash
npm install
rm -rf node_modules && npm install  # En cas de doute
```

### "Certification/signing error"
→ EAS gère la signature automatiquement, mais vérifier :
- App ID correct dans app.json
- Bundle identifier conforme
- Pas d'espaces ni caractères spéciaux

### "Permission denied - READ_EXTERNAL_STORAGE"
→ Déjà configuré dans app.json, mais vérifier :
- iOS : NSPhotoLibraryUsageDescription présente
- Android : permissions listées dans android.permissions

### "App rejected - Privacy Policy"
→ Obligatoire pour accès photos !
Créer une page "Privacy Policy" sur votre site
et mettre l'URL dans app.json ou store metadata

---

## 📈 Après la publication

1. **Monitoring :**
   - Vérifier les crashs via Expo Dashboard
   - Lire les avis utilisateurs
   - Tracker les téléchargements

2. **Updates :**
   - Petits fixes : app update via Expo (sans rebuild store)
   - Major changes : nouvelle build + soumission

3. **Analytics :**
   - Google Play Console pour stats Android
   - App Store Connect pour stats iOS

---

## 🎉 Félicitations!

Votre app est maintenant en production. Partagez le lien avec le monde! 🚀

**Liens utiles :**
- Expo EAS : https://docs.expo.dev/eas/
- Google Play Console : https://play.google.com/console
- App Store Connect : https://appstoreconnect.apple.com
- React Native Docs : https://reactnative.dev
