import React from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  Modal,
  Clipboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles, Colors } from '../GlobalStyles';

// Import ICD-10 data directly (no AsyncStorage caching for large dataset)
import icd10DataJson from '../data/icd10-codes.json';

const FAVORITES_KEY = '@icd10_favorites';
const RECENT_SEARCHES_KEY = '@icd10_recent';

// Textured Background Component
const TexturedBackground = ({ children }) => (
  <View style={[GlobalStyles.container]}>
    <View style={styles.backgroundBase} />
    <View style={styles.textureLayer1} />
    <View style={styles.textureLayer2} />
    <View style={styles.contentContainer}>
      {children}
    </View>
  </View>
);

function ICD10CodesScreen({ navigation }) {
  // States
  const [searchText, setSearchText] = React.useState('');
  const [filteredData, setFilteredData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedCode, setSelectedCode] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [favorites, setFavorites] = React.useState([]);
  const [recentSearches, setRecentSearches] = React.useState([]);
  const [showFavorites, setShowFavorites] = React.useState(false);

  React.useEffect(() => {
    loadUserData();
  }, []);

  React.useEffect(() => {
    filterData();
  }, [searchText]);

  const loadUserData = async () => {
    try {
      // Load small user data (favorites and recent searches)
      const [storedFavorites, storedRecent] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(RECENT_SEARCHES_KEY)
      ]);

      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      
      if (storedRecent) {
        setRecentSearches(JSON.parse(storedRecent));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      // Continue without user data if storage fails
    }
  };

  const saveToFavorites = async (code) => {
    try {
      const newFavorites = [...favorites, code];
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Could not save favorite:', error);
      Alert.alert('Note', 'Could not save to favorites due to storage limitations');
    }
  };

  const removeFromFavorites = async (codeToRemove) => {
    try {
      const newFavorites = favorites.filter(code => code.code !== codeToRemove.code);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Could not remove favorite:', error);
    }
  };

  const saveRecentSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    try {
      const newRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
      setRecentSearches(newRecent);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    } catch (error) {
      console.log('Could not save recent search:', error);
    }
  };

  const filterData = () => {
    if (!searchText.trim()) {
      setFilteredData([]);
      return;
    }

    setLoading(true);
    
    // Use setTimeout to prevent UI blocking during search
    setTimeout(() => {
      try {
        const searchLower = searchText.toLowerCase().trim();
        
        // Save recent search
        saveRecentSearch(searchText);
        
        // Filter the data
        let filtered = icd10DataJson.codes.filter(item => {
          return (
            item.code.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.chapter.toLowerCase().includes(searchLower) ||
            (item.code3 && item.code3.toLowerCase().includes(searchLower)) ||
            (item.code3Description && item.code3Description.toLowerCase().includes(searchLower))
          );
        });

        // Sort results by relevance
        filtered.sort((a, b) => {
          const aCode = a.code.toLowerCase();
          const bCode = b.code.toLowerCase();
          const aDesc = a.description.toLowerCase();
          const bDesc = b.description.toLowerCase();
          
          // Exact code match first
          if (aCode === searchLower) return -1;
          if (bCode === searchLower) return 1;
          
          // Code starts with search term
          if (aCode.startsWith(searchLower) && !bCode.startsWith(searchLower)) return -1;
          if (bCode.startsWith(searchLower) && !aCode.startsWith(searchLower)) return 1;
          
          // Description starts with search term
          if (aDesc.startsWith(searchLower) && !bDesc.startsWith(searchLower)) return -1;
          if (bDesc.startsWith(searchLower) && !aDesc.startsWith(searchLower)) return 1;
          
          // Alphabetical by code
          return aCode.localeCompare(bCode);
        });

        // Limit results for performance (increased limit since no DB storage)
        setFilteredData(filtered.slice(0, 200));
        setLoading(false);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredData([]);
        setLoading(false);
        Alert.alert('Search Error', 'There was an issue searching the codes. Please try a different search term.');
      }
    }, 100);
  };

  const handleCodeSelect = (code) => {
    setSelectedCode(code);
    setShowDetailModal(true);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Code copied to clipboard');
  };

  const isFavorite = (code) => {
    return favorites.some(fav => fav.code === code.code);
  };

  const toggleFavorite = (code) => {
    if (isFavorite(code)) {
      removeFromFavorites(code);
    } else {
      saveToFavorites(code);
    }
  };

  const renderCodeItem = (item, index) => {
    const isCodeFavorite = isFavorite(item);
    
    return (
      <TouchableOpacity
        key={`${item.code}-${index}`}
        style={[GlobalStyles.card, styles.codeItem]}
        onPress={() => handleCodeSelect(item)}
      >
        <View style={styles.codeHeader}>
          <Text style={styles.codeNumber}>{item.code}</Text>
          <View style={styles.codeActions}>
            {item.validClinical && (
              <View style={styles.validBadge}>
                <Text style={styles.validBadgeText}>Clinical</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.favoriteButton, isCodeFavorite && styles.favoriteButtonActive]}
              onPress={() => toggleFavorite(item)}
            >
              <Text style={[styles.favoriteButtonText, isCodeFavorite && styles.favoriteButtonTextActive]}>
                {isCodeFavorite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(item.code)}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.codeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.codeChapter} numberOfLines={1}>
          {item.chapter}
        </Text>
        {item.code3 && item.code3 !== item.code && (
          <Text style={styles.code3Info}>
            3-Char: {item.code3} - {item.code3Description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <View style={styles.recentSearches}>
        <Text style={styles.recentSearchesTitle}>Recent Searches:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchChip}
              onPress={() => setSearchText(search)}
            >
              <Text style={styles.recentSearchText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFavorites = () => {
    if (favorites.length === 0) {
      return (
        <View style={styles.emptyFavorites}>
          <Text style={styles.emptyFavoritesText}>No favorite codes yet</Text>
          <Text style={styles.emptyFavoritesSubtext}>Tap the ★ button on any code to add it to favorites</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {favorites.map(renderCodeItem)}
      </ScrollView>
    );
  };

  return (
    <TexturedBackground>
      <View style={styles.screenContainer}>
        <Text style={GlobalStyles.pageTitle}>ICD-10 Code Search</Text>
        
        {/* Toggle between Search and Favorites */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !showFavorites && styles.toggleButtonActive]}
            onPress={() => setShowFavorites(false)}
          >
            <Text style={[styles.toggleText, !showFavorites && styles.toggleTextActive]}>
              Search
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showFavorites && styles.toggleButtonActive]}
            onPress={() => setShowFavorites(true)}
          >
            <Text style={[styles.toggleText, showFavorites && styles.toggleTextActive]}>
              Favorites ({favorites.length})
            </Text>
          </TouchableOpacity>
        </View>

        {!showFavorites ? (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={GlobalStyles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by ICD-10 code or description..."
                placeholderTextColor={Colors.textLight}
                color={Colors.textPrimary}
                autoCapitalize="none"
              />
              
              {searchText.trim() && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchText('')}
                >
                  <Text style={styles.clearSearchText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {renderRecentSearches()}

            <View style={styles.statsContainer}>
              <View>
                <Text style={GlobalStyles.countText}>
                  {loading ? 'Searching...' : 
                   searchText.trim() ? `${filteredData.length} code${filteredData.length !== 1 ? 's' : ''} found` : 
                   `${icd10DataJson.totalCodes} total codes available`}
                </Text>
                {icd10DataJson.version && (
                  <Text style={styles.versionText}>
                    Version {icd10DataJson.version} • Updated {new Date().toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.listContainer}>
              {!searchText.trim() ? (
                <View style={GlobalStyles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🔍</Text>
                  <Text style={GlobalStyles.emptyStateText}>
                    Start typing to search through {icd10DataJson.totalCodes} ICD-10 codes.
                    {'\n\n'}
                    You can search by:
                    {'\n'}• ICD-10 code (e.g., A00, B15.9)
                    {'\n'}• Description or diagnosis
                    {'\n'}• Chapter description
                    {'\n'}• 3-character codes
                  </Text>
                  
                  <View style={styles.searchExamples}>
                    <Text style={styles.examplesTitle}>Try these examples:</Text>
                    <TouchableOpacity onPress={() => setSearchText('diabetes')}>
                      <Text style={styles.exampleText}>• diabetes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSearchText('I10')}>
                      <Text style={styles.exampleText}>• I10 (hypertension)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSearchText('fever')}>
                      <Text style={styles.exampleText}>• fever</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primaryBlue} />
                  <Text style={styles.loadingText}>Searching codes...</Text>
                </View>
              ) : filteredData.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {filteredData.map(renderCodeItem)}
                  {filteredData.length === 200 && (
                    <View style={styles.limitNotice}>
                      <Text style={styles.limitNoticeText}>
                        Showing first 200 results. Refine your search for more specific results.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={GlobalStyles.emptyState}>
                  <Text style={styles.emptyStateIcon}>❌</Text>
                  <Text style={GlobalStyles.emptyStateText}>
                    No ICD-10 codes found for "{searchText}".
                    {'\n\n'}
                    Try a different search term or check your spelling.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.listContainer}>
            {renderFavorites()}
          </View>
        )}

        {/* Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={GlobalStyles.modalOverlay}>
            <View style={[GlobalStyles.modalContent, styles.detailModal]}>
              <Text style={GlobalStyles.modalTitle}>ICD-10 Code Details</Text>
              
              {selectedCode && (
                <ScrollView style={styles.detailContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Code:</Text>
                    <Text style={styles.detailValue}>{selectedCode.code}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedCode.description}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Chapter:</Text>
                    <Text style={styles.detailValue}>{selectedCode.chapter}</Text>
                  </View>
                  
                  {selectedCode.code3 && selectedCode.code3 !== selectedCode.code && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>3-Character Code:</Text>
                      <Text style={styles.detailValue}>
                        {selectedCode.code3} - {selectedCode.code3Description}
                      </Text>
                    </View>
                  )}
                  
                  {selectedCode.groupCode && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Group:</Text>
                      <Text style={styles.detailValue}>{selectedCode.groupCode}</Text>
                    </View>
                  )}
                  
                  <View style={styles.validityContainer}>
                    <Text style={styles.validityTitle}>Validity:</Text>
                    <View style={styles.validityRow}>
                      <Text style={styles.validityLabel}>Clinical Use:</Text>
                      <View style={[styles.validityBadge, selectedCode.validClinical ? styles.validTrue : styles.validFalse]}>
                        <Text style={styles.validityBadgeText}>
                          {selectedCode.validClinical ? 'Valid' : 'Not Valid'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.validityRow}>
                      <Text style={styles.validityLabel}>Primary Diagnosis:</Text>
                      <View style={[styles.validityBadge, selectedCode.validPrimary ? styles.validTrue : styles.validFalse]}>
                        <Text style={styles.validityBadgeText}>
                          {selectedCode.validPrimary ? 'Valid' : 'Not Valid'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
              
              <View style={GlobalStyles.modalButtonContainer}>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.secondaryButton]}
                  onPress={() => copyToClipboard(selectedCode?.code || '')}
                >
                  <Text style={GlobalStyles.buttonText}>Copy Code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[GlobalStyles.modalButton, GlobalStyles.lightButton]}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={GlobalStyles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  // Background Styles
  backgroundBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundGrey,
  },
  
  textureLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.4,
    shadowColor: Colors.borderGrey,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  
  textureLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 58, 138, 0.02)',
  },
  
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },

  screenContainer: {
    flex: 1,
    padding: 16,
  },

  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },

  toggleButtonActive: {
    backgroundColor: Colors.primaryBlue,
  },

  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  toggleTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },

  // Search Container
  searchContainer: {
    position: 'relative',
    marginBottom: 8,
  },

  clearSearchButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.borderGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearSearchText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },

  // Recent Searches
  recentSearches: {
    marginBottom: 12,
  },

  recentSearchesTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },

  recentSearchChip: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },

  recentSearchText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },

  versionText: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },

  // List Container
  listContainer: {
    flex: 1,
  },

  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Code Item Styles
  codeItem: {
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryBlue,
  },

  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  codeNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
  },

  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  validBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  validBadgeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },

  favoriteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: Colors.borderGrey,
  },

  favoriteButtonActive: {
    backgroundColor: Colors.warning,
  },

  favoriteButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  favoriteButtonTextActive: {
    color: Colors.white,
  },

  copyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: Colors.accentBlue,
  },

  copyButtonText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    fontWeight: '600',
  },

  codeDescription: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },

  codeChapter: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },

  code3Info: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
  },

  // Favorites
  emptyFavorites: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyFavoritesText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyFavoritesSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },

  // Search Examples
  searchExamples: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 8,
  },

  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  exampleText: {
    fontSize: 14,
    color: Colors.primaryBlue,
    paddingVertical: 4,
    textDecorationLine: 'underline',
  },

  // Empty State
  emptyStateIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Limit Notice
  limitNotice: {
    backgroundColor: Colors.backgroundGrey,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },

  limitNoticeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Detail Modal
  detailModal: {
    maxHeight: '80%',
    width: '95%',
  },

  detailContent: {
    maxHeight: 400,
    marginBottom: 20,
  },

  detailRow: {
    marginBottom: 12,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  validityContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGrey,
  },

  validityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  validityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  validityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  validityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  validTrue: {
    backgroundColor: Colors.success,
  },

  validFalse: {
    backgroundColor: Colors.textLight,
  },

  validityBadgeText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default ICD10CodesScreen;