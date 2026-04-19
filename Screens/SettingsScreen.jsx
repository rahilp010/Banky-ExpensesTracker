import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../Components/ThemeContext';
import {useNotification} from '../Components/NotificationContext';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import {closeDatabase} from '../Components/db';
import {version} from '../package.json';
import Animated, {FadeInDown} from 'react-native-reanimated';
import ThemeTransitionOverlay from '../Components/ThemeTransitionOverlay';

const SettingsScreen = () => {
  const {isDarkMode, toggleTheme, colors} = useTheme();
  const {showNotification} = useNotification();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const showMessage = (message, type = 'info', title = 'Settings') => {
    showNotification({title, message, type});
  };

  const handleThemeToggle = () => {
    setIsTransitioning(true);
    toggleTheme();
  };

  const handleExport = async () => {
    try {
      const dbName = 'transactions.db';
      const dbPath =
        Platform.OS === 'android'
          ? `/data/data/com.banky/databases/${dbName}`
          : `${RNFS.LibraryDirectoryPath}/LocalDatabase/${dbName}`;

      const exists = await RNFS.exists(dbPath);
      if (!exists) {
        showMessage('Database file not found.', 'warning', 'Alert');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const destPath = `${
        Platform.OS === 'android'
          ? RNFS.DownloadDirectoryPath
          : RNFS.DocumentDirectoryPath
      }/Banky_Backup_${timestamp}.db`;

      await RNFS.copyFile(dbPath, destPath);
      showMessage(
        `Exported to ${
          Platform.OS === 'android' ? 'Downloads' : 'Documents'
        } folder.`,
        'success',
        'Success',
      );
    } catch (error) {
      console.log('Export error:', error);
      showMessage('Export failed.', 'error', 'Oops!');
    }
  };

  const handleImport = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const pickedFile = res[0];
      if (!pickedFile.name.endsWith('.db')) {
        showMessage('Please select a valid .db file.', 'warning', 'Alert');
        return;
      }

      const dbName = 'transactions.db';
      const dbPath =
        Platform.OS === 'android'
          ? `/data/data/com.banky/databases/${dbName}`
          : `${RNFS.LibraryDirectoryPath}/LocalDatabase/${dbName}`;

      if (Platform.OS === 'android') {
        const dbDir = '/data/data/com.banky/databases';
        const dirExists = await RNFS.exists(dbDir);
        if (!dirExists) {
          await RNFS.mkdir(dbDir);
        }
      }

      const fileContent = await RNFS.readFile(pickedFile.uri, 'base64');
      await closeDatabase();
      await RNFS.writeFile(dbPath, fileContent, 'base64');

      showMessage(
        'Database has been imported. Please restart the app for changes to take effect.',
        'success',
        'Import Successful',
      );
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.log('Import error:', err);
        showMessage('Import failed.', 'error', 'Oops!');
      }
    }
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    color,
  }) => (
    <Pressable
      style={[
        styles.settingRow,
        {
          borderBottomColor: isDarkMode
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
        },
      ]}
      onPress={onPress}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              color ||
              (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
          },
        ]}>
        <Icon
          name={icon}
          size={22}
          color={isDarkMode ? '#CBD5E1' : '#475569'}
        />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, {color: colors.text}]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, {color: colors.textMuted}]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: colors.background}]}>
      {isTransitioning && (
        <ThemeTransitionOverlay
          isDarkMode={isDarkMode}
          onAnimationComplete={() => setIsTransitioning(false)}
        />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.headerTitle, {color: colors.text}]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, {color: colors.textMuted}]}>
            Customize your app experience and manage your data.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>
            PREFERENCES
          </Text>
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <SettingItem
              icon="palette"
              title="Dark Mode"
              subtitle="Switch between light and dark themes"
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={handleThemeToggle}
                  trackColor={{false: '#767577', true: '#3B82F6'}}
                  thumbColor={isDarkMode ? '#F8FAFC' : '#f4f3f4'}
                />
              }
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>
            DATA MANAGEMENT
          </Text>
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <SettingItem
              icon="cloud-download"
              title="Import Database"
              subtitle="Restore data from a backup file"
              onPress={handleImport}
            />
            <SettingItem
              icon="cloud-upload"
              title="Export Database"
              subtitle="Backup your data to local storage"
              onPress={handleExport}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>
            ABOUT
          </Text>
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <SettingItem
              icon="info"
              title="Version"
              subtitle={`Current app version: v${version}`}
            />
            <SettingItem
              icon="description"
              title="Banky Expense Tracker"
              subtitle="A premium, simple, and powerful way to track your daily consumption."
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
});

export default SettingsScreen;
