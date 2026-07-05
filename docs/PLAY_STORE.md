# UniSum X — Google Play (Internal Testing) yayın rehberi

Kod tarafı hazır: `eas.json` içindeki `submit.production.android` bloğu ayarlı,
`.gitignore` service-account anahtarını koruyor. Aşağıda **senin** yapman gereken
(hesap/erişim gerektiren) adımlar var; gerisini ben komutla hallederim.

## Senin yapacakların (bir kez)

1. **Play Console'da uygulamayı oluştur** — https://play.google.com/console → "Create app"
   - Uygulama adı: `UniSum`, dil, App, Ücretsiz/Ücretli, beyanları işaretle → Create.
   - Paket adını burada YAZMIYORSUN; ilk `.aab` yüklenince `com.omeryasironal.unisumx` bağlanır (app.json ile eşleşiyor).

2. **İlk `.aab`'yi elle yükle** (Google zorunlu kılıyor — API ilk sürümü oluşturamaz)
   - Ben `.aab`'yi üretip sana build linkini vereceğim (`eas build -p android --profile production`).
   - Play Console → Test and release → Testing → **Internal testing** → "Create new release".
   - App signing sorulunca **"Use Google-generated key"** seç (Play App Signing — `.aab` için zorunlu).
   - `.aab`'yi yükle → sürüm notu → Save → Review → "Start rollout to Internal testing".

3. **Google Cloud service account + JSON anahtarı oluştur** (sonraki otomatik gönderimler için)
   - Play Console (uygulama dışında, hesap seviyesi) → arama: **"API access"**.
   - Bir Google Cloud projesi bağla + **"Google Play Android Developer API"**'yi etkinleştir.
   - "Service accounts" → "Create new service account" → GCP Console'da ad ver (`eas-submit`) → rol BOŞ bırakılabilir → Done.
   - Service account → **Keys** → Add key → Create new key → **JSON** → indir.
   - JSON dosyasını şu konuma koy: `unisum-x/google-play-service-account.json` (commit'lenmez, .gitignore'da).

4. **Service account'a Play erişimi ver**
   - Play Console → Users and permissions → Invite new users → service account e-postasını yapıştır.
   - İzin: en az "Release apps to testing tracks" + "Manage testing tracks" (ya da basitçe Admin).

5. **Test kullanıcı listesi** — Internal testing → Testers → e-posta listesi oluştur → opt-in linkini testçilere gönder (liste boşsa kimse göremez).

## Ben yapacağım (sen 1–5'i bitirince)

```bash
cd unisum-x
# .aab üret (ilk seferde sen elle yükleyeceksin — adım 2)
eas build -p android --profile production
# sonraki her sürümde tek komut:
eas submit -p android --profile production --latest
```

> Not: `preview` profili `.apk` (test dağıtımı) üretir; Play `.aab` ister, o yüzden `production` profili kullanılır.
> versionCode otomatik (appVersionSource: remote + autoIncrement).
