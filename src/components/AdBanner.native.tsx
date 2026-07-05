import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

// Real unit IDs come from app.json > extra (currently Google's test IDs).
// In dev we always use the library test unit so we never risk policy strikes.
const unitId = __DEV__
  ? TestIds.BANNER
  : (Platform.OS === 'ios' ? extra.admobBannerIos : extra.admobBannerAndroid) || TestIds.BANNER;

let started = false;

/**
 * Bottom-anchored adaptive banner. Reserves a fixed slot so content never
 * shifts when the ad fills (avoids accidental-click policy strikes). Render it
 * only on browse screens (home, term detail) — never on auth, chat or loading.
 */
export function AdBanner() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(started);

  useEffect(() => {
    if (started) return;
    started = true;
    mobileAds().initialize().then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  // Reserve the slot up-front (~62dp + safe-area) so nothing jumps when it loads.
  return (
    <View style={{ minHeight: 62, paddingBottom: insets.bottom, alignItems: 'center', justifyContent: 'flex-end' }}>
      {ready ? (
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      ) : null}
    </View>
  );
}
