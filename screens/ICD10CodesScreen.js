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

// Import the ICD-10 data
import icd10DataJson from '../data/icd10-codes.json';

const ICD10_DATA_KEY = '@icd10_data_cached';
const ICD10_VERSION_KEY = '@icd10_version';

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
  const [icd10Data, setIcd10Data] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCode, setSelectedCode] = React.useState(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [dataStats, setDataStats] = React.useState(null);

  // Load ICD-10 data
  React.useEffect(() => {
    loadICD10Data();
  }, []);

  // Filter data based on search text
  React.useEffect(() => {
    filterData();
  }, [searchText, icd10Data]);

  const loadICD10Data = async () => {
    try {
      setLoading(true);
      
      // Check if we have cached data and if it's the current version
      const cachedVersion = await AsyncStorage.getItem(ICD10_VERSION_KEY);
      const currentVersion = icd10DataJson.version;
      
      if (cachedVersion === currentVersion) {
        const cachedData = await AsyncStorage.getItem(ICD10_DATA_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setIcd10Data(parsedData);
          setDataStats({
            totalCodes: parsedData.length,
            version: currentVersion,
            lastLoaded: new Date().toLocaleDateString()
          });
          setLoading(false);
          return;
        }
      }

      // Load from JSON file
      const processedData = icd10DataJson.codes;
      setIcd10Data(processedData);
      
      // Cache the data and version
      await AsyncStorage.setItem(ICD10_DATA_KEY, JSON.stringify(processedData));
      await AsyncStorage.setItem(ICD10_VERSION_KEY, currentVersion);
      
      setDataStats({
        totalCodes: processedData.length,
        version: currentVersion,
        lastLoaded: new Date().toLocaleDateString()
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading ICD-10 data:', error);
      Alert.alert('Error', 'Failed to load ICD-10 data. Please try again.');
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchText.trim()) {
      setFilteredData([]);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    let filtered = icd10Data.filter(item => {
      return (
        item.code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.code3.toLowerCase().includes(searchLower) ||
        item.code3Description.toLowerCase().includes(searchLower) ||
        item.chapter.toLowerCase().includes(searchLower)
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

    // Limit results for performance
    setFilteredData(filtered.slice(0, 100));
  };

  const handleCodeSelect = (code) => {
    setSelectedCode(code);
    setShowDetailModal(true);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Code copied to clipboard');
  };

  const clearCache = async () => {
    Alert.alert(
      'Refresh Data',
      'This will refresh the ICD-10 data cache. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: async () => {
            await AsyncStorage.multiRemove([ICD10_DATA_KEY, ICD10_VERSION_KEY]);
            loadICD10Data();
          }
        }
      ]
    );
  };

  const renderCodeItem = (item, index) => (
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
      {item.code3 !== item.code && (
        <Text style={styles.code3Info}>
          3-Char: {item.code3} - {item.code3Description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <TexturedBackground>
        <View style={GlobalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={GlobalStyles.loadingText}>Loading ICD-10 codes...</Text>
          <Text style={styles.loadingSubtext}>
            Loading from optimized JSON data
          </Text>
        </View>
      </TexturedBackground>
    );
  }

  return (
    <TexturedBackground>
      <View style={styles.screenContainer}>
        <Text style={GlobalStyles.pageTitle}>ICD-10 Code Search</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={GlobalStyles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by ICD-10 code or description..."
            placeholderTextColor={Colors.textLight}
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

        <View style={styles.statsContainer}>
          <View>
            <Text style={GlobalStyles.countText}>
              {searchText.trim() 
                ? `${filteredData.length} code${filteredData.length !== 1 ? 's' : ''} found` 
                : `${dataStats?.totalCodes || 0} total codes available`}
            </Text>
            {dataStats && (
              <Text style={styles.versionText}>
                Version {dataStats.version} • Updated {dataStats.lastLoaded}
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={clearCache}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {!searchText.trim() ? (
            <View style={GlobalStyles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={GlobalStyles.emptyStateText}>
                Start typing to search through {dataStats?.totalCodes || 0} ICD-10 codes.
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
          ) : filteredData.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredData.map(renderCodeItem)}
              {filteredData.length === 100 && (
                <View style={styles.limitNotice}>
                  <Text style={styles.limitNoticeText}>
                    Showing first 100 results. Refine your search for more specific results.
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

  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.lightBlue,
  },

  refreshButtonText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },

  // List Container
  listContainer: {
    flex: 1,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },

  validBadgeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
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

  // Loading
  loadingSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
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