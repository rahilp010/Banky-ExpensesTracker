/* eslint-disable prettier/prettier */
import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';

export const setupNotifications = async () => {
    await notifee.requestPermission();

    await notifee.createChannel({
        id: 'reminder',
        name: 'Daily Reminder',
        importance: AndroidImportance.HIGH,
    });
};

const createSchedule = async (hour, id) => {
    const date = new Date(Date.now());
    date.setHours(hour);
    date.setMinutes(0);
    date.setSeconds(0);

    if (date.getTime() < Date.now()) {
        date.setDate(date.getDate() + 1);
    }

    const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
    };

    const bodies = {
        11: "Good morning! ☀️ Don't forget to log your breakfast or commute expenses.",
        18: "Evening check-in! 🌇 How was your day? Log your lunch and travel spends.",
        23: "Day end review! 😴 Log any remaining transactions before sleep to stay in sync."
    };

    await notifee.createTriggerNotification(
        {
            id: `reminder-${hour}`,
            title: 'Banky Reminder 🕰️',
            body: bodies[hour] || 'Did you spend anything? Log your transactions now!',
            android: {
                channelId: 'reminder',
                pressAction: {
                    id: 'default',
                },
            },
        },
        trigger,
    );
};

export const scheduleAllReminders = async () => {
    await setupNotifications();
    
    // Clear existing triggers to avoid duplicates
    await notifee.cancelAllNotifications();

    // Schedule 11 AM, 6 PM (18), and 11 PM (23)
    const times = [11, 18, 23];
    for (const hour of times) {
        await createSchedule(hour, `reminder-${hour}`);
    }
};

export const triggerTestNotification = async () => {
    await setupNotifications();
    
    await notifee.displayNotification({
        title: 'Banky Test 🚀',
        body: 'This is a test notification from Banky!',
        android: {
            channelId: 'reminder',
            smallIcon: 'ic_launcher',
            pressAction: {
                id: 'default',
            },
        },
    });
};
