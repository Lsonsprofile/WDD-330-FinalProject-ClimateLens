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
      crownVision: '/image/wintercoat.png', // TODO: Add your image path
      foundation: 'Thermal Pants',
      foundationVision: '/image/thermalpants.png', // TODO: Add your image path
      anchors: 'Insulated Snow Boots',
      anchorsVision: '/image/snowboots.png', // TODO: Add your image path
      adornments: [
        { essence: 'Hand Warmers', vision: '/image/handwarmers.png' }, // TODO: Add your image path
        { essence: 'Neck Coil', vision: '/image/light-neck-coil.png' }, // TODO: Add your image path
        { essence: 'Skull Shroud', vision: '/image/skullshroud.png' } // TODO: Add your image path
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
      crownVision: '/image/wintercoat.png', // TODO: Add your image path
      foundation: 'Thick Denim',
      foundationVision: '/image/thickjean.png', // TODO: Add your image path
      anchors: 'Leather Winter Boots',
      anchorsVision: '/image/snowboots.png', // TODO: Add your image path
      adornments: [
        { essence: 'Neck Coil', vision: '/image/solar-veil.png' }, // TODO: Add your image path
        { essence: 'Light Hand Warmers', vision: '/image/handwarmers.png' } // TODO: Add your image path
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
      crownVision: '/image/paddded-jacket.png', // TODO: Add your image path
      foundation: 'Denim Jeans',
      foundationVision: '/image/denim-jeans.png', // TODO: Add your image path
      anchors: 'Ankle Boots',
      anchorsVision: '/image/ankle-boots.png', // TODO: Add your image path
      adornments: [
        { essence: 'Light Neck Coil', vision: '/image/light-neck-coil.png' } // TODO: Add your image path
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
      crownVision: '/image/knitted-sweater.png', // TODO: Add your image path
      foundation: 'Slim Denim',
      foundationVision: '/image/demin-jeans.png', // TODO: Add your image path
      anchors: 'Casual Sneakers',
      anchorsVision: '/image/casualSneakers.png', // TODO: Add your image path
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
      crownVision: '/image/long-sleeve-cotton-shirt.png', // TODO: Add your image path
      foundation: 'Chinos',
      foundationVision: '/image/chinos.png', // TODO: Add your image path
      anchors: 'Sneakers',
      anchorsVision: '/image/sneakers.png', // TODO: Add your image path
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
      crownVision: '/image/poloShirt.png', // TODO: Add your image path
      foundation: 'Light Chinos',
      foundationVision: '/image/lightChinos.png', // TODO: Add your image path
      anchors: 'Casual Sneakers',
      anchorsVision: '/image/casualSneakers.png', // TODO: Add your image path
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/shadow.png' } // TODO: Add your image path
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
      foundationVision: '/image/shorts.png', // TODO: Add your image path
      anchors: 'Light Sneakers',
      anchorsVision: '/image/light-sneakers.png', // TODO: Add your image path
      adornments: [
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' } // TODO: Add your image path
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
      crownVision: '/image/light-breathable.png', // TODO: Add your image path
      foundation: 'Athletic Shorts',
      foundationVision: '/image/athletic-shorts.png', // TODO: Add your image path
      anchors: 'Sandals',
      anchorsVision: '/image/sandals.png', // TODO: Add your image path
      adornments: [
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' }, // TODO: Add your image path
        { essence: 'Hydration Vessel', vision: '/image/extra.png' } // TODO: Add your image path
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
      crownVision: '/image/sleeveless-tank-top.png', // TODO: Add your image path
      foundation: 'Light Shorts',
      foundationVision: '/image/light-shorts.png', // TODO: Add your image path
      anchors: 'Open Sandals',
      anchorsVision: '/image/open-sandals.png', // TODO: Add your image path
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/skullshroud.png' }, // TODO: Add your image path
        { essence: 'Solar Barrier Cream', vision: '/image/solar-veil.png' } // TODO: Add your image path
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
      crownVision: '/image/ultra-light-tank-top.png', // TODO: Add your image path
      foundation: 'Breathable Shorts',
      foundationVision: '/image/breathable-shorts.png', // TODO: Add your image path
      anchors: 'Flip-Flops',
      anchorsVision: '/image/flip-flops.png', // TODO: Add your image path
      adornments: [
        { essence: 'Shadow Crown', vision: '/image/skullshroud.png' }, // TODO: Add your image path
        { essence: 'Solar Veil', vision: '/image/solar-veil.png' }, // TODO: Add your image path
        { essence: 'Solar Barrier Cream', vision: '/image/extra.png' }, // TODO: Add your image path
        { essence: 'Hydration Vessel', vision: '/image/hydration-vessel.png' } // TODO: Add your image path
      ]
    }
  }
];

// Aqueous Barrier - Celestial canopy for rain rituals
export const AQUEOUS_BARRIER = {
  essence: 'Aqueous Barrier',
  vision: '' // TODO: Add your umbrella image path
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