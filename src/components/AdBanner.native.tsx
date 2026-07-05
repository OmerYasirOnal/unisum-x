// AdMob banner temporarily disabled for the native build.
//
// react-native-google-mobile-ads 16.4.0 pulls play-services-ads 25.4.0, whose
// Kotlin metadata is 2.3.0. Expo SDK 57's Kotlin compiler is 2.1.0 (reads up to
// 2.2.0) and can't be bumped via expo-build-properties (that only moves stdlib,
// not the compiler), so :react-native-google-mobile-ads:compileReleaseKotlin
// fails. Re-enable once the toolchain aligns (Expo ships a newer Kotlin compiler,
// or a play-services-ads build with <=2.2.0 metadata is available) by restoring
// the BannerAd implementation and re-adding the config plugin + dependency.
export function AdBanner() {
  return null;
}
