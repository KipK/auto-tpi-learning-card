// Translations for the Auto-TPI Learning Card.
// Missing keys in a language fall back to English.

const translations = {
  en: {
    loading: 'Loading history data...',
    no_data: 'No history data available',
    fetch_error: 'Failed to fetch history data.',
    entity_not_found: 'Entity not found:',
    state_active: 'Active',
    state_off: 'Off',
    waiting: 'Waiting for update...',
    start_learning: 'Start Learning',
    stop_learning: 'Stop Learning',
    options: 'Options',
    reset: 'Reset',
    boost_kint: 'boost Kint on stagnation',
    unboost_kext: 'unboost Kext on overshoot',
    state: 'State:',
    confidence: 'Confidence:',
    cycles: 'Cycles:',
    heat_rate: 'Heat Rate',
    last_cycle: 'Last cycle:',
    default_title: 'Auto-TPI Learning',
    coef_int: 'Coef INT',
    coef_ext: 'Coef EXT',
    temp: 'Temp',
    ext_temp: 'Ext Temp',
    setpoint: 'Setpoint',
    legend_hrate: 'Hrate',
    legend_setpoint: 'SPoint',
    legend_ext_temp: 'ExTemp',
    legend_temp: 'Temp',
    legend_heat: 'Heat',
    editor_name: 'Name',
    editor_climate: 'Climate entity',
    editor_learning: 'Learning entity (sensor)',
  },
  fr: {
    loading: "Chargement de l'historique...",
    no_data: "Aucune donnée d'historique disponible",
    fetch_error: "Impossible de récupérer l'historique.",
    entity_not_found: 'Entité introuvable :',
    state_active: 'Actif',
    state_off: 'Arrêté',
    waiting: 'En attente de mise à jour...',
    start_learning: "Démarrer l'apprentissage",
    stop_learning: "Arrêter l'apprentissage",
    options: 'Options',
    reset: 'Réinitialiser',
    boost_kint: 'booster Kint en cas de stagnation',
    unboost_kext: 'réduire Kext en cas de dépassement',
    state: 'État :',
    confidence: 'Confiance :',
    cycles: 'Cycles :',
    heat_rate: 'Capacité de chauffe',
    last_cycle: 'Dernier cycle :',
    default_title: 'Apprentissage Auto-TPI',
    coef_int: 'Coef INT',
    coef_ext: 'Coef EXT',
    temp: 'Temp',
    ext_temp: 'Temp ext',
    setpoint: 'Consigne',
    legend_hrate: 'Capacité',
    legend_setpoint: 'Consigne',
    legend_ext_temp: 'Temp ext',
    legend_temp: 'Temp',
    legend_heat: 'Chauffe',
    editor_name: 'Nom',
    editor_climate: 'Entité Climate',
    editor_learning: 'Entité Learning (sensor)',
  },
  nl: {
    loading: 'Historie laden...',
    no_data: 'Geen historie beschikbaar',
    fetch_error: 'Historie ophalen mislukt.',
    entity_not_found: 'Entiteit niet gevonden:',
    state_active: 'Actief',
    state_off: 'Uit',
    waiting: 'Wachten op update...',
    start_learning: 'Leren starten',
    stop_learning: 'Leren stoppen',
    options: 'Opties',
    reset: 'Resetten',
    boost_kint: 'Kint verhogen bij stilstand',
    unboost_kext: 'Kext verlagen bij doorschieten',
    state: 'Status:',
    confidence: 'Betrouwbaarheid:',
    cycles: 'Cycli:',
    heat_rate: 'Opwarmsnelheid',
    last_cycle: 'Laatste cyclus:',
    default_title: 'Auto-TPI leren',
    coef_int: 'Coëf. INT',
    coef_ext: 'Coëf. EXT',
    temp: 'Temp',
    ext_temp: 'Buitentemp',
    setpoint: 'Doel',
    legend_hrate: 'Opwarm',
    legend_setpoint: 'Doel',
    legend_ext_temp: 'Buiten',
    legend_temp: 'Temp',
    legend_heat: 'Verwarmen',
    editor_name: 'Naam',
    editor_climate: 'Climate-entiteit',
    editor_learning: 'Leer-entiteit (sensor)',
  },
};

