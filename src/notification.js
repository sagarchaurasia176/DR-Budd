const args = new URLSearchParams(location.search);

// Send screen and window size + position to background
chrome.runtime.sendMessage({
  method: 'position',
  screen: {
    width: screen.width,
    height: screen.height
  },
  window: {
    width: window.outerWidth,
    height: window.outerHeight
  },
  position: args.get('position')
}, () => chrome.runtime.lastError);

// Update notification count in storage
chrome.storage.local.get(["notificationCount"]).then((result) => {
  const count = result.notificationCount || 0;
  chrome.storage.local.set({ 'notificationCount': count + 1 });
});

// Audio manager with proper user interaction handling
const audioManager = {
  audioElement: null,
  isPlaying: false,
  playCount: 0,
  maxPlays: Number(args.get('repeats')) || 5,
  volume: Number(args.get('volume')) || 1.0,
  userInteracted: false,

  init: function() {
    // Setup event listeners for user interaction
    document.addEventListener('click', this.handleFirstInteraction.bind(this));
    document.addEventListener('keydown', this.handleFirstInteraction.bind(this));
    document.addEventListener('touchstart', this.handleFirstInteraction.bind(this));
  },

  handleFirstInteraction: function() {
    if (!this.userInteracted) {
      this.userInteracted = true;
      this.play();
    }
  },

  play: function() {
    if (!this.userInteracted || this.isPlaying) return;

    this.audioElement = new Audio('/' + args.get('sound'));
    this.audioElement.volume = this.volume;
    this.isPlaying = true;
    this.playCount = 0;

    this.audioElement.addEventListener('ended', () => {
      this.playCount++;
      if (this.playCount < this.maxPlays) {
        this.audioElement.currentTime = 0;
        this.audioElement.play();
      } else {
        this.stop();
      }
    });

    this.audioElement.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  },

  stop: function() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    this.isPlaying = false;
  },

  toggleMute: function() {
    if (this.audioElement) {
      this.audioElement.muted = !this.audioElement.muted;
      return this.audioElement.muted;
    }
    return false;
  }
};

// Initialize audio manager
audioManager.init();

// Snooze button logic
document.getElementById('snooze').addEventListener('click', (e) => {
  e.stopPropagation();
  const buttonIndex = document.getElementById('range').selectedIndex + 1;

  audioManager.stop();
  
  chrome.runtime.sendMessage({
    method: 'set-alarm',
    name: 'audio-' + args.get('name') + '/' + buttonIndex,
    info: {
      when: Date.now() + buttonIndex * 5 * 60 * 1000
    }
  }, () => setTimeout(() => window.close(), 100));
});

// Close button
document.getElementById('done').addEventListener('click', (e) => {
  e.stopPropagation();
  audioManager.stop();
  window.close();
});

// Mute button (if you have one)
if (document.getElementById('mute')) {
  document.getElementById('mute').addEventListener('click', (e) => {
    e.stopPropagation();
    const isMuted = audioManager.toggleMute();
    e.target.textContent = isMuted ? '🔈' : '🔊';
  });
}

// Bring popup to front if it loses focus
window.onblur = () => setTimeout(() => chrome.runtime.sendMessage({
  method: 'bring-to-front'
}, () => chrome.runtime.lastError), 100);

// Listen for messages to close
chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'remove-notification' && request.name === args.get('name')) {
    audioManager.stop();
    response(true);
    window.close();
  } else if (request.method === 'remove-all-notifications') {
    audioManager.stop();
    window.close();
  }
});

// Persist snooze dropdown index
document.getElementById('range').addEventListener('change', (e) => {
  chrome.storage.local.set({
    'range-index': e.target.selectedIndex
  });
});

chrome.storage.local.get({
  'range-index': 0
}, (prefs) => {
  document.getElementById('range').selectedIndex = prefs['range-index'];
});