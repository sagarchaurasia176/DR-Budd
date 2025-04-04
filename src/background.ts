// function showNotification(problemText: any) {
//   // Create URL with problem text as parameter
//   const notificationUrl = chrome.runtime.getURL('notification.html') + 
//                          `?problem=${encodeURIComponent(problemText)}`;
  
//   // Create a new window
//   chrome.windows.create({
//     url: notificationUrl,
//     type: 'popup',
//     width: 350,
//     height: 250,
//     focused: true
//   });

//   // Optional: Also show the system notification
//   chrome.notifications.create({
//     type: 'basic',
//     iconUrl: 'icons/codeAnalyzer.png',
//     title: 'DSA Revision Buddy',
//     message: `Time to practice: ${problemText}`,
//     priority: 2
//   });
// }

// // Handle messages from popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("Message received:", request.type);
  
//   if (request.type === 'SET_NOTIFICATION') {
//     const alarmName = `notification_${request.problemText}`;
    
//     console.log(`Creating alarm for: ${alarmName} at ${new Date(request.notificationTime)}`);
    
//     chrome.alarms.create(alarmName, {
//       when: request.notificationTime
//     }, () => {
//       if (chrome.runtime.lastError) {
//         console.error("Alarm creation failed:", chrome.runtime.lastError);
//         sendResponse({ success: false, error: chrome.runtime.lastError });
//       } else {
//         console.log("Alarm created successfully");
//         sendResponse({ success: true });
//       }
//     });
    
//     return true; // Required to keep the message channel open for sendResponse
//   }
  
//   // Add this for testing notifications manually
//   if (request.type === 'TEST_NOTIFICATION') {
//     showNotification("Test notification working!");
//     sendResponse({ success: true });
//     return true;
//   }
// });

// // Add alarm listener to trigger notifications when alarms fire
// chrome.alarms.onAlarm.addListener((alarm) => {
//   console.log("Alarm triggered:", alarm.name);
  
//   if (alarm.name.startsWith('notification_')) {
//     // Extract problem text from alarm name
//     const problemText = alarm.name.substring('notification_'.length);
//     showNotification(problemText);
//   }
// });

// // Make sure service worker stays active (for Manifest V3)
// chrome.runtime.onInstalled.addListener(() => {
//   console.log("Extension installed/updated");
// });



// new version
function showNotification(problemText: string) {
  const notificationUrl = chrome.runtime.getURL('notification.html') +
    `?name=${encodeURIComponent(problemText)}&sound=beep.mp3&repeats=5&volume=1`;

  // Create a popup window
  chrome.windows.create({
    url: notificationUrl,
    type: 'popup',
    width: 350,
    height: 250,
    focused: true
  });

  // Also show system notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/codeAnalyzer.png',
    title: 'DSA Revision Buddy',
    message: `Time to practice: ${problemText}`,
    priority: 2
  });
}

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  // 🔁 Snooze logic
  if (request.method === 'set-alarm') {
    const name = request.name || `audio-${Date.now()}`;
    const when = request.info?.when || Date.now() + 5 * 60 * 1000; // fallback 5 min

    chrome.alarms.create(name, { when });

    sendResponse({ success: true });
    return true;
  }

  // ❌ User clicked "done" — remove notification window/audio
  if (request.method === 'remove-notification') {
    // Send a message to all views (like popup) to close if matching name
    chrome.runtime.sendMessage({
      method: 'remove-notification',
      name: request.name
    });
    sendResponse({ success: true });
    return true;
  }

  // ❌ User clicked "remove all"
  if (request.method === 'remove-all-notifications') {
    chrome.runtime.sendMessage({
      method: 'remove-all-notifications'
    });
    sendResponse({ success: true });
    return true;
  }

  // 🔄 Bring popup to front (optional)
  if (request.method === 'bring-to-front') {
    chrome.windows.getCurrent((window) => {
      if (window?.id) {
        chrome.windows.update(window.id, { focused: true });
      }
    });
    return true;
  }

  // 🧪 Test notification manually
  if (request.type === 'TEST_NOTIFICATION') {
    showNotification("Test notification working!");
    sendResponse({ success: true });
    return true;
  }

  // 🕓 Set a reminder from content/popup
  if (request.type === 'SET_NOTIFICATION') {
    const alarmName = `notification_${request.problemText}`;
    chrome.alarms.create(alarmName, { when: request.notificationTime });

    sendResponse({ success: true });
    return true;
  }
});

// ⏰ When the alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log("Alarm triggered:", alarm.name);

  if (alarm.name.startsWith('notification_')) {
    const problemText = decodeURIComponent(alarm.name.substring('notification_'.length));
    showNotification(problemText);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed/updated");
});
