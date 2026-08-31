---
name: PWA install versus APK
description: The website can install as a home-screen PWA, but a native APK requires a separately compiled file.
---

Use the browser-native PWA prompt for supported Chromium browsers, with manifest metadata, install-size icons, and a service worker. A website cannot force-install a PWA in unsupported browsers or create/download a native APK without an actual compiled APK and public URL.

**Why:** Users may describe “install” as downloading an Android app, while the web install flow adds the site to the home screen rather than producing an APK.

**How to apply:** Label the action as installing Mkenya Shop to the device/home screen, keep platform fallbacks for iOS and unsupported browsers, and never add a fake APK link.