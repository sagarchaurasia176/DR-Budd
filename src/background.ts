// background.ts
interface Reminder {
  id: number;
  time: number;
  message: string;
  frequency: 'once' | 'daily' | 'weekly';
  selectedDays?: number[];
}

// Initialize storage and check for existing reminders
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['leetcodeReminders'], (result) => {
    if (!result.leetcodeReminders) {
      chrome.storage.local.set({ leetcodeReminders: [] });
    } else {
      // Reschedule any existing reminders
      result.leetcodeReminders.forEach((reminder: Reminder) => {
        scheduleReminder(reminder);
      });
    }
  });
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SET_REMINDER':
      scheduleReminder(request.reminder).then(success => {
        sendResponse({ success });
      });
      return true;
      
    case 'CHECK_REMINDERS':
      chrome.storage.local.get(['leetcodeReminders'], (result) => {
        const reminders: Reminder[] = result.leetcodeReminders || [];
        const now = Date.now();
        const hasActive = reminders.some((r: Reminder) => 
          r.frequency !== 'once' || r.time > now
        );
        sendResponse({ hasActiveReminders: hasActive });
      });
      return true;
  }
});

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('leetcode-reminder-')) {
    const reminderId = parseInt(alarm.name.replace('leetcode-reminder-', ''), 10);
    
    chrome.storage.local.get(['leetcodeReminders'], (result) => {
      const reminders = result.leetcodeReminders || [];
      const reminder = reminders.find((r: Reminder) => r.id === reminderId);
      
      if (reminder) {
        showNotification(reminder.message);
        
        // For once-only reminders, remove after triggering
        if (reminder.frequency === 'once') {
          const updatedReminders = reminders.filter((r: Reminder) => r.id !== reminderId);
          chrome.storage.local.set({ leetcodeReminders: updatedReminders });
        }
      }
    });
  }
});

function showNotification(message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/clock.png'),
    title: 'LeetCode Reminder',
    message: message,
    priority: 2
  });
}

function scheduleReminder(reminder: Reminder): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['leetcodeReminders'], (result) => {
      let reminders = result.leetcodeReminders || [];
      
      // Check if this reminder already exists
      const existingIndex = reminders.findIndex((r: Reminder) => r.id === reminder.id);
      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push(reminder);
      }
      
      chrome.storage.local.set({ leetcodeReminders: reminders });

      const alarmInfo: chrome.alarms.AlarmCreateInfo = {
        when: reminder.time
      };

      if (reminder.frequency === 'daily') {
        alarmInfo.periodInMinutes = 24 * 60;
      } else if (reminder.frequency === 'weekly') {
        alarmInfo.periodInMinutes = 7 * 24 * 60;
      }

      chrome.alarms.create(`leetcode-reminder-${reminder.id}`, alarmInfo);
      resolve(true);
    });
  });
}

// Notification click handlers
chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'https://leetcode.com/problemset/all/' });
});