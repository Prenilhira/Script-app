// GlobalStyles.js - Add this to your React Native project
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color system
export const colors = {
  // Gradient colors (you'll use these with LinearGradient)
  gradients: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#f093fb', '#f5576c'],
    success: ['#4facfe', '#00f2fe'],
    warning: ['#43e97b', '#38f9d7'],
    danger: ['#fa709a', '#fee140'],
    dark: ['#2c3e50', '#3498db'],
  },
  
  // Base colors
  background: {
    primary: '#0f0f23',
    secondary: '#1a1a2e',
    tertiary: '#16213e',
  },
  
  text: {
    primary: '#ffffff',
    secondary: '#b8b8b8',
    muted: '#6c757d',
  },
  
  border: 'rgba(255, 255, 255, 0.1)',
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
};

// Global styles
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  // Layout utilities
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Text styles
  textPrimary: {
    color: colors.text.primary,
  },
  
  textSecondary: {
    color: colors.text.secondary,
  },
  
  textMuted: {
    color: colors.text.muted,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  // Spacing utilities
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  mb5: { marginBottom: spacing.xl },
  
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mt5: { marginTop: spacing.xl },
  
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  p5: { padding: spacing.xl },
  
  // Shadow styles
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  shadowMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});

// ===== GRADIENT BUTTON COMPONENT =====
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // You'll need: expo install expo-linear-gradient

export const GradientButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  outline = false,
  disabled = false,
  style,
  textStyle,
  children,
  ...props 
}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonSize = buttonSizes[size];
  const gradientColors = colors.gradients[variant];

  if (outline) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            buttonStyles.base,
            buttonSize,
            buttonStyles.outline,
            disabled && buttonStyles.disabled,
            style,
          ]}
          {...props}
        >
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={buttonStyles.outlineInner}>
            <Text style={[buttonStyles.outlineText, buttonSize.textStyle, textStyle]}>
              {children || title}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          buttonStyles.base,
          buttonSize,
          disabled && buttonStyles.disabled,
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#666', '#666'] : gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Text style={[buttonStyles.text, buttonSize.textStyle, textStyle]}>
          {children || title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const buttonSizes = {
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    textStyle: { fontSize: 14, fontWeight: '600' },
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    textStyle: { fontSize: 16, fontWeight: '600' },
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 10,
    minWidth: 160,
    textStyle: { fontSize: 18, fontWeight: '600' },
  },
  xl: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 12,
    minWidth: 200,
    textStyle: { fontSize: 20, fontWeight: '600' },
  },
};

const buttonStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  text: {
    color: '#ffffff',
    textAlign: 'center',
  },
  
  outline: {
    padding: 2,
  },
  
  outlineInner: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  
  outlineText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  
  disabled: {
    opacity: 0.5,
  },
});

// ===== CARD COMPONENT =====
export const Card = ({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  ...props 
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      onPress={onPress}
      style={[
        cardStyles.base,
        cardStyles[variant],
        globalStyles.shadowMd,
        style,
      ]}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  default: {},
  
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
});

