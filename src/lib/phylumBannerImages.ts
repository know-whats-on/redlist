// Phylum-specific banner images for Species Index sections
// Each phylum has a UNIQUE, thematically relevant background image
// NO IMAGE REUSE across different phyla (strict rule for clarity)

export const phylumBannerImages: Record<string, string> = {
  // ===== ANIMALIA PHYLA =====
  
  // Arthropoda - macro insect wing / exoskeleton pattern (butterfly wing macro - colorful, bright)
  'Arthropoda': 'https://images.unsplash.com/photo-1658004354495-2877ace1c158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Mollusca - shell texture / snail macro (seashell texture macro)
  'Mollusca': 'https://images.unsplash.com/photo-1761472317146-126f02f8b5ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Chordata - birds in flight / fish school (bird in flight - bright sky)
  'Chordata': 'https://images.unsplash.com/photo-1603217758698-3b285489b12a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Porifera - sponge reef close-up (sea sponge underwater reef - bright blue)
  'Porifera': 'https://images.unsplash.com/photo-1640107517554-be8d5e9d63c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Cnidaria - coral reef / jellyfish (colorful coral reef)
  'Cnidaria': 'https://images.unsplash.com/photo-1674785511474-231880067d4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Echinodermata - sea star / urchin underwater (starfish/sea star)
  'Echinodermata': 'https://images.unsplash.com/photo-1686672983786-ecba3822b7ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Bryozoa - kelp forest / colonial marine surface texture (kelp forest underwater)
  'Bryozoa': 'https://images.unsplash.com/photo-1567001847230-ed5da95bd055?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZWxwJTIwZm9yZXN0JTIwdW5kZXJ3YXRlcnxlbnwxfHx8fDE3NzA3MDYyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Annelida - soil/earthworm habitat macro OR sediment benthos (soil sediment texture - DISTINCT from fish)
  'Annelida': 'https://images.unsplash.com/photo-1579717511944-a9a4b1724da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2lsJTIwc2VkaW1lbnQlMjBiZW50aG9zJTIwbWFjcm98ZW58MXx8fHwxNzcwNzA2MjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Nematoda - microscope-style roundworm silhouette / lab micrograph texture (microscope roundworm - DISTINCT from Platyhelminthes)
  'Nematoda': 'https://images.unsplash.com/photo-1649583747374-78f3c6803ded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3VuZHdvcm0lMjBtaWNyb3Njb3BlJTIwbWljcm9ncmFwaHxlbnwxfHx8fDE3NzA3MDYyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Platyhelminthes - flatworm macro / microscope plate texture (flatworm underwater - DISTINCT from Nematoda)
  'Platyhelminthes': 'https://images.unsplash.com/photo-1584269134560-44d8145b7e9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGF0d29ybSUyMHVuZGVyd2F0ZXIlMjBtYWNyb3xlbnwxfHx8fDE3NzA3MDYyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // ===== PLANTAE PHYLA =====
  
  // Tracheophyta - fern canopy / vascular leaf veins (fern leaves - bright green)
  'Tracheophyta': 'https://images.unsplash.com/photo-1685250385544-1a931f0a2a31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // Bryophyta - moss macro / forest floor (moss macro - bright green, DISTINCT from Tracheophyta)
  'Bryophyta': 'https://images.unsplash.com/photo-1737688952619-36749a93bd1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  
  // ===== FUNGI PHYLA =====
  
  // Ascomycota - lichen crust / spore texture (lichen crust texture macro - DISTINCT from Basidiomycota)
  'Ascomycota': 'https://images.unsplash.com/photo-1761024590874-7d212079a623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWNoZW4lMjBjcnVzdCUyMHRleHR1cmUlMjBtYWNyb3xlbnwxfHx8fDE3NzA3MDYyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Basidiomycota - mushroom cluster / bracket fungi (bracket fungi cluster - DISTINCT from Ascomycota)
  'Basidiomycota': 'https://images.unsplash.com/photo-1702833215572-ccf1b0e33395?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFja2V0JTIwZnVuZ2klMjBtdXNocm9vbSUyMGNsdXN0ZXJ8ZW58MXx8fHwxNzcwNzA2MjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  
  // Default fallback - scientific microscope texture (never shown if all phyla are mapped)
  'default': 'https://images.unsplash.com/photo-1589527387410-0df9abad018e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Njb3BlJTIwY2VsbCUyMHRleHR1cmUlMjBzY2llbnRpZmljfGVufDF8fHx8MTc3MDcwNjI0OHww&ixlib=rb-4.1.0&q=80&w=1080'
};

// Phylum-specific gradient fallbacks (for when images fail to load)
// Each phylum gets a UNIQUE gradient to maintain visual distinction
export const phylumGradientFallbacks: Record<string, string> = {
  // Animalia phyla - each with distinct color scheme
  'Arthropoda': 'linear-gradient(135deg, #FF6B35 0%, #1A1C22 100%)', // Orange → black (insect/exoskeleton)
  'Mollusca': 'linear-gradient(135deg, #FFB6C1 0%, #1A1C22 100%)', // Shell pink → black
  'Chordata': 'linear-gradient(135deg, #60A5FA 0%, #1A1C22 100%)', // Sky blue → black
  'Porifera': 'linear-gradient(135deg, #3B82F6 0%, #1A1C22 100%)', // Deep blue → black (ocean)
  'Cnidaria': 'linear-gradient(135deg, #F59E0B 0%, #1A1C22 100%)', // Coral orange → black
  'Echinodermata': 'linear-gradient(135deg, #8B5CF6 0%, #1A1C22 100%)', // Purple → black (sea star)
  'Bryozoa': 'linear-gradient(135deg, #10B981 0%, #1A1C22 100%)', // Emerald → black (kelp)
  'Annelida': 'linear-gradient(135deg, #92400E 0%, #1A1C22 100%)', // Brown → black (soil)
  'Nematoda': 'linear-gradient(135deg, #14B8A6 0%, #1A1C22 100%)', // Teal → black (microscope/lab)
  'Platyhelminthes': 'linear-gradient(135deg, #A855F7 0%, #1A1C22 100%)', // Purple → black (distinct from Nematoda)
  
  // Plantae phyla
  'Tracheophyta': 'linear-gradient(135deg, #22C55E 0%, #1A1C22 100%)', // Green → black (vascular plants)
  'Bryophyta': 'linear-gradient(135deg, #84CC16 0%, #1A1C22 100%)', // Lime → black (moss, distinct from Tracheophyta)
  
  // Fungi phyla
  'Ascomycota': 'linear-gradient(135deg, #94A3B8 0%, #1A1C22 100%)', // Gray → black (lichen crust)
  'Basidiomycota': 'linear-gradient(135deg, #EF4444 0%, #1A1C22 100%)', // Red → black (mushroom caps)
  
  // Default
  'default': 'linear-gradient(135deg, #6366F1 0%, #1A1C22 100%)' // Indigo → black
};

export function getPhylumBannerImage(phylum: string): string {
  return phylumBannerImages[phylum] || phylumBannerImages['default'];
}

export function getPhylumGradientFallback(phylum: string): string {
  return phylumGradientFallbacks[phylum] || phylumGradientFallbacks['default'];
}
