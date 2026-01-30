export const swissCantons = [
  { code: "AG", name: "Aargau", nameFr: "Argovie", nameIt: "Argovia" },
  { code: "AI", name: "Appenzell Innerrhoden", nameFr: "Appenzell Rhodes-Intérieures", nameIt: "Appenzello Interno" },
  { code: "AR", name: "Appenzell Ausserrhoden", nameFr: "Appenzell Rhodes-Extérieures", nameIt: "Appenzello Esterno" },
  { code: "BE", name: "Bern", nameFr: "Berne", nameIt: "Berna" },
  { code: "BL", name: "Basel-Landschaft", nameFr: "Bâle-Campagne", nameIt: "Basilea Campagna" },
  { code: "BS", name: "Basel-Stadt", nameFr: "Bâle-Ville", nameIt: "Basilea Città" },
  { code: "FR", name: "Fribourg", nameFr: "Fribourg", nameIt: "Friburgo" },
  { code: "GE", name: "Geneva", nameFr: "Genève", nameIt: "Ginevra" },
  { code: "GL", name: "Glarus", nameFr: "Glaris", nameIt: "Glarona" },
  { code: "GR", name: "Graubünden", nameFr: "Grisons", nameIt: "Grigioni" },
  { code: "JU", name: "Jura", nameFr: "Jura", nameIt: "Giura" },
  { code: "LU", name: "Lucerne", nameFr: "Lucerne", nameIt: "Lucerna" },
  { code: "NE", name: "Neuchâtel", nameFr: "Neuchâtel", nameIt: "Neuchâtel" },
  { code: "NW", name: "Nidwalden", nameFr: "Nidwald", nameIt: "Nidvaldo" },
  { code: "OW", name: "Obwalden", nameFr: "Obwald", nameIt: "Obvaldo" },
  { code: "SG", name: "St. Gallen", nameFr: "Saint-Gall", nameIt: "San Gallo" },
  { code: "SH", name: "Schaffhausen", nameFr: "Schaffhouse", nameIt: "Sciaffusa" },
  { code: "SO", name: "Solothurn", nameFr: "Soleure", nameIt: "Soletta" },
  { code: "SZ", name: "Schwyz", nameFr: "Schwytz", nameIt: "Svitto" },
  { code: "TG", name: "Thurgau", nameFr: "Thurgovie", nameIt: "Turgovia" },
  { code: "TI", name: "Ticino", nameFr: "Tessin", nameIt: "Ticino" },
  { code: "UR", name: "Uri", nameFr: "Uri", nameIt: "Uri" },
  { code: "VD", name: "Vaud", nameFr: "Vaud", nameIt: "Vaud" },
  { code: "VS", name: "Valais", nameFr: "Valais", nameIt: "Vallese" },
  { code: "ZG", name: "Zug", nameFr: "Zoug", nameIt: "Zugo" },
  { code: "ZH", name: "Zürich", nameFr: "Zurich", nameIt: "Zurigo" },
];

export const getCantonName = (code: string, language: string): string => {
  const canton = swissCantons.find((c) => c.code === code);
  if (!canton) return code;
  
  switch (language) {
    case "fr":
      return canton.nameFr;
    case "it":
      return canton.nameIt;
    default:
      return canton.name;
  }
};
