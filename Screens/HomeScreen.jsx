/* eslint-disable prettier/prettier */
import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {trigger} from 'react-native-haptic-feedback';
import Animated, {FadeInDown} from 'react-native-reanimated';
import DonutChart from '../Components/AnimatedPieChart';
import {useTheme} from '../Components/ThemeContext';
import ThemeTransitionOverlay from '../Components/ThemeTransitionOverlay';
import {triggerTestNotification} from '../Components/NotificationService';
import {
  addTransaction,
  clearTransactions,
  getDashboardSummary,
  getTransactions,
} from '../Components/db';
import {version} from '../package.json';

const transactionOptions = [
  {name: 'Deposit', type: 'income', icon: 'south-west', accent: '#A7F3D0'},
  {name: 'Salary', type: 'salary', icon: 'payments', accent: '#BFDBFE'},
  {name: 'Fuel', type: 'petrol', icon: 'local-gas-station', accent: '#FDE68A'},
  {name: 'Dining', type: 'food', icon: 'restaurant', accent: '#FBCFE8'},
  {name: 'Savings', type: 'savings', icon: 'savings', accent: '#C4B5FD'},
  {name: 'Other', type: 'other', icon: 'category', accent: '#FCA5A5'},
];

const notificationOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const showMessage = message => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert('Banky', message);
};

const formatCurrency = value =>
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

