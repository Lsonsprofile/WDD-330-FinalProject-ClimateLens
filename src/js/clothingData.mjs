// Sacred Garment Vision - The main atlas of thermal attire (Add your image path here)
const SACRED_GARMENT_VISION = ''; // TODO: Add your clothing guide image path

// Aqueous Barrier - The celestial canopy for rain rituals (Add your image path here)
const AQUEOUS_BARRIER_IMAGE = ''; // TODO: Add your umbrella image path

// The Garment Scriptures - Sacred rules of thermal dressing
export const GARMENT_SCRIPTURES = [
  {
    thermalFloor: -50,
    thermalCeiling: 0,
    elementalSeal: 'Frozen Abyss',
    incantation: 'Maximum Thermal Sanctuary',
    prophecy: 'Heavily insulated layers to safeguard core essence.',
    vestments: {
      crown: 'Insulated Winter Coat',
      crownVision: '/image/wintercoat.png', 
      foundation: 'Thermal Pants',
      foundationVision: '/image/thermalpants.png', 
      anchors: 'Insulated Snow Boots',
      anchorsVision: '/image/snowboots.png', 
      adornments: [
        { essence: 'Hand Warmers', vision: '/image/handwarmers.png' }, 
        { essence: 'Neck Coil', vision: '/image/light-neck-coil.png' }, 
        { essence: 'Skull Shroud', vision: '/image/skullshroud.png' } 
      ]
    }
  },
  {
    thermalFloor: 0,
    thermalCeiling: 5,
    elementalSeal: 'Frost Veil',
    incantation: 'Winter Layer Weave',
    prophecy: 'Warm jacket and thick denim for freezing thresholds.',
    vestments: {
      crown: 'Winter Jacket',
      crownVision: '/image/wintercoat.png', 
      foundation: 'Thick Denim',
      foundationVision: '/image/thickjean.png', 
      anchors: 'Leather Winter Boots',
      anchorsVision: '/image/snowboots.png', 
      adornments: [
        { essence: 'Neck Coil', vision: '/image/solar-veil.png' }, 
        { essence: 'Light Hand Warmers', vision: '/image/handwarmers.png' } 
      ]
    }
  },
  {
    thermalFloor: 5,
    thermalCeiling: 10,
    elementalSeal: 'Chill Touch',
    incantation: 'Padded Warmth Layer',
    prophecy: 'Padded jacket with denim for crisp weather.',
    vestments: {
      crown: 'Warm Padded Jacket',
      crownVision: '/image/paddded-jacket.png', 
      foundation: 'Denim Jeans',
      foundationVision: '/image/denim-jeans.png', 
      anchors: 'Ankle Boots',
      anchorsVision: '/image/ankle-boots.png', 
      adornments: [
        { essence: 'Light Neck Coil', vision: '/image/light-neck-coil.png' } 
      ]
    }
  },
  {
    thermalFloor: 10,
    thermalCeiling: 15,
    elementalSeal: 'Mist Breath',
    incantation: 'Cozy Knit Weave',
    prophecy: 'Knitted sweater with slim denim for cool days.',
    vestments: {
      crown: 'Knitted Sweater',
      crownVision: '/image/knitted-sweater.png', 
      foundation: 'Slim Denim',
      foundationVision: '/image/demin-jeans.png', 
      anchors: 'Casual Sneakers',
      anchorsVision: '/image/casualSneakers.png', 
      adornments: []
    }
  },
  {
    thermalFloor: 15,
    thermalCeiling: 20,
    elementalSeal: 'Soft Zephyr',
    incantation: 'Light Layer Harmony',
    prophecy: 'Long sleeve cotton shirt with chinos for mild weather.',
    vestments: {
      crown: 'Long Sleeve Cotton Shirt',
      crownVision: '/image/long-sleeve-cotton-shirt.png', 
      foundation: 'Chinos',
      foundationVision: '/image/chinos.png', 
      anchors: 'Sneakers',
      anchorsVision: '/image/sneakers.png', 
      adornments: []
    }
  },
  {
    thermalFloor: 20,
    thermalCeiling: 25,
    elementalSeal: 'Warm Embrace',
    incantation: 'Smart Casual Weave',
    prophecy: 'Polo shirt with light chinos for warm days.',
    vestments: {
      crown: 'Polo Shirt',
      crownVision: '/image/poloShirt.png', 
      foundation: 'Light Chinos',
      foundationVision: '/image/lightChinos.png', 
      anchors: 'Casual Sneakers',
      anchorsVision: '/image/casualSneakers.png', 
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/shadow.png' } 
      ]
    }
  },
  {
    thermalFloor: 25,
    thermalCeiling: 30,
    elementalSeal: 'Solar Glow',
    incantation: 'Summer Casual Flow',
    prophecy: 'Cotton t-shirt and shorts for warm weather.',
    vestments: {
      crown: 'Cotton T-Shirt',
      crownVision: '/image/cotton.png', 
      foundation: 'Shorts',
      foundationVision: '/image/shorts.png', 
      anchors: 'Light Sneakers',
      anchorsVision: '/image/light-sneakers.png', 
      adornments: [
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' } 
      ]
    }
  },
  {
    thermalFloor: 30,
    thermalCeiling: 35,
    elementalSeal: 'Heat Mirage',
    incantation: 'Thermal Dissipation',
    prophecy: 'Breathable fabrics for scorching conditions.',
    vestments: {
      crown: 'Light Breathable T-Shirt',
      crownVision: '/image/light-breathable.png', 
      foundation: 'Athletic Shorts',
      foundationVision: '/image/athletic-shorts.png', 
      anchors: 'Sandals',
      anchorsVision: '/image/sandals.png', 
      adornments: [
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' }, 
        { essence: 'Hydration Vessel', vision: '/image/extra.png' } 
      ]
    }
  },
  {
    thermalFloor: 35,
    thermalCeiling: 40,
    elementalSeal: 'Scorch Domain',
    incantation: 'Extreme Heat Evasion',
    prophecy: 'Minimal coverage for extreme thermal assault.',
    vestments: {
      crown: 'Sleeveless Tank Top',
      crownVision: '/image/sleeveless-tank-top.png', 
      foundation: 'Light Shorts',
      foundationVision: '/image/light-shorts.png', 
      anchors: 'Open Sandals',
      anchorsVision: '/image/open-sandals.png', 
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/skullshroud.png' }, 
        { essence: 'Solar Barrier Cream', vision: '/image/solar-veil.png' } 
      ]
    }
  },
  {
    thermalFloor: 40,
    thermalCeiling: 60,
    elementalSeal: 'Inferno Realm',
    incantation: 'Maximum Cooling Ritual',
    prophecy: 'Ultra light fabrics for extreme thermal peaks.',
    vestments: {
      crown: 'Ultra Lightweight Tank Top',
      crownVision: '/image/ultra-light-tank-top.png', 
      foundation: 'Breathable Shorts',
      foundationVision: '/image/breathable-shorts.png', 
      anchors: 'Flip-Flops',
      anchorsVision: '/image/flip-flops.png', 
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/skullshroud.png' }, 
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' }, 
        { essence: 'Solar Barrier Cream', vision: '/image/extra.png' }, 
        { essence: 'Hydration Vessel', vision: '/image/hydration-vessel.png' } 
      ]
    }
  }
];

