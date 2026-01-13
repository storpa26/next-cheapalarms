import { Product } from '../types/paradox-calculator';

// Product images - using placeholder paths for now
// TODO: Add actual product images to public/assets/products/

export const paradoxProducts: Product[] = [
  // Control Panel
  {
    id: 'mg5050',
    code: 'MG5050+',
    name: 'Magellan 5050+ Control Panel',
    category: 'panel',
    description: 'The brain of your security system – everything connects here.',
    fullDescription: 'The MG5050+ is the heart of your Paradox security system. It coordinates all your sensors, keypads, and sirens to keep your property protected around the clock. Designed and built in Canada with reliability in mind.',
    features: [
      'Manages up to 32 wireless zones',
      'Works with any Magellan keypad or remote',
      'Built-in scheduling for automatic arm/disarm',
      'Canadian-made quality you can trust',
    ],
    whenToUse: 'Every Paradox Magellan system needs exactly one control panel – it\'s the foundation of your security.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: 'Required for every system',
    isRequired: true,
    image: '/assets/products/MG5050.jpg',
  },

  // Keypads
  {
    id: 'k38',
    code: 'K38',
    name: 'K38 Wireless LED Keypad',
    category: 'keypad',
    description: 'Battery-powered freedom – install anywhere without running wires.',
    fullDescription: 'The K38 gives you total flexibility. Since it runs on batteries, you can mount it wherever makes sense for you – no electrician needed. Simple LED display shows you everything you need to know.',
    features: [
      'Completely wireless – no wires to run',
      'Long battery life for years of use',
      'Easy to read LED indicators',
      'Mount anywhere that suits you',
    ],
    whenToUse: 'Perfect when you want a keypad in a spot where running wires would be difficult or expensive.',
    zones: 0,
    systemTypes: ['wireless'],
    tooltip: 'Battery powered, wireless only',
    image: '/assets/products/K30.jpg', // K38 uses K30 image (similar design)
  },
  {
    id: 'k32',
    code: 'K32',
    name: 'K32 LED Keypad',
    category: 'keypad',
    description: 'Classic and reliable – the everyday workhorse keypad.',
    fullDescription: 'The K32 is the tried-and-true choice for most installations. Simple LED display, easy to use, and rock-solid reliable. It just works, day after day.',
    features: [
      'Clear LED zone display',
      'Simple arm/disarm operation',
      'Built tough for daily use',
      'Works with hardwired or wireless systems',
    ],
    whenToUse: 'Great for main entry points where you\'ll arm and disarm your system daily.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: 'Classic LED display',
    image: '/assets/products/K32.jpg',
  },
  {
    id: 'tm50',
    code: 'TM50',
    name: 'TM50 5" Touchscreen Keypad',
    category: 'keypad',
    description: 'Intuitive 5-inch touchscreen – security made simple.',
    fullDescription: 'The TM50 brings modern touch control to your security system. The 5-inch display shows you exactly what\'s happening and makes arming/disarming a breeze. Perfect if you want something more intuitive than buttons.',
    features: [
      '5-inch full-color touchscreen',
      'Easy visual zone status',
      'Sleek modern design',
      'User-friendly menu navigation',
    ],
    whenToUse: 'Ideal when you want modern touchscreen convenience without going full-size.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: '5" touchscreen display',
    image: '/assets/products/TM50.jpg',
  },
  {
    id: 'tm70',
    code: 'TM70',
    name: 'TM70 7" Touchscreen Keypad',
    category: 'keypad',
    description: 'Premium 7-inch touchscreen – the ultimate control experience.',
    fullDescription: 'The TM70 is the flagship keypad experience. The large 7-inch display gives you complete visibility and control over your entire system. It\'s like having a tablet dedicated to your security.',
    features: [
      'Large 7-inch color touchscreen',
      'See all zones at a glance',
      'Premium look and feel',
      'The most intuitive control available',
    ],
    whenToUse: 'Choose this when you want the best visual experience and don\'t mind the larger size.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: '7" premium touchscreen',
    image: '/assets/products/TM70.jpg',
  },

  // Remotes
  {
    id: 'rem25',
    code: 'REM25',
    name: 'REM25 2-Way Remote',
    category: 'remote',
    description: 'Know your system responded – get confirmation right on the remote.',
    fullDescription: 'The REM25 talks back to you. Press arm and it confirms the system is armed. No more wondering if you remembered to set the alarm. The two-way communication gives you peace of mind.',
    features: [
      'Two-way feedback confirms commands',
      'LED and vibration confirmation',
      'Arm, disarm, and panic buttons',
      'Never wonder if the alarm is set',
    ],
    whenToUse: 'Best when you want the certainty of knowing your system actually armed.',
    zones: 0,
    systemTypes: ['wireless'],
    tooltip: 'Confirms commands with feedback',
    image: '/assets/products/REM25.jpg',
  },
  {
    id: 'rem15',
    code: 'REM15',
    name: 'REM15 1-Way Remote',
    category: 'remote',
    description: 'Simple and reliable – arm and disarm on the go.',
    fullDescription: 'The REM15 keeps things simple. One press to arm, one press to disarm. No frills, just reliable control from your keychain. Perfect if you don\'t need confirmation feedback.',
    features: [
      'Simple one-way operation',
      'Compact keychain design',
      'Easy arm/disarm buttons',
      'Affordable backup remote option',
    ],
    whenToUse: 'Great as an extra remote or when you don\'t need two-way confirmation.',
    zones: 0,
    systemTypes: ['wireless'],
    tooltip: 'Simple arm/disarm control',
    image: '/assets/products/REM15.jpg',
  },

  // Motion Detectors - Indoor
  {
    id: 'pmd2p',
    code: 'PMD2P',
    name: 'PMD2P Standard Motion Detector',
    category: 'motion-indoor',
    description: 'Reliable indoor motion detection for pet-free homes.',
    fullDescription: 'The PMD2P is your go-to motion sensor for indoor spaces without large pets. It catches intruders while ignoring minor movements, giving you protection without false alarms.',
    features: [
      'Wide coverage area',
      'Low false alarm rate',
      'Easy ceiling or wall mount',
      'Long battery life',
    ],
    whenToUse: 'Best for homes and offices without pets, or with very small pets only.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'Best for pet-free homes',
    petFriendly: false,
    image: '/assets/products/PMD2P.jpg',
  },
  {
    id: 'pmd75',
    code: 'PMD75',
    name: 'PMD75 Pet-Friendly Motion Detector',
    category: 'motion-indoor',
    description: 'Smart enough to ignore your pets up to 40kg – catches everything else.',
    fullDescription: 'The PMD75 uses clever technology to tell the difference between your pet and an intruder. Dogs and cats up to 40kg can roam freely while your home stays protected.',
    features: [
      'Pet-immune up to 40kg',
      'Your pets move freely',
      'Same great detection accuracy',
      'No more false alarms from pets',
    ],
    whenToUse: 'Essential if you have dogs, cats, or other pets that roam your home.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'Ignores pets up to 40kg',
    petFriendly: true,
    maxPetWeight: 40,
    image: '/assets/products/PMD75.jpg',
  },

  // Motion Detectors - Outdoor
  {
    id: 'pmd85',
    code: 'PMD85',
    name: 'PMD85 Outdoor Motion Detector',
    category: 'motion-outdoor',
    description: 'Catch intruders outside before they reach your doors.',
    fullDescription: 'The PMD85 watches your yard so you know someone\'s there before they get inside. Weather-resistant design handles Australian conditions while keeping false alarms low.',
    features: [
      'Outdoor-rated and weather-sealed',
      'Early warning detection',
      'Adjustable sensitivity',
      'Handles rain, heat, and cold',
    ],
    whenToUse: 'Perfect for side gates, back yards, and perimeter protection.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'Weather-resistant outdoor use',
    image: '/assets/products/PMD85.jpg',
  },
  {
    id: 'nv780mr',
    code: 'NV780MR',
    name: 'NV780MR Long-Range Outdoor Detector',
    category: 'motion-outdoor',
    description: 'Covers driveways and large yards – maximum outdoor range.',
    fullDescription: 'The NV780MR gives you serious range for large properties. It can cover long driveways and wide open spaces, giving you the earliest possible warning of approaching visitors or intruders.',
    features: [
      'Extra-long detection range',
      'Perfect for driveways',
      'Covers large open areas',
      'Professional-grade reliability',
    ],
    whenToUse: 'Ideal for rural properties, long driveways, or large commercial yards.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'Long-range outdoor coverage',
    image: '/assets/products/NV780MR.jpg',
  },

  // Door/Window Contacts
  {
    id: 'dct10',
    code: 'DCT10',
    name: 'DCT10 Standard Door/Window Contact',
    category: 'door-contact',
    description: 'Know instantly when doors or windows open – 40m range.',
    fullDescription: 'The DCT10 is your everyday door and window sensor. It tells your system the moment someone opens an entry point. The 40-metre range works perfectly for most home layouts.',
    features: [
      '40m wireless range to panel',
      'Works on doors and windows',
      'Compact and discreet design',
      'Long-lasting battery',
    ],
    whenToUse: 'Use on standard doors and windows within normal range of your panel.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: '40m range, standard use',
    range: 40,
    image: '/assets/products/DCT10.jpg',
  },
  {
    id: 'dctxp2',
    code: 'DCTXP2',
    name: 'DCTXP2 Extended Range Door Contact',
    category: 'door-contact',
    description: 'Extra range for garages and metal doors – reaches 70m.',
    fullDescription: 'The DCTXP2 punches through where standard sensors struggle. The extended 70-metre range handles metal garage doors, separate buildings, and challenging installation spots.',
    features: [
      '70m extended wireless range',
      'Works through metal doors',
      'Ideal for garages and sheds',
      'Same easy installation',
    ],
    whenToUse: 'Choose this for garage doors, metal-framed doors, or sensors far from the panel.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: '70m range, for garages/metal doors',
    range: 70,
    image: '/assets/products/DCTXP2.jpg',
  },

  // Sirens
  {
    id: 'sr230',
    code: 'SR230',
    name: 'SR230 Wireless Siren',
    category: 'siren',
    description: 'Loud enough to alert the whole street – scares off intruders fast.',
    fullDescription: 'The SR230 makes noise that gets attention. When the alarm triggers, everyone knows about it. Wireless installation means you can put it where it\'ll be most effective.',
    features: [
      'Powerful siren output',
      'Wireless for flexible placement',
      'Indoor or outdoor mounting',
      'Built-in tamper protection',
    ],
    whenToUse: 'Every security system needs at least one siren to deter intruders and alert neighbors.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'Required – must be in direct panel range',
    isRequired: true,
    image: '/assets/products/SR230.jpg',
  },

  // Smoke Detectors
  {
    id: 'sd360',
    code: 'SD360',
    name: 'SD360 Wireless Smoke Detector',
    category: 'smoke',
    description: 'Life safety comes first – one per floor keeps everyone protected.',
    fullDescription: 'The SD360 watches for smoke so you can sleep easy. It ties into your security system so you get alerts even when you\'re away. We recommend one per floor for complete coverage.',
    features: [
      'Photoelectric smoke detection',
      'Integrates with your alarm system',
      'Wireless installation anywhere',
      'Alerts you even when away',
    ],
    whenToUse: 'Install at least one per floor for fire safety. It\'s about protecting lives, not just property.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'One per floor recommended',
    isRequired: true,
    image: '/assets/products/SD360.jpg',
  },

  // Specialty
  {
    id: 's250',
    code: 'S250',
    name: 'S250 Multi-Access Sensor',
    category: 'specialty',
    description: 'Specialty protection for unique security needs.',
    fullDescription: 'The S250 handles special situations where standard sensors don\'t fit. It provides flexible detection options for unique installation requirements.',
    features: [
      'Versatile detection options',
      'Handles specialty applications',
      'Professional-grade sensor',
      'Flexible mounting options',
    ],
    whenToUse: 'For unusual detection needs that standard sensors can\'t cover.',
    zones: 1,
    systemTypes: ['wireless'],
    tooltip: 'For specialty protection needs',
  },

  // Accessories
  {
    id: 'repeater',
    code: 'RPT',
    name: 'Wireless Repeater',
    category: 'accessory',
    description: 'Extends your system\'s reach for larger properties.',
    fullDescription: 'A repeater boosts the wireless signal range of your system. For larger homes or properties with thick walls, it ensures all your sensors can communicate reliably with the panel.',
    features: [
      'Extends wireless range',
      'Perfect for larger properties',
      'Handles thick walls and long distances',
      'Easy to add to existing systems',
    ],
    whenToUse: 'Add a repeater if you have a large property or devices at the edge of wireless range.',
    zones: 0,
    systemTypes: ['wireless'],
    tooltip: 'Note: Sirens cannot work via repeaters',
  },
  {
    id: 'zone-expander',
    code: 'ZX',
    name: 'Zone Expander Module',
    category: 'accessory',
    description: 'Add more zones for advanced installations.',
    fullDescription: 'Zone expanders allow you to go beyond the standard 32 zones for complex installations. This is an advanced option for professional installers.',
    features: [
      'Expands total zone capacity',
      'For complex installations',
      'Professional installation required',
    ],
    whenToUse: 'For very large properties requiring more than 32 zones.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: 'Advanced option',
    isInformationalOnly: true,
  },
  {
    id: 'pgm-module',
    code: 'PGM',
    name: 'PGM Output Module',
    category: 'accessory',
    description: 'Automation integration for smart control.',
    fullDescription: 'PGM modules let your security system control other devices – lights, gates, automation. This is an advanced feature for integrated installations.',
    features: [
      'Triggers external devices',
      'Automation integration',
      'Professional setup recommended',
    ],
    whenToUse: 'When you want your security system to control lights, gates, or other automation.',
    zones: 0,
    systemTypes: ['wireless', 'hardwired'],
    tooltip: 'Automation feature',
    isInformationalOnly: true,
  },
];

// Helper functions
export const getProductsByCategory = (category: Product['category']): Product[] => {
  return paradoxProducts.filter(p => p.category === category && !p.isInformationalOnly);
};

export const getProductById = (id: string): Product | undefined => {
  return paradoxProducts.find(p => p.id === id);
};

export const getSelectableProducts = (): Product[] => {
  return paradoxProducts.filter(p => !p.isInformationalOnly);
};

export const getInformationalProducts = (): Product[] => {
  return paradoxProducts.filter(p => p.isInformationalOnly);
};