// ===== INPUT COMPONENT =====
export const Input = ({ 
  label, 
  error, 
  style, 
  inputStyle,
  labelStyle,
  ...props 
}) => {
  return (
    <View style={[inputStyles.container, style]}>
      {label && (
        <Text style={[inputStyles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          inputStyles.input,
          error && inputStyles.inputError,
          inputStyle,
        ]}
        placeholderTextColor={colors.text.muted}
        {...props}
      />
      {error && (
        <Text style={inputStyles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
  },
  
  inputError: {
    borderColor: '#ff6b6b',
  },
  
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

// ===== EXAMPLE USAGE COMPONENT =====
import { TextInput } from 'react-native';

export default function ExampleScreen() {
  return (
    <View style={globalStyles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
        
        {/* Header */}
        <View style={[globalStyles.alignCenter, globalStyles.mb5]}>
          <Text style={[typography.h1, globalStyles.textPrimary, globalStyles.textCenter, globalStyles.mb2]}>
            React Native UI
          </Text>
          <Text style={[typography.body, globalStyles.textSecondary, globalStyles.textCenter]}>
            Beautiful gradient buttons for your app
          </Text>
        </View>

        {/* Button Examples */}
        <Card style={globalStyles.mb4}>
          <Text style={[typography.h3, globalStyles.textPrimary, globalStyles.mb3]}>
            Button Variants
          </Text>
          
          <View style={[globalStyles.flexRow, { flexWrap: 'wrap', gap: spacing.sm }, globalStyles.mb3]}>
            <GradientButton title="Primary" variant="primary" size="sm" />
            <GradientButton title="Secondary" variant="secondary" size="sm" />
            <GradientButton title="Success" variant="success" size="sm" />
          </View>

          <View style={[globalStyles.flexRow, { flexWrap: 'wrap', gap: spacing.sm }, globalStyles.mb3]}>
            <GradientButton title="Warning" variant="warning" />
            <GradientButton title="Danger" variant="danger" />
            <GradientButton title="Dark" variant="dark" />
          </View>

          <Text style={[typography.caption, globalStyles.textSecondary, globalStyles.mb2]}>
            Outline Buttons:
          </Text>
          <View style={[globalStyles.flexRow, { flexWrap: 'wrap', gap: spacing.sm }]}>
            <GradientButton title="Outline" variant="primary" outline />
            <GradientButton title="Outline" variant="secondary" outline />
          </View>
        </Card>

        {/* Form Example */}
        <Card style={globalStyles.mb4}>
          <Text style={[typography.h3, globalStyles.textPrimary, globalStyles.mb3]}>
            Form Components
          </Text>
          
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
          />
          
          <GradientButton 
            title="Sign In" 
            variant="primary" 
            size="lg"
            style={{ marginTop: spacing.md }}
            onPress={() => console.log('Sign in pressed')}
          />
        </Card>

        {/* Feature Cards */}
        <View style={[globalStyles.flexRow, { gap: spacing.md }, globalStyles.mb4]}>
          <Card style={{ flex: 1 }}>
            <Text style={[typography.h3, globalStyles.textPrimary, globalStyles.mb2]}>
              🎨 Design
            </Text>
            <Text style={[typography.caption, globalStyles.textSecondary, globalStyles.mb3]}>
              Modern gradients with smooth animations
            </Text>
            <GradientButton title="Learn More" variant="secondary" size="sm" />
          </Card>
          
          <Card style={{ flex: 1 }}>
            <Text style={[typography.h3, globalStyles.textPrimary, globalStyles.mb2]}>
              ⚡ Native
            </Text>
            <Text style={[typography.caption, globalStyles.textSecondary, globalStyles.mb3]}>
              Built for React Native performance
            </Text>
            <GradientButton title="Get Started" variant="success" size="sm" />
          </Card>
        </View>

      </ScrollView>
    </View>
  );
}

// ===== INSTALLATION INSTRUCTIONS =====
/*

1. Install required dependencies:
   npm install expo-linear-gradient
   or
   expo install expo-linear-gradient

2. Add these files to your project:
   - GlobalStyles.js (this file)
   - Import and use the components in your screens

3. Update your App.js:
   import ExampleScreen from './GlobalStyles';
   
   export default function App() {
     return <ExampleScreen />;
   }

4. Usage Examples:

   // Basic button
   <GradientButton 
     title="Click Me" 
     variant="primary" 
     onPress={() => console.log('pressed')} 
   />

   // Different sizes and variants
   <GradientButton title="Small" size="sm" variant="success" />
   <GradientButton title="Large" size="lg" variant="danger" />
   <GradientButton title="Outline" outline variant="primary" />

   // Cards
   <Card>
     <Text>Card content</Text>
   </Card>

   // Forms
   <Input 
     label="Username" 
     placeholder="Enter username"
     onChangeText={setUsername}
     value={username}
   />

*/