// Aqueous Barrier - Celestial canopy for rain rituals
export const AQUEOUS_BARRIER = {
  essence: 'Aqueous Barrier',
  vision: '/image/umbrella.png' 
};

// Summon garment scripture by thermal reading
export function summonGarmentByThermal(thermalReading) {
  return GARMENT_SCRIPTURES.find(scripture => 
    thermalReading >= scripture.thermalFloor && thermalReading < scripture.thermalCeiling
  ) || GARMENT_SCRIPTURES[GARMENT_SCRIPTURES.length - 1];
}

// Legacy compatibility export
export const clothingRules = GARMENT_SCRIPTURES.map(scripture => ({
  min: scripture.thermalFloor,
  max: scripture.thermalCeiling,
  status: scripture.elementalSeal,
  heading: scripture.incantation,
  description: scripture.prophecy,
  outfit: {
    top: scripture.vestments.crown,
    topImage: scripture.vestments.crownVision,
    bottom: scripture.vestments.foundation,
    bottomImage: scripture.vestments.foundationVision,
    footwear: scripture.vestments.anchors,
    footwearImage: scripture.vestments.anchorsVision,
    extras: scripture.vestments.adornments.map(a => ({ name: a.essence, image: a.vision }))
  }
}));

// Legacy getter
export function getClothingByTemperature(temp) {
  return clothingRules.find(rule => temp >= rule.min && temp < rule.max) || clothingRules[clothingRules.length - 1];
}

// Export constants for backward compatibility
export const CLOTHING_GUIDE_IMAGE = SACRED_GARMENT_VISION;
export const UMBRELLA_IMAGE = AQUEOUS_BARRIER_IMAGE;
export const UMBRELLA = AQUEOUS_BARRIER;