// Vehicle database for Swiss car insurance forms
// Contains popular car brands and models sold in Switzerland

export interface VehicleModel {
  name: string;
  years: number[]; // Production years available
}

export interface VehicleBrand {
  name: string;
  logo?: string;
  models: VehicleModel[];
}

// Generate year range helper
const yearRange = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// Current year for reference
const currentYear = new Date().getFullYear();

export const vehicleBrands: VehicleBrand[] = [
  {
    name: "Abarth",
    models: [
      { name: "500", years: yearRange(2008, currentYear) },
      { name: "595", years: yearRange(2012, currentYear) },
      { name: "695", years: yearRange(2017, currentYear) },
    ],
  },
  {
    name: "Alfa Romeo",
    models: [
      { name: "Giulia", years: yearRange(2016, currentYear) },
      { name: "Giulietta", years: yearRange(2010, 2021) },
      { name: "Stelvio", years: yearRange(2017, currentYear) },
      { name: "Tonale", years: yearRange(2022, currentYear) },
      { name: "147", years: yearRange(2000, 2010) },
      { name: "159", years: yearRange(2005, 2011) },
      { name: "MiTo", years: yearRange(2008, 2018) },
    ],
  },
  {
    name: "Audi",
    models: [
      { name: "A1", years: yearRange(2010, currentYear) },
      { name: "A3", years: yearRange(1996, currentYear) },
      { name: "A4", years: yearRange(1994, currentYear) },
      { name: "A5", years: yearRange(2007, currentYear) },
      { name: "A6", years: yearRange(1994, currentYear) },
      { name: "A7", years: yearRange(2010, currentYear) },
      { name: "A8", years: yearRange(1994, currentYear) },
      { name: "Q2", years: yearRange(2016, currentYear) },
      { name: "Q3", years: yearRange(2011, currentYear) },
      { name: "Q4 e-tron", years: yearRange(2021, currentYear) },
      { name: "Q5", years: yearRange(2008, currentYear) },
      { name: "Q7", years: yearRange(2005, currentYear) },
      { name: "Q8", years: yearRange(2018, currentYear) },
      { name: "e-tron", years: yearRange(2019, currentYear) },
      { name: "e-tron GT", years: yearRange(2021, currentYear) },
      { name: "TT", years: yearRange(1998, 2023) },
      { name: "RS3", years: yearRange(2011, currentYear) },
      { name: "RS4", years: yearRange(2006, currentYear) },
      { name: "RS5", years: yearRange(2010, currentYear) },
      { name: "RS6", years: yearRange(2008, currentYear) },
      { name: "RS7", years: yearRange(2013, currentYear) },
      { name: "S3", years: yearRange(1999, currentYear) },
      { name: "S4", years: yearRange(1997, currentYear) },
      { name: "S5", years: yearRange(2007, currentYear) },
    ],
  },
  {
    name: "BMW",
    models: [
      { name: "Série 1", years: yearRange(2004, currentYear) },
      { name: "Série 2", years: yearRange(2014, currentYear) },
      { name: "Série 3", years: yearRange(1990, currentYear) },
      { name: "Série 4", years: yearRange(2013, currentYear) },
      { name: "Série 5", years: yearRange(1990, currentYear) },
      { name: "Série 6", years: yearRange(2003, 2018) },
      { name: "Série 7", years: yearRange(1994, currentYear) },
      { name: "Série 8", years: yearRange(2018, currentYear) },
      { name: "X1", years: yearRange(2009, currentYear) },
      { name: "X2", years: yearRange(2018, currentYear) },
      { name: "X3", years: yearRange(2003, currentYear) },
      { name: "X4", years: yearRange(2014, currentYear) },
      { name: "X5", years: yearRange(1999, currentYear) },
      { name: "X6", years: yearRange(2008, currentYear) },
      { name: "X7", years: yearRange(2019, currentYear) },
      { name: "Z4", years: yearRange(2002, currentYear) },
      { name: "i3", years: yearRange(2013, 2022) },
      { name: "i4", years: yearRange(2021, currentYear) },
      { name: "i5", years: yearRange(2023, currentYear) },
      { name: "i7", years: yearRange(2022, currentYear) },
      { name: "iX", years: yearRange(2021, currentYear) },
      { name: "iX1", years: yearRange(2022, currentYear) },
      { name: "iX3", years: yearRange(2020, currentYear) },
      { name: "M2", years: yearRange(2016, currentYear) },
      { name: "M3", years: yearRange(1992, currentYear) },
      { name: "M4", years: yearRange(2014, currentYear) },
      { name: "M5", years: yearRange(1998, currentYear) },
    ],
  },
  {
    name: "Citroën",
    models: [
      { name: "C1", years: yearRange(2005, 2022) },
      { name: "C3", years: yearRange(2002, currentYear) },
      { name: "C3 Aircross", years: yearRange(2017, currentYear) },
      { name: "C4", years: yearRange(2004, currentYear) },
      { name: "C4 Picasso", years: yearRange(2006, 2018) },
      { name: "C5", years: yearRange(2001, 2017) },
      { name: "C5 Aircross", years: yearRange(2018, currentYear) },
      { name: "C5 X", years: yearRange(2022, currentYear) },
      { name: "Berlingo", years: yearRange(1996, currentYear) },
      { name: "SpaceTourer", years: yearRange(2016, currentYear) },
      { name: "ë-C3", years: yearRange(2024, currentYear) },
      { name: "ë-C4", years: yearRange(2020, currentYear) },
    ],
  },
  {
    name: "Cupra",
    models: [
      { name: "Ateca", years: yearRange(2018, currentYear) },
      { name: "Born", years: yearRange(2021, currentYear) },
      { name: "Formentor", years: yearRange(2020, currentYear) },
      { name: "Leon", years: yearRange(2020, currentYear) },
      { name: "Tavascan", years: yearRange(2024, currentYear) },
    ],
  },
  {
    name: "Dacia",
    models: [
      { name: "Duster", years: yearRange(2010, currentYear) },
      { name: "Sandero", years: yearRange(2008, currentYear) },
      { name: "Logan", years: yearRange(2004, currentYear) },
      { name: "Spring", years: yearRange(2021, currentYear) },
      { name: "Jogger", years: yearRange(2022, currentYear) },
    ],
  },
  {
    name: "Fiat",
    models: [
      { name: "500", years: yearRange(2007, currentYear) },
      { name: "500e", years: yearRange(2020, currentYear) },
      { name: "500X", years: yearRange(2014, currentYear) },
      { name: "600", years: yearRange(2024, currentYear) },
      { name: "Panda", years: yearRange(2003, currentYear) },
      { name: "Tipo", years: yearRange(2016, currentYear) },
      { name: "Punto", years: yearRange(1993, 2018) },
      { name: "Doblo", years: yearRange(2001, currentYear) },
    ],
  },
  {
    name: "Ford",
    models: [
      { name: "Fiesta", years: yearRange(1995, 2023) },
      { name: "Focus", years: yearRange(1998, currentYear) },
      { name: "Mondeo", years: yearRange(1993, 2022) },
      { name: "Kuga", years: yearRange(2008, currentYear) },
      { name: "Puma", years: yearRange(2019, currentYear) },
      { name: "EcoSport", years: yearRange(2013, 2022) },
      { name: "Explorer", years: yearRange(2019, currentYear) },
      { name: "Mustang", years: yearRange(2015, currentYear) },
      { name: "Mustang Mach-E", years: yearRange(2020, currentYear) },
      { name: "S-MAX", years: yearRange(2006, currentYear) },
      { name: "Galaxy", years: yearRange(1995, currentYear) },
      { name: "Transit", years: yearRange(1995, currentYear) },
      { name: "Transit Custom", years: yearRange(2012, currentYear) },
      { name: "Ranger", years: yearRange(2011, currentYear) },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "Civic", years: yearRange(1995, currentYear) },
      { name: "Jazz", years: yearRange(2001, currentYear) },
      { name: "HR-V", years: yearRange(2015, currentYear) },
      { name: "CR-V", years: yearRange(1996, currentYear) },
      { name: "ZR-V", years: yearRange(2023, currentYear) },
      { name: "e", years: yearRange(2020, currentYear) },
      { name: "e:Ny1", years: yearRange(2023, currentYear) },
      { name: "Accord", years: yearRange(1990, 2015) },
    ],
  },
  {
    name: "Hyundai",
    models: [
      { name: "i10", years: yearRange(2008, currentYear) },
      { name: "i20", years: yearRange(2008, currentYear) },
      { name: "i30", years: yearRange(2007, currentYear) },
      { name: "Kona", years: yearRange(2017, currentYear) },
      { name: "Kona Electric", years: yearRange(2018, currentYear) },
      { name: "Tucson", years: yearRange(2004, currentYear) },
      { name: "Santa Fe", years: yearRange(2001, currentYear) },
      { name: "Ioniq", years: yearRange(2016, 2022) },
      { name: "Ioniq 5", years: yearRange(2021, currentYear) },
      { name: "Ioniq 6", years: yearRange(2022, currentYear) },
      { name: "Bayon", years: yearRange(2021, currentYear) },
      { name: "Nexo", years: yearRange(2018, currentYear) },
    ],
  },
  {
    name: "Jaguar",
    models: [
      { name: "E-Pace", years: yearRange(2017, currentYear) },
      { name: "F-Pace", years: yearRange(2016, currentYear) },
      { name: "I-Pace", years: yearRange(2018, currentYear) },
      { name: "XE", years: yearRange(2015, currentYear) },
      { name: "XF", years: yearRange(2008, currentYear) },
      { name: "XJ", years: yearRange(1994, 2019) },
      { name: "F-Type", years: yearRange(2013, currentYear) },
    ],
  },
  {
    name: "Jeep",
    models: [
      { name: "Renegade", years: yearRange(2014, currentYear) },
      { name: "Compass", years: yearRange(2017, currentYear) },
      { name: "Cherokee", years: yearRange(2014, currentYear) },
      { name: "Grand Cherokee", years: yearRange(1999, currentYear) },
      { name: "Wrangler", years: yearRange(1997, currentYear) },
      { name: "Avenger", years: yearRange(2023, currentYear) },
    ],
  },
  {
    name: "Kia",
    models: [
      { name: "Picanto", years: yearRange(2004, currentYear) },
      { name: "Rio", years: yearRange(2000, currentYear) },
      { name: "Ceed", years: yearRange(2007, currentYear) },
      { name: "Sportage", years: yearRange(2004, currentYear) },
      { name: "Sorento", years: yearRange(2002, currentYear) },
      { name: "Stonic", years: yearRange(2017, currentYear) },
      { name: "Niro", years: yearRange(2016, currentYear) },
      { name: "EV6", years: yearRange(2021, currentYear) },
      { name: "EV9", years: yearRange(2023, currentYear) },
      { name: "Stinger", years: yearRange(2017, currentYear) },
      { name: "XCeed", years: yearRange(2019, currentYear) },
      { name: "Soul", years: yearRange(2009, currentYear) },
    ],
  },
  {
    name: "Land Rover",
    models: [
      { name: "Defender", years: yearRange(2020, currentYear) },
      { name: "Discovery", years: yearRange(1998, currentYear) },
      { name: "Discovery Sport", years: yearRange(2014, currentYear) },
      { name: "Range Rover", years: yearRange(1994, currentYear) },
      { name: "Range Rover Sport", years: yearRange(2005, currentYear) },
      { name: "Range Rover Velar", years: yearRange(2017, currentYear) },
      { name: "Range Rover Evoque", years: yearRange(2011, currentYear) },
    ],
  },
  {
    name: "Lexus",
    models: [
      { name: "CT", years: yearRange(2011, 2022) },
      { name: "IS", years: yearRange(1999, currentYear) },
      { name: "ES", years: yearRange(2018, currentYear) },
      { name: "NX", years: yearRange(2014, currentYear) },
      { name: "RX", years: yearRange(1998, currentYear) },
      { name: "UX", years: yearRange(2018, currentYear) },
      { name: "RZ", years: yearRange(2023, currentYear) },
      { name: "LC", years: yearRange(2017, currentYear) },
      { name: "LS", years: yearRange(2006, currentYear) },
    ],
  },
  {
    name: "Mazda",
    models: [
      { name: "2", years: yearRange(2007, currentYear) },
      { name: "3", years: yearRange(2003, currentYear) },
      { name: "6", years: yearRange(2002, currentYear) },
      { name: "CX-3", years: yearRange(2015, currentYear) },
      { name: "CX-30", years: yearRange(2019, currentYear) },
      { name: "CX-5", years: yearRange(2012, currentYear) },
      { name: "CX-60", years: yearRange(2022, currentYear) },
      { name: "MX-5", years: yearRange(1998, currentYear) },
      { name: "MX-30", years: yearRange(2020, currentYear) },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "Classe A", years: yearRange(1997, currentYear) },
      { name: "Classe B", years: yearRange(2005, currentYear) },
      { name: "Classe C", years: yearRange(1993, currentYear) },
      { name: "Classe E", years: yearRange(1993, currentYear) },
      { name: "Classe S", years: yearRange(1993, currentYear) },
      { name: "CLA", years: yearRange(2013, currentYear) },
      { name: "CLS", years: yearRange(2004, currentYear) },
      { name: "GLA", years: yearRange(2014, currentYear) },
      { name: "GLB", years: yearRange(2019, currentYear) },
      { name: "GLC", years: yearRange(2015, currentYear) },
      { name: "GLE", years: yearRange(2015, currentYear) },
      { name: "GLS", years: yearRange(2016, currentYear) },
      { name: "EQA", years: yearRange(2021, currentYear) },
      { name: "EQB", years: yearRange(2021, currentYear) },
      { name: "EQC", years: yearRange(2019, 2023) },
      { name: "EQE", years: yearRange(2022, currentYear) },
      { name: "EQS", years: yearRange(2021, currentYear) },
      { name: "AMG GT", years: yearRange(2015, currentYear) },
      { name: "Vito", years: yearRange(1996, currentYear) },
      { name: "Classe V", years: yearRange(2014, currentYear) },
      { name: "Sprinter", years: yearRange(1995, currentYear) },
    ],
  },
  {
    name: "Mini",
    models: [
      { name: "Mini 3 portes", years: yearRange(2001, currentYear) },
      { name: "Mini 5 portes", years: yearRange(2014, currentYear) },
      { name: "Clubman", years: yearRange(2007, currentYear) },
      { name: "Countryman", years: yearRange(2010, currentYear) },
      { name: "Cabrio", years: yearRange(2004, currentYear) },
      { name: "Cooper SE", years: yearRange(2020, currentYear) },
    ],
  },
  {
    name: "Mitsubishi",
    models: [
      { name: "Space Star", years: yearRange(2013, currentYear) },
      { name: "ASX", years: yearRange(2010, currentYear) },
      { name: "Eclipse Cross", years: yearRange(2017, currentYear) },
      { name: "Outlander", years: yearRange(2003, currentYear) },
      { name: "L200", years: yearRange(1996, currentYear) },
    ],
  },
  {
    name: "Nissan",
    models: [
      { name: "Micra", years: yearRange(1992, currentYear) },
      { name: "Juke", years: yearRange(2010, currentYear) },
      { name: "Qashqai", years: yearRange(2007, currentYear) },
      { name: "X-Trail", years: yearRange(2001, currentYear) },
      { name: "Leaf", years: yearRange(2011, currentYear) },
      { name: "Ariya", years: yearRange(2022, currentYear) },
      { name: "Navara", years: yearRange(2005, currentYear) },
      { name: "GT-R", years: yearRange(2009, 2024) },
    ],
  },
  {
    name: "Opel",
    models: [
      { name: "Corsa", years: yearRange(1993, currentYear) },
      { name: "Corsa-e", years: yearRange(2020, currentYear) },
      { name: "Astra", years: yearRange(1991, currentYear) },
      { name: "Mokka", years: yearRange(2012, currentYear) },
      { name: "Mokka-e", years: yearRange(2021, currentYear) },
      { name: "Crossland", years: yearRange(2017, currentYear) },
      { name: "Grandland", years: yearRange(2017, currentYear) },
      { name: "Combo", years: yearRange(2018, currentYear) },
      { name: "Zafira", years: yearRange(1999, 2019) },
      { name: "Insignia", years: yearRange(2008, currentYear) },
      { name: "Vivaro", years: yearRange(2001, currentYear) },
    ],
  },
  {
    name: "Peugeot",
    models: [
      { name: "108", years: yearRange(2014, 2022) },
      { name: "208", years: yearRange(2012, currentYear) },
      { name: "e-208", years: yearRange(2019, currentYear) },
      { name: "308", years: yearRange(2007, currentYear) },
      { name: "e-308", years: yearRange(2023, currentYear) },
      { name: "408", years: yearRange(2022, currentYear) },
      { name: "508", years: yearRange(2010, currentYear) },
      { name: "2008", years: yearRange(2013, currentYear) },
      { name: "e-2008", years: yearRange(2020, currentYear) },
      { name: "3008", years: yearRange(2016, currentYear) },
      { name: "5008", years: yearRange(2009, currentYear) },
      { name: "Rifter", years: yearRange(2018, currentYear) },
      { name: "Traveller", years: yearRange(2016, currentYear) },
      { name: "Partner", years: yearRange(1996, currentYear) },
      { name: "Expert", years: yearRange(2016, currentYear) },
    ],
  },
  {
    name: "Porsche",
    models: [
      { name: "911", years: yearRange(1990, currentYear) },
      { name: "718 Boxster", years: yearRange(2016, currentYear) },
      { name: "718 Cayman", years: yearRange(2016, currentYear) },
      { name: "Panamera", years: yearRange(2009, currentYear) },
      { name: "Cayenne", years: yearRange(2002, currentYear) },
      { name: "Macan", years: yearRange(2014, currentYear) },
      { name: "Taycan", years: yearRange(2019, currentYear) },
    ],
  },
  {
    name: "Renault",
    models: [
      { name: "Twingo", years: yearRange(1993, currentYear) },
      { name: "Clio", years: yearRange(1990, currentYear) },
      { name: "Captur", years: yearRange(2013, currentYear) },
      { name: "Mégane", years: yearRange(1995, currentYear) },
      { name: "Mégane E-Tech", years: yearRange(2022, currentYear) },
      { name: "Scenic", years: yearRange(1996, currentYear) },
      { name: "Kadjar", years: yearRange(2015, 2022) },
      { name: "Arkana", years: yearRange(2021, currentYear) },
      { name: "Austral", years: yearRange(2022, currentYear) },
      { name: "Espace", years: yearRange(1991, currentYear) },
      { name: "Trafic", years: yearRange(2001, currentYear) },
      { name: "Master", years: yearRange(1998, currentYear) },
      { name: "Kangoo", years: yearRange(1997, currentYear) },
      { name: "ZOE", years: yearRange(2012, currentYear) },
    ],
  },
  {
    name: "Seat",
    models: [
      { name: "Ibiza", years: yearRange(1993, currentYear) },
      { name: "Leon", years: yearRange(1999, currentYear) },
      { name: "Arona", years: yearRange(2017, currentYear) },
      { name: "Ateca", years: yearRange(2016, currentYear) },
      { name: "Tarraco", years: yearRange(2018, currentYear) },
      { name: "Alhambra", years: yearRange(1996, 2020) },
    ],
  },
  {
    name: "Škoda",
    models: [
      { name: "Fabia", years: yearRange(1999, currentYear) },
      { name: "Scala", years: yearRange(2019, currentYear) },
      { name: "Octavia", years: yearRange(1996, currentYear) },
      { name: "Superb", years: yearRange(2001, currentYear) },
      { name: "Kamiq", years: yearRange(2019, currentYear) },
      { name: "Karoq", years: yearRange(2017, currentYear) },
      { name: "Kodiaq", years: yearRange(2016, currentYear) },
      { name: "Enyaq iV", years: yearRange(2021, currentYear) },
      { name: "Elroq", years: yearRange(2024, currentYear) },
    ],
  },
  {
    name: "Smart",
    models: [
      { name: "ForTwo", years: yearRange(1998, currentYear) },
      { name: "ForFour", years: yearRange(2014, currentYear) },
      { name: "#1", years: yearRange(2023, currentYear) },
      { name: "#3", years: yearRange(2023, currentYear) },
    ],
  },
  {
    name: "Subaru",
    models: [
      { name: "Impreza", years: yearRange(1993, currentYear) },
      { name: "XV", years: yearRange(2012, currentYear) },
      { name: "Forester", years: yearRange(1997, currentYear) },
      { name: "Outback", years: yearRange(1996, currentYear) },
      { name: "Levorg", years: yearRange(2015, currentYear) },
      { name: "BRZ", years: yearRange(2012, currentYear) },
      { name: "Solterra", years: yearRange(2022, currentYear) },
    ],
  },
  {
    name: "Suzuki",
    models: [
      { name: "Swift", years: yearRange(2004, currentYear) },
      { name: "Ignis", years: yearRange(2016, currentYear) },
      { name: "Vitara", years: yearRange(2015, currentYear) },
      { name: "S-Cross", years: yearRange(2013, currentYear) },
      { name: "Jimny", years: yearRange(1998, currentYear) },
      { name: "Swace", years: yearRange(2020, currentYear) },
      { name: "Across", years: yearRange(2020, currentYear) },
    ],
  },
  {
    name: "Tesla",
    models: [
      { name: "Model 3", years: yearRange(2017, currentYear) },
      { name: "Model Y", years: yearRange(2020, currentYear) },
      { name: "Model S", years: yearRange(2012, currentYear) },
      { name: "Model X", years: yearRange(2015, currentYear) },
      { name: "Cybertruck", years: yearRange(2024, currentYear) },
    ],
  },
  {
    name: "Toyota",
    models: [
      { name: "Aygo", years: yearRange(2005, 2023) },
      { name: "Aygo X", years: yearRange(2022, currentYear) },
      { name: "Yaris", years: yearRange(1999, currentYear) },
      { name: "Yaris Cross", years: yearRange(2021, currentYear) },
      { name: "Corolla", years: yearRange(1997, currentYear) },
      { name: "C-HR", years: yearRange(2016, currentYear) },
      { name: "Camry", years: yearRange(2019, currentYear) },
      { name: "Prius", years: yearRange(1997, currentYear) },
      { name: "RAV4", years: yearRange(1994, currentYear) },
      { name: "Highlander", years: yearRange(2021, currentYear) },
      { name: "Land Cruiser", years: yearRange(1996, currentYear) },
      { name: "bZ4X", years: yearRange(2022, currentYear) },
      { name: "Supra", years: yearRange(2019, currentYear) },
      { name: "GR86", years: yearRange(2022, currentYear) },
      { name: "Proace", years: yearRange(2016, currentYear) },
      { name: "Proace City", years: yearRange(2020, currentYear) },
      { name: "Hilux", years: yearRange(2005, currentYear) },
    ],
  },
  {
    name: "Volkswagen",
    models: [
      { name: "up!", years: yearRange(2011, currentYear) },
      { name: "e-up!", years: yearRange(2013, currentYear) },
      { name: "Polo", years: yearRange(1994, currentYear) },
      { name: "Golf", years: yearRange(1991, currentYear) },
      { name: "ID.3", years: yearRange(2020, currentYear) },
      { name: "ID.4", years: yearRange(2021, currentYear) },
      { name: "ID.5", years: yearRange(2022, currentYear) },
      { name: "ID.7", years: yearRange(2023, currentYear) },
      { name: "ID.Buzz", years: yearRange(2022, currentYear) },
      { name: "T-Cross", years: yearRange(2018, currentYear) },
      { name: "Taigo", years: yearRange(2021, currentYear) },
      { name: "T-Roc", years: yearRange(2017, currentYear) },
      { name: "Tiguan", years: yearRange(2007, currentYear) },
      { name: "Tiguan Allspace", years: yearRange(2017, currentYear) },
      { name: "Touareg", years: yearRange(2002, currentYear) },
      { name: "Passat", years: yearRange(1993, currentYear) },
      { name: "Arteon", years: yearRange(2017, currentYear) },
      { name: "Touran", years: yearRange(2003, currentYear) },
      { name: "Sharan", years: yearRange(1995, 2022) },
      { name: "Multivan", years: yearRange(2021, currentYear) },
      { name: "Transporter", years: yearRange(1990, currentYear) },
      { name: "California", years: yearRange(2003, currentYear) },
      { name: "Caddy", years: yearRange(1996, currentYear) },
      { name: "Crafter", years: yearRange(2006, currentYear) },
      { name: "Amarok", years: yearRange(2010, currentYear) },
    ],
  },
  {
    name: "Volvo",
    models: [
      { name: "XC40", years: yearRange(2017, currentYear) },
      { name: "C40 Recharge", years: yearRange(2021, currentYear) },
      { name: "XC60", years: yearRange(2008, currentYear) },
      { name: "XC90", years: yearRange(2002, currentYear) },
      { name: "EX30", years: yearRange(2024, currentYear) },
      { name: "EX90", years: yearRange(2024, currentYear) },
      { name: "S60", years: yearRange(2000, currentYear) },
      { name: "S90", years: yearRange(2016, currentYear) },
      { name: "V60", years: yearRange(2010, currentYear) },
      { name: "V90", years: yearRange(2016, currentYear) },
    ],
  },
];

