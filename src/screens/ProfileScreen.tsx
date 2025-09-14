import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../services/authService';
import { errorService } from '../services/errorService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      const errorMessage = errorService.getUserFriendlyMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditData({
      name: user.name,
      email: user.email,
      farmDetails: {
        farmName: user.farmDetails?.farmName || '',
        location: {
          state: user.farmDetails?.location?.state || '',
          district: user.farmDetails?.location?.district || '',
          village: user.farmDetails?.location?.village || '',
          pincode: user.farmDetails?.location?.pincode || '',
        },
        farmSize: user.farmDetails?.farmSize || '',
        soilType: user.farmDetails?.soilType || 'loamy',
        irrigationType: user.farmDetails?.irrigationType || 'rain-fed',
      }
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await authService.updateProfile(editData);
      
      if (response.success) {
        setUser(response.data.user);
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      const errorMessage = errorService.getUserFriendlyMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigate to auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const soilTypes = [
    'clay', 'sandy', 'loamy', 'red', 'black', 'alluvial'
  ];

  const irrigationTypes = [
    'rain-fed', 'bore-well', 'canal', 'drip', 'sprinkler', 'flood'
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editAvatarButton}>
          <Icon name="camera-alt" size={16} color="white" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
      <Text style={styles.userPhone}>{user?.phone || 'Phone not set'}</Text>
      <Text style={styles.userEmail}>{user?.email || 'Email not set'}</Text>
      
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Icon name="edit" size={16} color="#2d5016" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFarmDetails = () => (
    <View style={styles.farmDetailsCard}>
      <Text style={styles.cardTitle}>Farm Details</Text>
      
      <View style={styles.detailRow}>
        <Icon name="home" size={20} color="#2d5016" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Farm Name</Text>
          <Text style={styles.detailValue}>
            {user?.farmDetails?.farmName || 'Not set'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="location-on" size={20} color="#2d5016" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>
            {user?.farmDetails?.location?.village && user?.farmDetails?.location?.district
              ? `${user.farmDetails.location.village}, ${user.farmDetails.location.district}`
              : 'Not set'
            }
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="straighten" size={20} color="#2d5016" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Farm Size</Text>
          <Text style={styles.detailValue}>
            {user?.farmDetails?.farmSize ? `${user.farmDetails.farmSize} acres` : 'Not set'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="eco" size={20} color="#2d5016" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Soil Type</Text>
          <Text style={styles.detailValue}>
            {user?.farmDetails?.soilType || 'Not set'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="water-drop" size={20} color="#2d5016" />
        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>Irrigation</Text>
          <Text style={styles.detailValue}>
            {user?.farmDetails?.irrigationType || 'Not set'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsCard}>
      <Text style={styles.cardTitle}>Your Statistics</Text>
      
      <View style={styles.statisticsGrid}>
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>
            {user?.statistics?.totalActivities || 0}
          </Text>
          <Text style={styles.statisticLabel}>Activities</Text>
        </View>
        
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>
            {user?.statistics?.totalPosts || 0}
          </Text>
          <Text style={styles.statisticLabel}>Posts</Text>
        </View>
        
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>
            {user?.statistics?.totalDiseaseReports || 0}
          </Text>
          <Text style={styles.statisticLabel}>Disease Reports</Text>
        </View>
        
        <View style={styles.statisticItem}>
          <Text style={styles.statisticValue}>
            {user?.statistics?.joinDate 
              ? Math.floor((new Date().getTime() - new Date(user.statistics.joinDate).getTime()) / (1000 * 60 * 60 * 24))
              : 0
            }
          </Text>
          <Text style={styles.statisticLabel}>Days Active</Text>
        </View>
      </View>
    </View>
  );

  const renderMenuItems = () => (
    <View style={styles.menuCard}>
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="notifications" size={20} color="#2d5016" />
        <Text style={styles.menuItemText}>Notifications</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="language" size={20} color="#2d5016" />
        <Text style={styles.menuItemText}>Language</Text>
        <Text style={styles.menuItemValue}>English</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="help" size={20} color="#2d5016" />
        <Text style={styles.menuItemText}>Help & Support</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem}>
        <Icon name="info" size={20} color="#2d5016" />
        <Text style={styles.menuItemText}>About</Text>
        <Icon name="chevron-right" size={20} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#e74c3c" />
        <Text style={[styles.menuItemText, { color: '#e74c3c' }]}>Logout</Text>
        <Icon name="chevron-right" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#2d5016" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={editData.name || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, name: value }))}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={editData.email || ''}
              onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Farm Name</Text>
            <TextInput
              style={styles.textInput}
              value={editData.farmDetails?.farmName || ''}
              onChangeText={(value) => setEditData(prev => ({
                ...prev,
                farmDetails: { ...prev.farmDetails, farmName: value }
              }))}
              placeholder="Enter farm name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Village</Text>
            <TextInput
              style={styles.textInput}
              value={editData.farmDetails?.location?.village || ''}
              onChangeText={(value) => setEditData(prev => ({
                ...prev,
                farmDetails: {
                  ...prev.farmDetails,
                  location: { ...prev.farmDetails.location, village: value }
                }
              }))}
              placeholder="Enter village"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>District</Text>
            <TextInput
              style={styles.textInput}
              value={editData.farmDetails?.location?.district || ''}
              onChangeText={(value) => setEditData(prev => ({
                ...prev,
                farmDetails: {
                  ...prev.farmDetails,
                  location: { ...prev.farmDetails.location, district: value }
                }
              }))}
              placeholder="Enter district"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Farm Size (acres)</Text>
            <TextInput
              style={styles.textInput}
              value={editData.farmDetails?.farmSize?.toString() || ''}
              onChangeText={(value) => setEditData(prev => ({
                ...prev,
                farmDetails: { ...prev.farmDetails, farmSize: parseFloat(value) || 0 }
              }))}
              placeholder="Enter farm size"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Soil Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionChips}>
                {soilTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      editData.farmDetails?.soilType === type && styles.selectedChip
                    ]}
                    onPress={() => setEditData(prev => ({
                      ...prev,
                      farmDetails: { ...prev.farmDetails, soilType: type }
                    }))}
                  >
                    <Text style={[
                      styles.optionChipText,
                      editData.farmDetails?.soilType === type && styles.selectedChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Irrigation Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionChips}>
                {irrigationTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      editData.farmDetails?.irrigationType === type && styles.selectedChip
                    ]}
                    onPress={() => setEditData(prev => ({
                      ...prev,
                      farmDetails: { ...prev.farmDetails, irrigationType: type }
                    }))}
                  >
                    <Text style={[
                      styles.optionChipText,
                      editData.farmDetails?.irrigationType === type && styles.selectedChipText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d5016" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderProfileHeader()}
      {renderFarmDetails()}
      {renderStatistics()}
      {renderMenuItems()}
      {renderEditModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2d5016',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2d5016',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#2d5016',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  farmDetailsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  statisticsCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statisticItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  statisticValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  statisticLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  menuItemValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveText: {
    fontSize: 16,
    color: '#2d5016',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginVertical: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  optionChips: {
    flexDirection: 'row',
  },
  optionChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#2d5016',
  },
  optionChipText: {
    fontSize: 12,
    color: '#666',
  },
  selectedChipText: {
    color: 'white',
  },
});

export default ProfileScreen;
