import * as Notifications from 'expo-notifications';
import { subDays, isFuture } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRenewalReminder(
  serviceId: string,
  serviceName: string,
  category: string,
  renewalDate: Date,
  reminderDays: number,
): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;

  const triggerDate = subDays(renewalDate, reminderDays);
  if (!isFuture(triggerDate)) return;

  await Notifications.scheduleNotificationAsync({
    identifier: serviceId,
    content: {
      title: `${serviceName} renews soon`,
      body: `Your ${category} renews on ${renewalDate.toLocaleDateString()}`,
      data: { serviceId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

export async function cancelRenewalReminder(serviceId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(serviceId);
}
