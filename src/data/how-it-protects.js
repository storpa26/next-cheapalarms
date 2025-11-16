const brandTeal = "#0DC5C7";
const brandPink = "#F78AB3";

export const protectionDevices = [
  {
    id: "motion",
    name: "Motion Sensors",
    icon: "👁️",
    position: "top-1/4 left-1/4",
    description: '"Eyes" that see movement when no one should be home. Some can even send a photo.',
    color: brandTeal,
  },
  {
    id: "door",
    name: "Door Contacts",
    icon: "🚪",
    position: "top-1/2 right-1/4",
    description: "Little magnet on the door that knows if it is opened.",
    color: brandTeal,
  },
  {
    id: "outdoor",
    name: "Outdoor Detector",
    icon: "🔍",
    position: "bottom-1/3 left-1/3",
    description: "Watchdog in the yard. Sees someone before they reach the door.",
    color: brandPink,
    highlight: true,
  },
  {
    id: "siren",
    name: "Sirens",
    icon: "📢",
    position: "top-1/3 right-1/3",
    description: "Big shouty boxes that scare wolves and wake neighbours.",
    color: brandTeal,
  },
  {
    id: "keypad",
    name: "Keypad/Keyfob",
    icon: "📱",
    position: "bottom-1/4 right-1/4",
    description: 'How the Pig tells the system "I\'m leaving now" or "I\'m back home".',
    color: brandTeal,
  },
];

