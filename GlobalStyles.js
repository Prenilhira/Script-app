import { StyleSheet } from 'react-native';

// Color Palette
export const Colors = {
  // Blue Theme - Various Shades
  primaryBlue: '#1e3a8a',      // Deep blue
  secondaryBlue: '#3b82f6',    // Medium blue  
  lightBlue: '#60a5fa',        // Light blue
  accentBlue: '#93c5fd',       // Very light blue
  darkBlue: '#1e40af',         // Dark blue
  
  // Grey Theme
  backgroundGrey: '#f1f5f9',   // Light grey background
  cardGrey: '#f8fafc',         // Card background
  borderGrey: '#e2e8f0',       // Borders
  textGrey: '#64748b',         // Secondary text
  darkGrey: '#334155',         // Primary text
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Text Colors
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  white: '#ffffff',
};

// Global Styles
export const GlobalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
  },
  
  // Textured Background Effect
  texturedBackground: {
    backgroundColor: Colors.backgroundGrey,
    position: 'relative',
  },
  
  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
  },
  
  // Button Styles - Blue Theme
  primaryButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.primaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  secondaryButton: {
    backgroundColor: Colors.secondaryBlue,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.secondaryBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  lightButton: {
    backgroundColor: Colors.lightBlue,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.lightBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  warningButton: {
    backgroundColor: Colors.warning,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.warning,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  dangerButton: {
    backgroundColor: Colors.error,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Text Styles
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonTextSmall: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 8,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  
  subHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  
  bodyText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  
  captionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  
  // Input Styles
  input: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.textPrimary,
  },
  
  // Form Styles
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: Colors.textPrimary,
  },
  
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  // Utility Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  padding: {
    padding: 20,
  },
  
  marginVertical: {
    marginVertical: 8,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGrey,
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  
  emptyStateText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  
  // Count/Status Styles
  countText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
});

// Textured Background Component Styles
export const TexturedBackgroundStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
  },
  
  // CSS-like textured background using overlays
  textureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  
  // Subtle pattern overlay
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default GlobalStyles;