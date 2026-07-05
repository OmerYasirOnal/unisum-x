import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Constants from 'expo-constants';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

// Real unit IDs come from app.json > extra (currently Google's test IDs).
// In dev we always use the library test unit so we never risk policy strikes.
const unitId = __DEV__
  ? TestIds.BANNER
  : (Platform.OS === 'ios' ? extra.admobBannerIos : extra.admobBannerAndroid) || TestIds.BANNER;

let started = false;

export function AdBanner() {
  const [ready, setReady] = useState(started);

  useEffect(() => {
    if (started) return;
    started = true;
    mobileAds()
      .initialize()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
