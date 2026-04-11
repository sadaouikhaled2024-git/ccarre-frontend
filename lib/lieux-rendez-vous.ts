export const LIEUX_AUTORISES = [
  "Université AMU - Campus Luminy",
  "Université AMU - Campus Saint-Charles",
  "Université AMU - Campus Saint-Jérôme",
  "Centre Commercial Géant",
  "Gare Saint-Charles",
  "Parc Borély",
  "Bibliothèque Municipale",
  "Marché Capucins",
  "Place Castellane",
  "Plage de la Pointe-Rouge",
  "Aéroport Marseille-Provence",
] as const

export type LieuRendezVous = (typeof LIEUX_AUTORISES)[number]

export const DELAIS_SYSTEME = {
  MIN_BEFORE_RENDEZ_VOUS: 24 * 60 * 60 * 1000, // 24 heures en ms
  CONFIRMATION_TIMEOUT: 48 * 60 * 60 * 1000, // 48 heures
  AUTO_EXPIRE: 7 * 24 * 60 * 60 * 1000, // 7 jours
  LITIGE_TIMEOUT: 72 * 60 * 60 * 1000, // 72 heures
}

export const isLieuAutorise = (lieu: string): lieu is LieuRendezVous => {
  return LIEUX_AUTORISES.includes(lieu as any)
}

export const getLieuLabel = (lieu: LieuRendezVous): string => {
  const labels: Record<LieuRendezVous, string> = {
    "Université AMU - Campus Luminy": "🎓 Université AMU - Campus Luminy",
    "Université AMU - Campus Saint-Charles": "🎓 Université AMU - Campus Saint-Charles",
    "Université AMU - Campus Saint-Jérôme": "🎓 Université AMU - Campus Saint-Jérôme",
    "Centre Commercial Géant": "🛍️ Centre Commercial Géant",
    "Gare Saint-Charles": "🚂 Gare Saint-Charles",
    "Parc Borély": "🌳 Parc Borély",
    "Bibliothèque Municipale": "📚 Bibliothèque Municipale",
    "Marché Capucins": "🏪 Marché Capucins",
    "Place Castellane": "📍 Place Castellane",
    "Plage de la Pointe-Rouge": "🏖️ Plage de la Pointe-Rouge",
    "Aéroport Marseille-Provence": "✈️ Aéroport Marseille-Provence",
  }
  return labels[lieu]
}
