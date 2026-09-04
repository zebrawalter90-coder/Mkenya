---
name: Mobile build and publish stability
description: Expo static builds need an isolated Metro port and a pnpm package extension for react-native-worklets.
---

The Expo static build must not share Metro's development port; its build script uses a separate configurable port. The current React Native Worklets release also needs an explicit `@babel/generator` package extension under pnpm's strict dependency layout.

**Why:** Sharing Metro ports caused intermittent HTTP 500 bundle responses, and the undeclared Babel dependency caused production transforms to fail even though typechecking passed.

**How to apply:** Preserve the isolated `EXPO_BUILD_PORT` behavior and the package extension when refreshing Expo or Babel dependencies.