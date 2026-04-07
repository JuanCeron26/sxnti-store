import * as Icons from 'lucide-react';

// Buscar específicamente Instagram
const iconNames = Object.keys(Icons);
const instagramIcon = iconNames.find(name => 
  name.toLowerCase().includes('youtube')
);
console.log('¿Existe Instagram?', instagramIcon);

// Ver todos los que contienen 'insta'
const socialIcons = iconNames.filter(name => 
  name.toLowerCase().includes('insta')
);
console.log('Íconos relacionados:', socialIcons);