export interface Arrondissement {
  name: string;
}

export interface Department {
  name: string;
  arrondissements: string[];
}

export interface Region {
  name: string;
  departments: Department[];
}

export const cameroonRegions: Region[] = [
  {
    name: "Adamaoua",
    departments: [
      { name: "Djérem", arrondissements: ["Tibati", "Ngaoundal"] },
      { name: "Faro-et-Déo", arrondissements: ["Tignère", "Galim-Tignère", "Kontcha", "Mayo-Baléo"] },
      { name: "Mayo-Banyo", arrondissements: ["Banyo", "Bankim", "Mayo-Darlé"] },
      { name: "Mbéré", arrondissements: ["Meiganga", "Djohong", "Dir", "Ngaoui"] },
      { name: "Vina", arrondissements: ["Ngaoundéré", "Belel", "Martap", "Mbé", "Nyambaka"] }
    ]
  },
  {
    name: "Centre",
    departments: [
      { name: "Haute-Sanaga", arrondissements: ["Nanga-Eboko", "Mbandjock", "Minta", "Nkoteng", "Nsem"] },
      { name: "Lekié", arrondissements: ["Monatélé", "Batchenga", "Ebebda", "Elig-Mfomo", "Evodoula", "Obala", "Okola", "Sa'a"] },
      { name: "Mbam-et-Inoubou", arrondissements: ["Bafia", "Bokito", "Deuk", "Kiiki", "Kon-Yambetta", "Makenene", "Ndikinemeki", "Nitoukou", "Ombessa"] },
      { name: "Mbam-et-Kim", arrondissements: ["Ntui", "Mbangassina", "Ngambè-Tikar", "Ngoro", "Yoko"] },
      { name: "Méfou-et-Afamba", arrondissements: ["Mfou", "Afanloum", "Adzopé", "Awae", "Ebebda", "Esse", "Nkolafamba", "Soa"] },
      { name: "Méfou-et-Akono", arrondissements: ["Ngoumou", "Akono", "Bikok", "Mbankomo"] },
      { name: "Mfoundi", arrondissements: ["Yaoundé I", "Yaoundé II", "Yaoundé III", "Yaoundé IV", "Yaoundé V", "Yaoundé VI", "Yaoundé VII"] },
      { name: "Nyong-et-Kellé", arrondissements: ["Eséka", "Biyouha", "Bot-Makak", "Dibang", "Makak", "Matomb", "Messondo", "Ngog-Mapubi", "Nguibassal"] },
      { name: "Nyong-et-Mfoumou", arrondissements: ["Akonolinga", "Ayos", "Endom", "Mengang", "Nyakokombo"] },
      { name: "Nyong-et-So'o", arrondissements: ["Mbalmayo", "Mengueme", "Ngomedzap", "Nkolmetet"] }
    ]
  },
  {
    name: "Est",
    departments: [
      { name: "Boumba-et-Ngoko", arrondissements: ["Yokadouma", "Gari-Gombo", "Moloundou", "Salapoumbé"] },
      { name: "Haut-Nyong", arrondissements: ["Abong-Mbang", "Atok", "Dimako", "Doumaintang", "Doumé", "Lomié", "Mboma", "Messamena", "Messok", "Mindourou", "Ngoyla", "Nguelemendouka", "Somalomo"] },
      { name: "Kadey", arrondissements: ["Batouri", "Kette", "Mbang", "Ndelele", "Nguelebok", "Ouli"] },
      { name: "Lom-et-Djérem", arrondissements: ["Bertoua", "Bétaré-Oya", "Diang", "Garoua-Boulaï", "Mandjou", "Ngoura"] }
    ]
  },
  {
    name: "Extrême-Nord",
    departments: [
      { name: "Diamaré", arrondissements: ["Maroua I", "Maroua II", "Maroua III", "Bogo", "Dargala", "Gazawa", "Meri", "Ndoukoula", "Pette"] },
      { name: "Logone-et-Chari", arrondissements: ["Kousseri", "Blangoua", "Darak", "Fotokol", "Goulfey", "Hile-Alifa", "Logone-Birni", "Makary", "Waza", "Zina"] },
      { name: "Mayo-Danay", arrondissements: ["Yagoua", "Datcheka", "Guéré", "Kai-Kai", "Kar-Hay", "Maga", "Tchatibali", "Vele", "Wina"] },
      { name: "Mayo-Kani", arrondissements: ["Kaélé", "Guidiguis", "Mindif", "Moulvoudaye", "Moutourwa", "Touloum", "Porhi"] },
      { name: "Mayo-Sava", arrondissements: ["Mora", "Kolofata", "Tokombéré"] },
      { name: "Mayo-Tsanaga", arrondissements: ["Mokolo", "Bourrha", "Hina", "Koza", "Mogodé", "Mozogo", "Soulédé-Roua"] }
    ]
  },
  {
    name: "Littoral",
    departments: [
      { name: "Moungo", arrondissements: ["Nkongsamba", "Loum", "Manjo", "Mbanga", "Melong", "Mombo", "Njombé-Penja"] },
      { name: "Nkam", arrondissements: ["Yabassi", "Nkondjock", "Nord-Makombé", "Yingui"] },
      { name: "Sanaga-Maritime", arrondissements: ["Edéa", "Dibamba", "Dizangué", "Massock-Songloulou", "Mouanko", "Ndom", "Ngambe", "Ngwei", "Nyanon", "Pouma"] },
      { name: "Wouri", arrondissements: ["Douala I", "Douala II", "Douala III", "Douala IV", "Douala V", "Douala VI"] }
    ]
  },
  {
    name: "Nord",
    departments: [
      { name: "Bénoué", arrondissements: ["Garoua I", "Garoua II", "Garoua III", "Bashéo", "Bibémi", "Dembo", "Lagdo", "Pitoa", "Tcheboa"] },
      { name: "Faro", arrondissements: ["Poli", "Béka", "Tchamba"] },
      { name: "Mayo-Louti", arrondissements: ["Guider", "Figuil", "Mayo-Oulo"] },
      { name: "Mayo-Rey", arrondissements: ["Tcholliré", "Madingrin", "Rey-Bouba", "Touboro"] }
    ]
  },
  {
    name: "Nord-Ouest",
    departments: [
      { name: "Boyo", arrondissements: ["Fundong", "Belo", "Njinikom"] },
      { name: "Bui", arrondissements: ["Kumbo", "Jakiri", "Mbiame", "Nkum", "Noni", "Oku"] },
      { name: "Donga-Mantung", arrondissements: ["Nkambé", "Ako", "Misaje", "Ndu", "Nwa"] },
      { name: "Menchum", arrondissements: ["Wum", "Benakuma", "Furu-Awa", "Menchum Valley", "Zhoa"] },
      { name: "Mezam", arrondissements: ["Bamenda I", "Bamenda II", "Bamenda III", "Bafut", "Bali", "Santa", "Tubah"] },
      { name: "Momo", arrondissements: ["Mbengwi", "Andek", "Batibo", "Njikwa", "Widikum-Boffe"] },
      { name: "Ngo-Ketunjia", arrondissements: ["Ndop", "Balikumbat", "Babessi"] }
    ]
  },
  {
    name: "Ouest",
    departments: [
      { name: "Bamboutos", arrondissements: ["Mbouda", "Babadjou", "Batcham", "Galim"] },
      { name: "Haut-Nkam", arrondissements: ["Bafang", "Bakou", "Bana", "Bandja", "Kekem"] },
      { name: "Hauts-Plateaux", arrondissements: ["Baham", "Bamendjou", "Bangou", "Batié"] },
      { name: "Koung-Khi", arrondissements: ["Poumougne", "Bayangam", "Djebem"] },
      { name: "Menoua", arrondissements: ["Dschang", "Fongo-Tongo", "Fokoué", "Nkong-Zem", "Penka-Michel", "Santchou"] },
      { name: "Mifi", arrondissements: ["Bafoussam I", "Bafoussam II", "Bafoussam III"] },
      { name: "Ndé", arrondissements: ["Bangangté", "Bassamba", "Bazou", "Tonga"] },
      { name: "Noun", arrondissements: ["Foumban", "Foumbot", "Kouoptamo", "Koutaba", "Magba", "Malantouen", "Massangam", "Njimom"] }
    ]
  },
  {
    name: "Sud",
    departments: [
      { name: "Dja-et-Lobo", arrondissements: ["Sangmélima", "Bengbis", "Djoum", "Meyomessala", "Meyomessi", "Mintom", "Oveng", "Zoétélé"] },
      { name: "Mvila", arrondissements: ["Ebolowa I", "Ebolowa II", "Biwong-Bane", "Efoulan", "Mengong", "Mvangan", "Ngoulemakong"] },
      { name: "Océan", arrondissements: ["Kribi I", "Kribi II", "Akom II", "Campo", "Lolodorf", "Lokoundjé", "Mvengue", "Niete"] },
      { name: "Vallée-du-Ntem", arrondissements: ["Ambam", "Ma'an", "Olamze", "Kyé-Ossi"] }
    ]
  },
  {
    name: "Sud-Ouest",
    departments: [
      { name: "Fako", arrondissements: ["Limbé I", "Limbé II", "Limbé III", "Buéa", "Idenau", "Muyuka", "Tiko", "West-Coast"] },
      { name: "Koupé-Manengouba", arrondissements: ["Bangem", "Nguti", "Tombel"] },
      { name: "Lebialem", arrondissements: ["Menji", "Alou", "Fontem", "Wabane"] },
      { name: "Manyu", arrondissements: ["Mamfe", "Akwaya", "Eyumojock", "Tinto", "Upper-Bayang"] },
      { name: "Meme", arrondissements: ["Kumba I", "Kumba II", "Kumba III", "Konye", "Mbonge"] },
      { name: "Ndian", arrondissements: ["Mundemba", "Bamusso", "Dikome-Balue", "Ekondo-Titi", "Idabato", "Isanguele", "Kombo-Abedimo", "Kombo-Itindi", "Toko"] }
    ]
  }
];

export const getAllRegionNames = () => cameroonRegions.map(r => r.name);

export const getDepartmentsByRegion = (regionName: string) => {
  const region = cameroonRegions.find(r => r.name === regionName);
  return region ? region.departments : [];
};

export const getArrondissementsByDepartment = (regionName: string, departmentName: string) => {
  const region = cameroonRegions.find(r => r.name === regionName);
  if (!region) return [];
  const department = region.departments.find(d => d.name === departmentName);
  return department ? department.arrondissements : [];
};