// Human-readable text for the last_learning_status codes of Versatile Thermostat.
// The code is the part before an optional "(details)"; details are kept as-is.
const statusTranslations = {
  en: {
    learning_started: 'learning started',
    learning_resumed: 'learning resumed',
    learning_stopped: 'learning stopped',
    not_heating_or_cooling: 'not heating or cooling',
    setpoint_changed_during_cycle: 'setpoint changed during cycle',
    consigne_changed: 'setpoint changed',
    learned_indoor_heat: 'learned indoor coefficient (heat)',
    learned_indoor_cool: 'learned indoor coefficient (cool)',
    learned_outdoor_heat: 'learned outdoor coefficient (heat)',
    learned_outdoor_cool: 'learned outdoor coefficient (cool)',
    continuous_kext_learned_heat: 'learned outdoor coefficient continuously (heat)',
    continuous_kext_learned_cool: 'learned outdoor coefficient continuously (cool)',
    cycle_too_short: 'cycle too short',
    cycle_gap_detected: 'gap between cycles detected',
    real_rise_too_small: 'temperature rise too small',
    warming_up_naturally: 'warming up naturally',
    cooling_down_naturally: 'cooling down naturally',
    anomalous_overheating: 'anomalous overheating',
    anomalous_overcooling: 'anomalous overcooling',
  },
  fr: {
    learning_started: 'apprentissage démarré',
    learning_resumed: 'apprentissage repris',
    learning_stopped: 'apprentissage arrêté',
    not_heating_or_cooling: 'ni chauffe ni refroidissement',
    setpoint_changed_during_cycle: 'consigne modifiée pendant le cycle',
    consigne_changed: 'consigne modifiée',
    learned_indoor_heat: 'coefficient intérieur appris (chauffe)',
    learned_indoor_cool: 'coefficient intérieur appris (clim)',
    learned_outdoor_heat: 'coefficient extérieur appris (chauffe)',
    learned_outdoor_cool: 'coefficient extérieur appris (clim)',
    continuous_kext_learned_heat: 'coefficient extérieur appris en continu (chauffe)',
    continuous_kext_learned_cool: 'coefficient extérieur appris en continu (clim)',
    cycle_too_short: 'cycle trop court',
    cycle_gap_detected: 'interruption entre cycles détectée',
    real_rise_too_small: 'hausse de température trop faible',
    warming_up_naturally: 'réchauffement naturel',
    cooling_down_naturally: 'refroidissement naturel',
    anomalous_overheating: 'surchauffe anormale',
    anomalous_overcooling: 'refroidissement anormal',
  },
  nl: {
    learning_started: 'leren gestart',
    learning_resumed: 'leren hervat',
    learning_stopped: 'leren gestopt',
    not_heating_or_cooling: 'niet aan het verwarmen of koelen',
    setpoint_changed_during_cycle: 'doeltemperatuur gewijzigd tijdens cyclus',
    consigne_changed: 'doeltemperatuur gewijzigd',
    learned_indoor_heat: 'binnencoëfficiënt geleerd (verwarmen)',
    learned_indoor_cool: 'binnencoëfficiënt geleerd (koelen)',
    learned_outdoor_heat: 'buitencoëfficiënt geleerd (verwarmen)',
    learned_outdoor_cool: 'buitencoëfficiënt geleerd (koelen)',
    continuous_kext_learned_heat: 'buitencoëfficiënt continu geleerd (verwarmen)',
    continuous_kext_learned_cool: 'buitencoëfficiënt continu geleerd (koelen)',
    cycle_too_short: 'cyclus te kort',
    cycle_gap_detected: 'onderbreking tussen cycli gedetecteerd',
    real_rise_too_small: 'temperatuurstijging te klein',
    warming_up_naturally: 'warmt vanzelf op',
    cooling_down_naturally: 'koelt vanzelf af',
    anomalous_overheating: 'afwijkende oververhitting',
    anomalous_overcooling: 'afwijkende onderkoeling',
  },
};

export function getLanguage(hass) {
  const lang = (hass?.locale?.language || hass?.language || 'en').split('-')[0];
  return translations[lang] ? lang : 'en';
}

export function getLocale(hass) {
  return hass?.locale?.language || hass?.language || 'en';
}

export function localize(hass, key) {
  const lang = getLanguage(hass);
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export function localizeStatus(hass, status) {
  if (!status) return status;
  const match = /^([a-z_]+)(.*)$/.exec(status);
  if (!match) return status;
  const [, code, rest] = match;
  const lang = getLanguage(hass);
  const text = statusTranslations[lang]?.[code] ?? statusTranslations.en[code];
  return text ? `${text}${rest}` : status;
}
