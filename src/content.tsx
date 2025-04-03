// content.tsx - Enhanced LeetCode Reminder Extension with Persistent Reminders
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../App.css';

// Timer Icon Component
const TimerIcon: React.FC<{ onClick: () => void, hasActiveReminders: boolean }> = ({ onClick, hasActiveReminders }) => {
  return (
    <div 
      className="timer-icon" 
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#2cce9f',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      {hasActiveReminders && (
        <div style={{
          position: 'absolute',
          bottom: '-5px',
          right: '-5px',
          backgroundColor: '#ff4757',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          !
        </div>
      )}
    </div>
  );
};

// Confirmation Popup Component
const ConfirmationPopup: React.FC<{ 
  onClose: () => void, 
  reminderDetails: { time: string, message: string, frequency: string } 
}> = ({ onClose, reminderDetails }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div style={{ marginBottom: '20px' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.86" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>Reminder Set Successfully!</h2>
        
        <div className="reminder-details">
          <div className="detail-row">
            <span className="detail-label">Message:</span>
            <span className="detail-value">{reminderDetails.message}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time:</span>
            <span className="detail-value">{reminderDetails.time}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Frequency:</span>
            <span className="detail-value" style={{ textTransform: 'capitalize' }}>{reminderDetails.frequency}</span>
          </div>
        </div>
        
        <button className="confirmation-button" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
};

// Reminder Popup Component
const ReminderPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState('Solve LeetCode problems');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly'>('once');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    time: '',
    message: '',
    frequency: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const daysOfWeek = [
    { id: 0, name: 'Sun' },
    { id: 1, name: 'Mon' },
    { id: 2, name: 'Tue' },
    { id: 3, name: 'Wed' },
    { id: 4, name: 'Thu' },
    { id: 5, name: 'Fri' },
    { id: 6, name: 'Sat' }
  ];

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId) 
        : [...prev, dayId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reminderTime = new Date(`${date}T${time}`).getTime();
      const now = Date.now();
      
      if (reminderTime < now && frequency === 'once') {
        alert('Please select a future time for your reminder');
        return;
      }
      
      if (frequency === 'weekly' && selectedDays.length === 0) {
        alert('Please select at least one day for weekly reminders');
        return;
      }
      
      const formattedTime = new Date(`${date}T${time}`).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const reminderObj = {
        time: reminderTime,
        message: reminder,
        frequency,
        selectedDays: frequency === 'weekly' ? selectedDays : [],
        id: Date.now()
      };
      
      // Send to background script
      const response = await new Promise<{ success: boolean }>(resolve => {
        chrome.runtime.sendMessage({
          type: 'SET_REMINDER',
          reminder: reminderObj
        }, resolve);
      });
      
      if (response.success) {
        setConfirmationDetails({
          time: formattedTime,
          message: reminder,
          frequency
        });
        setShowConfirmation(true);
      } else {
        alert('Failed to set reminder. Please try again.');
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      alert('An error occurred while setting the reminder');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Set default time to tomorrow at 9 AM
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('09:00');
  }, []);
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <div className="header-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>LeetCode Practice Reminder</h2>
          </div>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reminder Message</label>
            <textarea 
              value={reminder} 
              onChange={(e) => setReminder(e.target.value)}
              rows={2}
              required
              placeholder="E.g. Solve 2 LeetCode problems"
            />
          </div>
          
          <div className="form-group">
            <label>Frequency</label>
            <div className="frequency-options">
              {['once', 'daily', 'weekly'].map((freq) => (
                <label key={freq} className="frequency-option">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={() => setFrequency(freq as 'once' | 'daily' | 'weekly')}
                  />
                  <span>{freq.charAt(0).toUpperCase() + freq.slice(1)}</span>
                </label>
              ))}
            </div>
            
            {frequency === 'weekly' && (
              <div className="weekly-days">
                <div className="days-label">Repeat on:</div>
                <div className="days-grid">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`day-button ${selectedDays.includes(day.id) ? 'selected' : ''}`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="time-inputs">
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Time</label>
              <input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              'Setting...'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Set Reminder
              </>
            )}
          </button>
        </form>
        
        <div className="footer-note">
          <p>You'll receive a browser notification at the scheduled time.</p>
          <p>Your reminders are saved in Chrome's storage and persist across sessions.</p>
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup 
          onClose={() => {
            setShowConfirmation(false);
            onClose();
          }} 
          reminderDetails={confirmationDetails} 
        />
      )}
    </div>
  );
};

// Main App Component
const LeetCodeReminderApp = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasActiveReminders, setHasActiveReminders] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  
  useEffect(() => {
    // Initial check for reminders
    checkReminders();
    
    // Set up storage change listener
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.leetcodeReminders) {
        const hasActive = changes.leetcodeReminders.newValue?.some((r: any) => 
          r.frequency !== 'once' || r.time > Date.now()
        );
        setHasActiveReminders(!!hasActive);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    
    // Check reminders periodically
    const interval = setInterval(checkReminders, 60000);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  const checkReminders = () => {
    chrome.runtime.sendMessage({ type: 'CHECK_REMINDERS' }, (response) => {
      if (response?.hasActiveReminders) {
        setHasActiveReminders(true);
      } else {
        setHasActiveReminders(false);
      }
    });
  };
  
  const requestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        // Test notification
        new Notification('LeetCode Reminder', {
          body: 'Notifications are now enabled!',
          icon: chrome.runtime.getURL('icons/clock.png')
        });
      }
    });
  };
  
  return (
    <>
      <TimerIcon onClick={() => setShowPopup(true)} hasActiveReminders={hasActiveReminders} />
      {showPopup && <ReminderPopup onClose={() => setShowPopup(false)} />}
      
      {notificationPermission !== 'granted' && (
        <div className="notification-permission-banner">
          <div className="banner-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="#2cce9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>Enable Notifications</h3>
          </div>
          <p>Allow notifications to receive your LeetCode reminders.</p>
          <button onClick={requestNotificationPermission}>
            Allow Notifications
          </button>
        </div>
      )}
    </>
  );
};

// Check if we're on LeetCode website
const isLeetCodeSite = () => {
  return window.location.hostname.includes('leetcode.com');
};

// Add global styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .timer-icon {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #2cce9f;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .timer-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  }
  
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(3px);
  }
  
  .popup-content {
    width: 420px;
    max-width: 90vw;
    background-color: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    font-family: 'Inter', system-ui, sans-serif;
    animation: fadeIn 0.3s ease-out;
  }
  
  /* Additional CSS classes for the components */
  .reminder-details {
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    text-align: left;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 8px;
  }
  
  .detail-label {
    flex: 0 0 100px;
    color: #718096;
    font-weight: 500;
  }
  
  .detail-value {
    color: #2d3748;
  }
  
  .confirmation-button {
    background-color: #2cce9f;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    font-size: 16px;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  /* Add more styles as needed for other components */
`;
document.head.appendChild(styleElement);

// Initialize the app if we're on LeetCode
if (isLeetCodeSite()) {
  const container = document.createElement('div');
  container.id = 'leetcode-reminder-extension';
  document.body.appendChild(container);
  
  const root = ReactDOM.createRoot(container);
  root.render(<LeetCodeReminderApp />);
}

export default LeetCodeReminderApp;