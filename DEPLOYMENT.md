# 🚀 Deployment Guide - Deep-Fried Mème Studio

## Quick Start Commands

### 1. Prepare your environment

```bash
npm install -g eas-cli
eas login
eas whoami
```

### 2. Build for production

```bash
# Android (Google Play Store)
eas build --platform android --profile production

# iOS (Apple App Store)
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### 3. Submit to stores

```bash
# Android submission (requires Google Play credentials)
eas submit --platform android --latest

# iOS submission (requires Apple ID credentials)
eas submit --platform ios --latest
```

## Build Profiles

### Preview
For testing on device/simulator
```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Production
For App Store / Play Store submission
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Required Credentials

### Android
- Google Play Developer Account
- Service Account JSON key
- Place in: `./service-account-key.json`

### iOS
- Apple Developer Account
- App Store Connect access
- App-Specific Password
- Valid certificate & provisioning profile

## Version Updates

Before each build, update `app.json`:

```json
{
  "expo": {
    "version": "2.0.1",
    "android": {
      "versionCode": 3
    }
  }
}
```

## Monitoring

After deployment:
- Check Expo Dashboard for crashes
- Monitor Google Play Console analytics
- Monitor App Store Connect reviews
- Respond to user feedback

## Support

- Expo Docs: https://docs.expo.dev
- EAS Docs: https://docs.expo.dev/eas/
- React Native: https://reactnative.dev
