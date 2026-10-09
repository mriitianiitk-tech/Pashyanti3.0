/**
 * Pashyanti Typography, Color, and Animation Defaults & Constants
 */

export const AVAILABLE_FONTS = [
  { id: 'Martel', name: 'Martel (Vedic / Devanagari Serif)', sample: 'ॐ विष्णवे नमः' },
  { id: 'Mukta', name: 'Mukta (Clean Modern Sanskrit)', sample: 'ॐ नमो भगवते वासुदेवाय' },
  { id: 'Rozha One', name: 'Rozha One (Devanagari Bold Display)', sample: 'ॐ श्री महालक्ष्म्यै नमः' },
  { id: 'Yatra One', name: 'Yatra One (Devanagari Calligraphy)', sample: 'ॐ नमः शिवाय' },
  { id: 'Cinzel', name: 'Cinzel (Sacred Classical Roman)', sample: 'Om Namah Shivaya' },
  { id: 'Playfair Display', name: 'Playfair Display (Serene Serif)', sample: 'Pashyanti Sadhana' },
  { id: 'Montserrat', name: 'Montserrat (Modern Minimal)', sample: 'Mindful Chanting' },
  { id: 'Caveat', name: 'Caveat (Intimate Freehand Script)', sample: 'Sacred Heart' },
];

export const PRESET_COLORS = [
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Saffron Sun', hex: '#ea580c' },
  { name: 'Vedic Crimson', hex: '#e11d48' },
  { name: 'Tulsi Emerald', hex: '#10b981' },
  { name: 'Shiva Sky', hex: '#38bdf8' },
  { name: 'Krishna Indigo', hex: '#6366f1' },
  { name: 'Lotus Orchid', hex: '#c084fc' },
  { name: 'Pure Sandstone', hex: '#f8fafc' },
  { name: 'Dim Slate', hex: '#64748b' },
  { name: 'Muted Ash', hex: '#94a3b8' },
];

export const defaultNaamJapaTypography = {
  sanskrit: {
    fontFamily: 'Martel',
    fontSize: 40,
    color: '#f59e0b',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textShadow: true,
  },
  meaning: {
    fontFamily: 'Montserrat',
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textShadow: false,
  },
  description: {
    fontFamily: 'Playfair Display',
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: 'normal',
    fontStyle: 'italic',
    textShadow: false,
  },
};

export const defaultSadhanaTypography = {
  activeWord: {
    fontFamily: 'Martel',
    fontSize: 34,
    color: '#f59e0b',
    fontWeight: 'bold',
    fontStyle: 'normal',
    glow: true,
  },
  completedWord: {
    fontFamily: 'Martel',
    fontSize: 30,
    color: '#64748b',
    fontWeight: 'normal',
    fontStyle: 'normal',
    opacity: 0.45,
  },
  upcomingWord: {
    fontFamily: 'Martel',
    fontSize: 30,
    color: '#cbd5e1',
    fontWeight: 'normal',
    fontStyle: 'normal',
    opacity: 0.75,
  },
  header: {
    fontFamily: 'Cinzel',
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
};

export const defaultDripAnimationSettings = {
  // Sadhana (Normal Japa)
  sadhanaMode: 'standard', // 'standard' | 'drip'
  sadhanaDripUnit: 'word', // 'word' | 'phrase'
  sadhanaSpeedMode: 'gravity', // 'gravity' | 'manual' | 'synced'
  sadhanaDuration: 2000, // ms
  
  // Naam Japa
  naamJapaMode: 'standard', // 'standard' | 'drip'
  naamJapaSpeedMode: 'gravity', // 'gravity' | 'manual'
  naamJapaDuration: 2000, // ms
  naamJapaShowMeaningInDrip: true,
};
