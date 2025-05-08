# Common Components

## BlurViewFix

`BlurViewFix` is a custom component that addresses common issues with the `@react-native-community/blur` library on iOS devices.

### Purpose

The standard BlurView component from `@react-native-community/blur` has some known issues on iOS:

1. It sometimes renders as a black box rather than a transparent blur on iOS real devices (while working fine on simulators)
2. It doesn't properly handle the "Reduce Transparency" accessibility setting on iOS
3. It can have rendering issues on older iOS versions

The `BlurViewFix` component solves these problems by:

- Detecting the iOS version and providing a suitable fallback for older iOS versions
- Checking if the user has enabled "Reduce Transparency" accessibility settings
- Providing a fallback color when blur effects cannot be properly displayed

### Usage

Replace all instances of `BlurView` from `@react-native-community/blur` with our custom `BlurViewFix` component:

```jsx
import BlurViewFix from '../components/common/BlurViewFix';

// Instead of this:
<BlurView
  style={StyleSheet.absoluteFill}
  blurType="light"
  blurAmount={10}
/>

// Use this:
<BlurViewFix
  style={StyleSheet.absoluteFill}
  blurType="light"
  blurAmount={10}
  reducedTransparencyFallbackColor="#292A38"
>
  {/* Children go here */}
</BlurViewFix>
```

### Props

The component accepts all the same props as the original BlurView, plus:

- `children`: React elements that will be rendered on top of the blur effect
- `reducedTransparencyFallbackColor`: The background color to use when blur effects can't be displayed (defaults to a semi-transparent dark color)

### Important Notes

1. Always provide a `reducedTransparencyFallbackColor` that matches your app's design when used with a solid background
2. Unlike the original BlurView, BlurViewFix requires you to provide children as JSX elements between opening and closing tags
3. For the best user experience, test on real iOS devices, not just simulators
