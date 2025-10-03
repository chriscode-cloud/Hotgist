# 🎨 HotGist Theme System

This directory contains the centralized design system for the HotGist app.

## 📁 File Structure

```
constants/
├── theme.js          # Main theme file with all design tokens
└── README.md         # This documentation
```

## 🚀 Quick Start

Import the theme in any component:

```javascript
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';

// Use in your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.bold,
  },
});
```

## 🎨 Color Palette

### Brand Colors
- **Primary**: `COLORS.primary` (#5A00E0) - Electric Indigo
- **Secondary**: `COLORS.secondary` (#FF4E63) - Neon Coral
- **Accent**: `COLORS.accent` (#FF9100) - Sunburst Orange

### Background Colors
- **Background**: `COLORS.background` (#0D0D0F) - Obsidian Black
- **Surface**: `COLORS.surface` (#1a1a1a) - Dark surface for cards
- **Surface Secondary**: `COLORS.surfaceSecondary` (#2d2d2d)

### Text Colors
- **Primary Text**: `COLORS.text` (#FFFFFF) - White
- **Secondary Text**: `COLORS.textSecondary` (#A1A1AA) - Cloud Gray
- **Muted Text**: `COLORS.textMuted` (#666666)

## 📝 Typography

### Font Weights
```javascript
TYPOGRAPHY.light     // 300
TYPOGRAPHY.regular   // 400
TYPOGRAPHY.medium    // 500
TYPOGRAPHY.semibold  // 600
TYPOGRAPHY.bold      // 700
TYPOGRAPHY.extrabold // 800
```

### Font Sizes
```javascript
TYPOGRAPHY.xs    // 12px
TYPOGRAPHY.sm    // 14px
TYPOGRAPHY.base  // 16px
TYPOGRAPHY.lg    // 18px
TYPOGRAPHY.xl    // 20px
TYPOGRAPHY['2xl'] // 24px
TYPOGRAPHY['3xl'] // 28px
TYPOGRAPHY['4xl'] // 32px
TYPOGRAPHY['5xl'] // 42px
TYPOGRAPHY['6xl'] // 48px
```

## 📏 Spacing

```javascript
SPACING.xs   // 4px
SPACING.sm   // 8px
SPACING.md   // 16px
SPACING.lg   // 24px
SPACING.xl   // 32px
SPACING['2xl'] // 40px
SPACING['3xl'] // 60px
SPACING['4xl'] // 80px
```

## 🔘 Border Radius

```javascript
BORDER_RADIUS.sm  // 8px
BORDER_RADIUS.md  // 12px
BORDER_RADIUS.lg  // 16px
BORDER_RADIUS.xl  // 20px
BORDER_RADIUS['2xl'] // 24px
BORDER_RADIUS.full // 9999px (fully rounded)
```

## 🌟 Shadows

```javascript
SHADOWS.sm  // Small shadow
SHADOWS.md  // Medium shadow
SHADOWS.lg  // Large shadow with brand color
SHADOWS.xl  // Extra large shadow with brand color
```

## 🎯 Pre-built Components

### Button Styles
```javascript
BUTTON_STYLES.primary    // Primary brand button
BUTTON_STYLES.secondary  // Secondary button
BUTTON_STYLES.ghost      // Ghost button
```

### Text Styles
```javascript
TEXT_STYLES.h1      // Main heading
TEXT_STYLES.h2      // Secondary heading
TEXT_STYLES.h3      // Tertiary heading
TEXT_STYLES.body    // Body text
TEXT_STYLES.caption // Caption text
```

## ✨ Benefits

1. **Consistency** - All components use the same design tokens
2. **Maintainability** - Change colors/fonts in one place
3. **Scalability** - Easy to add new components
4. **Type Safety** - Consistent naming and values
5. **Developer Experience** - Auto-complete and IntelliSense support

## 🔄 Making Changes

To update the theme across the entire app:

1. **Edit** `constants/theme.js`
2. **Restart** the development server: `npx expo start -c`
3. **All screens** will automatically use the new values

## 🚀 Example Usage

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HotGist!</Text>
      <Text style={styles.subtitle}>Your campus gossip awaits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY['4xl'],
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});