const formatDate = value =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const HomeScreen = () => {
  const navigation = useNavigation();
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    transactionCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const {isDarkMode, toggleTheme, colors} = useTheme();
  const [selectedItem, setSelectedItem] = useState(transactionOptions[0]);
  const [formValue, setFormValue] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isQuickEntry, setIsQuickEntry] = useState(false);

  // Initialize to the first day of the current month
  const [selectedReportMonth, setSelectedReportMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  });

  const handleThemeToggle = () => {
    setIsTransitioning(true);
    toggleTheme();
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboard, recent, transactions] = await Promise.all([
        getDashboardSummary(),
        getTransactions({limit: 5}),
        getTransactions(),
      ]);

      setSummary(dashboard);
      setRecentTransactions(recent);
      setAllTransactions(transactions);
    } catch (error) {
      console.log('Dashboard load error:', error);
      showMessage('Unable to refresh your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadDashboard);
    return unsubscribe;
  }, [navigation]);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label:
          i === 0
            ? 'This Month'
            : d.toLocaleDateString('en-IN', {month: 'long'}),
        value: d.toISOString(),
        short:
          i === 0 ? 'Current' : d.toLocaleDateString('en-IN', {month: 'short'}),
      });
    }
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState('');

  // Updated to filter by the specific selected report month
  const reportData = useMemo(() => {
    const targetDate = new Date(selectedReportMonth);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const filteredTransactions = allTransactions.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === targetMonth &&
        itemDate.getFullYear() === targetYear
      );
    });

    const categories = transactionOptions.reduce((accumulator, item) => {
      accumulator[item.type] = filteredTransactions
        .filter(entry => entry.type === item.type)
        .reduce((total, entry) => total + Number(entry.amount), 0);
      return accumulator;
    }, {});

    const now = new Date();
    const spentToday = allTransactions
      .filter(item => {
        const itemDate = new Date(item.date);
        return (
          itemDate.toDateString() === now.toDateString() &&
          ['petrol', 'food', 'other'].includes(item.type)
        );
      })
      .reduce((total, item) => total + Number(item.amount), 0);

    return {
      categories,
      spentToday,
    };
  }, [allTransactions, selectedReportMonth]);

  const handleOpenEntry = (item, isQuick = false) => {
    setSelectedItem(item);
    setIsQuickEntry(isQuick);
    setFormValue('');
    const now = new Date();
    setSelectedMonth(
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    );
    setModalVisible(true);
  };

  const handleAddTransaction = async () => {
    const amount = parseFloat(formValue);

    if (!amount || amount <= 0) {
      showMessage('Enter a valid amount.');
      return;
    }

    try {
      // Use the middle of the selected month to ensure it falls within the correct month range
      const date = new Date(selectedMonth);
      date.setDate(15);

      await addTransaction({
        amount,
        type: selectedItem.type,
        date: date.toISOString(),
      });
      trigger('notificationSuccess', notificationOptions);
      setModalVisible(false);
      await loadDashboard();
      showMessage(`${selectedItem.name} saved.`);
    } catch (error) {
      console.log('Add transaction error:', error);
      trigger('notificationError', notificationOptions);
      showMessage('Unable to save this entry.');
    }
  };

  const handleReset = async () => {
    if (resetPin !== '1009') {
      trigger('notificationError', notificationOptions);
      showMessage('Incorrect PIN.');
      return;
    }

    try {
      await clearTransactions();
      trigger('impactHeavy', notificationOptions);
      setResetVisible(false);
      setResetPin('');
      await loadDashboard();
      showMessage('All entries cleared.');
    } catch (error) {
      console.log('Reset error:', error);
      showMessage('Unable to clear entries.');
    }
  };

  const statItems = [
    {label: 'Income', value: summary.income, bg: '#132238'},
    {label: 'Expense', value: summary.expenses, bg: '#241C2D'},
    {label: 'Savings', value: summary.savings, bg: '#162A26'},
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {isTransitioning && (
        <ThemeTransitionOverlay
          isDarkMode={isDarkMode}
          onAnimationComplete={() => setIsTransitioning(false)}
        />
      )}

      <ScrollView
        style={[styles.container, {backgroundColor: colors.background}]}
        contentContainerStyle={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.topHeader}>
          <Text style={[styles.appTitle, {color: colors.text}]}>Banky</Text>
          <View style={styles.headerIcons}>
            <Pressable
              style={[
                styles.iconButton,
                {backgroundColor: colors.iconBackground},
              ]}
              onPress={handleThemeToggle}>
              <Icon
                name={isDarkMode ? 'light-mode' : 'dark-mode'}
                size={24}
                color={colors.text}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconButton,
                {backgroundColor: colors.iconBackground},
              ]}
              onPress={() => navigation.navigate('TransactionHistoryScreen')}>
              <Icon name="history" size={24} color={colors.text} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={
              isDarkMode
                ? ['#10233D', '#0C1729', '#08101B']
                : ['#E2E8F0', '#F1F5F9', '#F8FAFC']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.heroCard,
              !isDarkMode && {borderWidth: 1, borderColor: colors.border},
            ]}>
            <Text style={[styles.balanceLabel, {color: colors.textMuted}]}>
              Available balance
            </Text>
            <Text style={[styles.balanceValue, {color: colors.text}]}>
              {formatCurrency(summary.balance)}
            </Text>

            <View style={styles.heroMetaRow}>
              <View>
                <Text style={[styles.metaLabel, {color: colors.textMuted}]}>
                  Entries logged
                </Text>
                <Text style={[styles.metaValue, {color: colors.text}]}>
                  {summary.transactionCount}
                </Text>
              </View>
              <View>
                <Text style={[styles.metaLabel, {color: colors.textMuted}]}>
                  Spent today
                </Text>
                <Text style={[styles.metaValue, {color: colors.text}]}>
                  {formatCurrency(reportData.spentToday)}
                </Text>
              </View>
            </View>

            <View style={styles.heroActions}>
              <Pressable
                style={[
                  styles.primaryAction,
                  {backgroundColor: colors.buttonBackground},
                ]}
                onPress={() => handleOpenEntry(transactionOptions[0], false)}>
                <Icon
                  name="add"
                  size={18}
                  color={isDarkMode ? '#0B1220' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.primaryActionText,
                    {color: isDarkMode ? '#0B1220' : '#FFFFFF'},
                  ]}>
                  New entry
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.secondaryAction,
                  {
                    borderColor: isDarkMode
                      ? 'rgba(217, 231, 255, 0.2)'
                      : 'rgba(15, 23, 42, 0.1)',
                  },
                ]}
                onLongPress={() => setResetVisible(true)}>
                <Icon
                  name="lock-reset"
                  size={18}
                  color={isDarkMode ? '#D9E7FF' : colors.text}
                />
                <Text
                  style={[
                    styles.secondaryActionText,
                    {color: isDarkMode ? '#D9E7FF' : colors.text},
                  ]}>
                  Hold to reset
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.statsGrid}>
          {statItems.map((item, index) => {
            const isLastOdd =
              index === statItems.length - 1 && statItems.length % 2 !== 0;
            const cardBg = isDarkMode ? item.bg : '#FFFFFF';
            return (
              <View
                key={item.label}
                style={[
                  styles.statCardGrid,
                  {
                    backgroundColor: cardBg,
                    width: isLastOdd ? '100%' : '48%',
                    borderWidth: isDarkMode ? 0 : 1,
                    borderColor: colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.statLabel,
                    {color: isDarkMode ? '#CBD5E1' : colors.textMuted},
                  ]}>
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    {color: isDarkMode ? '#FFFFFF' : colors.text},
                  ]}>
                  {formatCurrency(item.value)}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Quick entry
          </Text>
          <Text style={[styles.sectionHint, {color: colors.textMuted}]}>
            Log income, spending, and savings from one place.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.grid}>
          {transactionOptions.map(item => (
            <Pressable
              key={item.type}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.surface,
                  borderWidth: isDarkMode ? 0 : 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleOpenEntry(item, true)}>
              <View style={[styles.iconBadge, {backgroundColor: item.accent}]}>
                <Icon name={item.icon} size={20} color="#0F172A" />
              </View>
              <Text style={[styles.gridTitle, {color: colors.text}]}>
                {item.name}
              </Text>
              <Text style={[styles.gridSubtitle, {color: colors.textMuted}]}>
                Tap to add amount
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Report
            </Text>
            <Text style={[styles.sectionHint, {color: colors.textMuted}]}>
              Monthly spending breakdown.
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={[
            styles.reportCard,
            {
              backgroundColor: colors.surface,
              borderWidth: isDarkMode ? 0 : 1,
              borderColor: colors.border,
            },
          ]}>
          {/* Three Selection Pills */}
          <View
            style={[
              styles.reportPillContainer,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}>
            {monthOptions.map(m => {
              const isSelected = selectedReportMonth === m.value;
              return (
                <Pressable
                  key={m.value}
                  style={[
                    styles.reportMonthPill,
                    isSelected && {backgroundColor: colors.buttonBackground},
                  ]}
                  onPress={() => setSelectedReportMonth(m.value)}>
                  <Text
                    style={[
                      styles.reportMonthText,
                      isSelected
                        ? {color: isDarkMode ? '#0B1220' : '#FFFFFF'}
                        : {color: colors.textMuted},
                    ]}>
                    {m.short}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <DonutChart
            data={transactionOptions
              .map(t => ({
                ...t,
                value: reportData.categories[t.type] || 0,
                color: t.accent,
              }))
              .filter(t => t.value > 0)}
            total={Object.values(reportData.categories).reduce(
              (a, b) => a + (Number(b) || 0),
              0,
            )}
          />
          <View style={{marginTop: 16}}>
            {transactionOptions.map(item => (
              <View
                key={item.type}
                style={[
                  styles.reportRow,
                  {
                    borderBottomColor: isDarkMode
                      ? 'rgba(148, 163, 184, 0.12)'
                      : 'rgba(15, 23, 42, 0.05)',
                  },
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: item.accent,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={[
                      styles.reportLabel,
                      {color: isDarkMode ? '#CBD5E1' : '#475569'},
                    ]}>
                    {item.name}
                  </Text>
                </View>
                <Text style={[styles.reportValue, {color: colors.text}]}>
                  {formatCurrency(reportData.categories[item.type])}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Recent activity
          </Text>
          <Text style={[styles.sectionHint, {color: colors.textMuted}]}>
            {loading ? 'Refreshing entries...' : 'Latest five transactions.'}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(900).duration(500)}
          style={[
            styles.listCard,
            {
              backgroundColor: colors.surface,
              borderWidth: isDarkMode ? 0 : 1,
              borderColor: colors.border,
            },
          ]}>
          {recentTransactions.length === 0 ? (
            <Text style={[styles.emptyState, {color: colors.textMuted}]}>
              No entries yet. Start by adding your first amount.
            </Text>
          ) : (
            recentTransactions.map(item => (
              <View
                key={item.id}
                style={[
                  styles.listRow,
                  {
                    borderBottomColor: isDarkMode
                      ? 'rgba(148, 163, 184, 0.12)'
                      : 'rgba(15, 23, 42, 0.05)',
                  },
                ]}>
                <View>
                  <Text style={[styles.listTitle, {color: colors.text}]}>
                    {item.type.toUpperCase()}
                  </Text>
                  <Text
                    style={[styles.listSubtitle, {color: colors.textMuted}]}>
                    {formatDate(item.date)}
                  </Text>
                </View>
                <Text style={[styles.listAmount, {color: colors.text}]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          )}
        </Animated.View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, {color: colors.textMuted}]}>v{version}</Text>
        </View>
      </ScrollView>

      {/* FIXED NEW ENTRY MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCardEnhanced,
              {backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF'},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleEnhanced, {color: colors.text}]}>
                New entry
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 20}}>
              <Text style={[styles.modalLabel, {color: colors.textMuted}]}>
                Select period
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.pillContainer,
                  {marginBottom: 10},
                ]}>
                {monthOptions.map(m => (
                  <Pressable
                    key={m.value}
                    onPress={() => setSelectedMonth(m.value)}
                    style={[
                      styles.monthPill,
                      {borderColor: colors.border},
                      selectedMonth === m.value && {
                        backgroundColor: colors.buttonBackground,
                        borderColor: colors.buttonBackground,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        {color: colors.text},
                        selectedMonth === m.value && {
                          color: isDarkMode ? '#0B1220' : '#FFFFFF',
                        },
                      ]}>
                      {m.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {!isQuickEntry && (
                <>
                  <Text
                    style={[
                      styles.modalLabel,
                      {color: colors.textMuted, marginTop: 14},
                    ]}>
                    Entry type
                  </Text>
                  <View style={[styles.pillContainer, {flexWrap: 'wrap'}]}>
                    {transactionOptions.map(item => {
                      const isSelected = selectedItem.type === item.type;
                      return (
                        <Pressable
                          key={item.type}
                          onPress={() => setSelectedItem(item)}
                          style={[
                            styles.typePill,
                            {borderColor: item.accent},
                            isSelected && {backgroundColor: item.accent},
                          ]}>
                          <Icon
                            name={item.icon}
                            size={16}
                            color={isSelected ? '#0F172A' : item.accent}
                            style={{marginRight: 6}}
                          />
                          <Text
                            style={[
                              styles.pillText,
                              {color: item.accent},
                              isSelected && {color: '#0F172A'},
                            ]}>
                            {item.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={[styles.modalLabel, {color: colors.textMuted}]}>
                How much?
              </Text>
              <View
                style={[
                  styles.amountContainer,
                  {borderBottomColor: colors.border},
                ]}>
                <Text style={[styles.currencySign, {color: colors.text}]}>
                  Rs
                </Text>
                <TextInput
                  value={formValue}
                  onChangeText={setFormValue}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.amountInputEnhanced, {color: colors.text}]}
                  autoFocus
                />
              </View>

              <Pressable
                style={[
                  styles.modalPrimaryAction,
                  {backgroundColor: colors.buttonBackground},
                ]}
                onPress={handleAddTransaction}>
                <Text
                  style={[
                    styles.modalPrimaryTextEnhanced,
                    {color: isDarkMode ? '#0B1220' : '#FFFFFF'},
                  ]}>
                  Confirm and save
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={resetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}>
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: isDarkMode
                ? 'rgba(3, 7, 18, 0.72)'
                : 'rgba(15, 23, 42, 0.4)',
            },
          ]}>
          <View
            style={[
              styles.resetCard,
              {backgroundColor: isDarkMode ? '#111827' : colors.surface},
            ]}>
            <Text style={[styles.resetTitle, {color: colors.text}]}>
              Reset all data
            </Text>
            <Text style={[styles.resetSubtitle, {color: colors.textMuted}]}>
              Enter the 4-digit PIN to delete every transaction.
            </Text>
            <TextInput
              value={resetPin}
              onChangeText={setResetPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="PIN"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.pinInput,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(148, 163, 184, 0.12)'
                    : 'rgba(15, 23, 42, 0.05)',
                  color: colors.text,
                },
              ]}
            />
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Delete everything</Text>
            </Pressable>
            <Pressable
              style={styles.modalSecondary}
              onPress={() => setResetVisible(false)}>
              <Text
                style={[styles.modalSecondaryText, {color: colors.textMuted}]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 20,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    color: '#E2E8F0',
    fontSize: 17,
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
  },
  primaryAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryActionText: {
    color: '#0B1220',
    fontWeight: '800',
    marginLeft: 8,
  },
  secondaryAction: {
    paddingHorizontal: 16,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 231, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryActionText: {
    color: '#D9E7FF',
    fontWeight: '700',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 12,
  },
  statCardGrid: {
    borderRadius: 20,
    padding: 16,
  },
  statLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  /* NEW REPORT PILLS STYLES */
  reportPillContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  reportMonthPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  reportMonthText: {
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHint: {
    color: '#94A3B8',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#0D192B',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gridTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  gridSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  reportCard: {
    backgroundColor: '#0D192B',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  reportLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  reportValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: '#0D192B',
    borderRadius: 24,
    padding: 18,
  },
  emptyState: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 18,
    lineHeight: 22,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  listTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  listSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  listAmount: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },

  /* MODAL UPDATES FOR CENTERED LAYOUT */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCardEnhanced: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32, // Fixed: Makes it fully rounded and centered
    padding: 24,
    maxHeight: '90%', // Fixed: Allows scroll to actually kick in
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },

  resetCard: {
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 24,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  amountInput: {
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    fontSize: 34,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '800',
    paddingVertical: 18,
    marginBottom: 16,
  },
  modalPrimary: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 15,
  },
  modalSecondary: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 15,
  },
  pinInput: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderRadius: 18,
    fontSize: 28,
    color: '#F8FAFC',
    textAlign: 'center',
    fontWeight: '800',
    paddingVertical: 16,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#FFF7ED',
    fontWeight: '800',
    fontSize: 15,
  },
  resetTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  resetSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleEnhanced: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    marginBottom: 32,
    paddingVertical: 10,
  },
  currencySign: {
    fontSize: 28,
    fontWeight: '800',
    marginRight: 10,
  },
  amountInputEnhanced: {
    fontSize: 42,
    fontWeight: '800',
    flex: 1,
    padding: 0,
  },
  modalPrimaryAction: {
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalPrimaryTextEnhanced: {
    fontSize: 16,
    fontWeight: '800',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
});

export default HomeScreen;
