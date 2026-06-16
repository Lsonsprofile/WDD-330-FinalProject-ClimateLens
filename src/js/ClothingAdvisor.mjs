// Fetch clothing data from JSON file
let clothingData = null;

async function loadClothingData() {
  if (clothingData) return clothingData;
  
  try {
    const response = await fetch('/json/clothingData.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load clothing data: ${response.status}`);
    }
    
    clothingData = await response.json();
    return clothingData;
  } catch (error) {
    console.error('Error loading clothing data:', error);
    return null;
  }
}

export async function getClothingRecommendation(weatherOracle) {
  const { temp, rainChance, uvValue, windSpeed, condition } = weatherOracle;
  
  // Load clothing data from JSON
  const data = await loadClothingData();
  if (!data) {
    console.error('Failed to load clothing data');
    return null;
  }
  
  const garmentScripture = getClothingByTemperature(temp, data);
  
  if (!garmentScripture || !garmentScripture.outfit) {
    console.error('No garment scripture found for temp:', temp);
    return null;
  }
  
  const adornments = [...(garmentScripture.outfit.extras || [])];
  const theOmens = [];
  
  // Precipitation prophecy
  if (rainChance > 60) {
    adornments.push(data.AQUEOUS_BARRIER);
    theOmens.push(`Rain probability is ${rainChance}% — summon your aqueous barrier.`);
  } else if (rainChance > 30) {
    adornments.push(data.AQUEOUS_BARRIER);
    theOmens.push(`Rain probability is ${rainChance}% — consider the celestial canopy.`);
  }
  
  // Solar intensity
  if (uvValue > 7) {
    adornments.push({ name: 'Solar Veil', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop' });
    theOmens.push('Solar intensity is severe — invoke the sunscreen ritual.');
  } else if (uvValue > 4) {
    adornments.push({ name: 'Shadow Crown', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop' });
    theOmens.push('Solar intensity is moderate — wear your shadow crown.');
  }
  
  // Wind
  if (windSpeed > 25) {
    adornments.push({ name: 'Aeolian Shell', image: '' });
    theOmens.push(`Wind current is ${windSpeed} km/h — don the windbreaker cloak.`);
  } else if (windSpeed > 15) {
    adornments.push({ name: 'Breeze Mantle', image: '' });
    theOmens.push(`Wind current is ${windSpeed} km/h — consider a light shell.`);
  }
  
  // Temperature extremes
  if (temp > 35) {
    adornments.push({ name: 'Hydration Vessel', image: 'https://images.unsplash.com/photo-1526401485004-2fda9f5a9f7f?w=200&h=200&fit=crop' });
    theOmens.push('Thermal reading extreme — carry hydration and seek shade.');
  }
  
  if (temp < 0) {
    adornments.push({ name: 'Thermal Core', image: '' });
    theOmens.push('Thermal reading below freezing — layer your inner warmth.');
  }
  
  // Condition-based
  if (condition?.toLowerCase().includes('thunder')) {
    adornments.push({ name: 'Lightning Ward', image: '' });
    theOmens.push('Storm energy detected — seek shelter from the electric dance.');
  }
  
  if (condition?.toLowerCase().includes('fog')) {
    adornments.push({ name: 'Visibility Beacon', image: '' });
    theOmens.push('Mist veil present — enhance your visibility signature.');
  }
  
  // Filter out any adornments without a name
  const validAdornments = adornments.filter(a => a && a.name);
  
  return {
    rule: garmentScripture,
    outfit: garmentScripture.outfit,
    extras: validAdornments,
    summary: forgeProphecy(garmentScripture, validAdornments, theOmens),
    warnings: theOmens
  };
}

function getClothingByTemperature(temp, data) {
  const rules = data.GARMENT_SCRIPTURES.map(scripture => ({
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
  
  return rules.find(rule => temp >= rule.min && temp < rule.max) || rules[rules.length - 1];
}

function forgeProphecy(garmentScripture, adornments, theOmens) {
  let prophecy = `Don ${(garmentScripture.outfit.top || 'something').toLowerCase()} and ${(garmentScripture.outfit.bottom || 'something').toLowerCase()} with ${(garmentScripture.outfit.footwear || 'something').toLowerCase()}.`;
  
  if (adornments.length > 0) {
    const sacredNames = adornments.map(a => a.name).join(', ');
    prophecy += ` Also consecrate with ${sacredNames.toLowerCase()}.`;
  }
  
  if (theOmens.length > 0) {
    prophecy += ` ${theOmens.join(' ')}`;
  }
  
  return prophecy;
}