// Get all brand names for autocomplete
export const getAllBrandNames = (): string[] => {
  return vehicleBrands.map((brand) => brand.name);
};

// Get models for a specific brand
export const getModelsForBrand = (brandName: string): VehicleModel[] => {
  const brand = vehicleBrands.find(
    (b) => b.name.toLowerCase() === brandName.toLowerCase()
  );
  return brand?.models || [];
};

// Get model names for a specific brand
export const getModelNamesForBrand = (brandName: string): string[] => {
  return getModelsForBrand(brandName).map((m) => m.name);
};

// Get years for a specific brand and model
export const getYearsForModel = (brandName: string, modelName: string): number[] => {
  const models = getModelsForBrand(brandName);
  const model = models.find((m) => m.name.toLowerCase() === modelName.toLowerCase());
  return model?.years || [];
};

// Search brands by partial name
export const searchBrands = (query: string): VehicleBrand[] => {
  if (!query) return vehicleBrands;
  const lowerQuery = query.toLowerCase();
  return vehicleBrands.filter((brand) =>
    brand.name.toLowerCase().includes(lowerQuery)
  );
};

// Search models by partial name within a brand
export const searchModels = (brandName: string, query: string): VehicleModel[] => {
  const models = getModelsForBrand(brandName);
  if (!query) return models;
  const lowerQuery = query.toLowerCase();
  return models.filter((model) =>
    model.name.toLowerCase().includes(lowerQuery)
  );
};
