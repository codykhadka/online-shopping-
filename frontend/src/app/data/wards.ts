export interface Ward {
  number: number;
  name: string;
  municipality: "Kathmandu" | "Tokha";
  areas: string[];
}

export const DELIVERY_DATA: Ward[] = [
  // --- KATHMANDU METROPOLITAN CITY (1-32) ---
  { number: 1, municipality: "Kathmandu", name: "Naxal", areas: ["Naxal Tole", "Narayanchaur", "Nagpokhari", "Bhagwati Bahal", "Hattisar", "Gairidhara (part)", "Naxal Bhagwati", "Police HQ area"] },
  { number: 2, municipality: "Kathmandu", name: "Lazimpat", areas: ["Lazimpat Tole", "Panipokhari", "Radha Krishna Marga", "Lazimpat Road", "Hotel Shangri-La area", "Baluwatar edge", "Narayanchaur (part)"] },
  { number: 3, municipality: "Kathmandu", name: "Maharajgunj", areas: ["Maharajgunj", "Chakrapath north", "Samakhusi (part)", "Basundhara (part)", "Teaching Hospital area", "Kanti Hospital area", "Italian Embassy area"] },
  { number: 4, municipality: "Kathmandu", name: "Baluwatar", areas: ["Baluwatar", "PM Residence area", "Bishalnagar", "Handigaun (part)", "Baluwatar Height"] },
  { number: 5, municipality: "Kathmandu", name: "Handigaun", areas: ["Handigaun", "Tangal", "Bishalnagar (part)", "Mandikhatar (part)", "Ganeshthan area"] },
  { number: 6, municipality: "Kathmandu", name: "Boudha / Tusal", areas: ["Boudha", "Tusal", "Ramhiti", "Phulbari", "Hyatt area", "Sano Tusal", "Boudha Chowk"] },
  { number: 7, municipality: "Kathmandu", name: "Chabahil", areas: ["Chabahil", "Mitrapark", "Gaurighat", "Boudha edge", "Chucchepati", "Om Hospital area"] },
  { number: 8, municipality: "Kathmandu", name: "Gaurighat", areas: ["Gaurighat", "Pingalasthan", "Mitrapark (part)", "Pashupati area edge", "Gaushala (part)"] },
  { number: 9, municipality: "Kathmandu", name: "Sinamangal", areas: ["Sinamangal", "Airport Gate", "Gothatar (part)", "Pepsicola (part)", "Gaushala edge"] },
  { number: 10, municipality: "Kathmandu", name: "Baneshwor", areas: ["New Baneshwor", "Old Baneshwor", "Bijulibazar", "Shantinagar (part)", "Sankhamul", "Minbhawan"] },
  { number: 11, municipality: "Kathmandu", name: "Babarmahal", areas: ["Babarmahal", "Maitighar", "Anamnagar (part)", "Singha Durbar", "Thapathali"] },
  { number: 12, municipality: "Kathmandu", name: "Teku", areas: ["Teku", "Tripureshwor", "Kalimati (part)", "Bagmati corridor", "Teku Dobhan"] },
  { number: 13, municipality: "Kathmandu", name: "Kalimati", areas: ["Kalimati", "Soltimode", "Tahachal", "Kalimati Bazaar", "Bafal (part)"] },
  { number: 14, municipality: "Kathmandu", name: "Kuleshwor", areas: ["Kuleshwor", "Ravi Bhawan", "Balkhu", "Kalanki (part)", "Balkhu corridor"] },
  { number: 15, municipality: "Kathmandu", name: "Swayambhu", areas: ["Swayambhu", "Chhauni", "Kimdol", "Sitapaila (part)", "Bijeshwori"] },
  { number: 16, municipality: "Kathmandu", name: "Balaju", areas: ["Balaju", "Machhapokhari", "Banasthali", "Dhungedhara", "Bypass area"] },
  { number: 17, municipality: "Kathmandu", name: "Chhetrapati", areas: ["Chhetrapati", "Thahiti", "Paknajol", "Jyatha (part)", "Saat Ghumti (edge)"] },
  { number: 18, municipality: "Kathmandu", name: "Naradevi", areas: ["Naradevi", "Itum Bahal", "Dhalko", "Chhusya Bahal", "Nardevi Square"] },
  { number: 19, municipality: "Kathmandu", name: "Basantapur", areas: ["Basantapur", "Hanuman Dhoka", "Nasal Chowk", "Mul Chowk", "Jhochhen"] },
  { number: 20, municipality: "Kathmandu", name: "Indra Chowk", areas: ["Indra Chowk", "Makhan Tole", "Wotu", "Maru edge", "Lagan (part)"] },
  { number: 21, municipality: "Kathmandu", name: "Lagantol", areas: ["Lagantol", "Bangemudha", "Nhyokha", "Te Bahal", "Wotu (part)"] },
  { number: 22, municipality: "Kathmandu", name: "New Road", areas: ["New Road", "Khichapokhari", "Bishal Bazaar", "Juddha Salik", "Peoples Plaza"] },
  { number: 23, municipality: "Kathmandu", name: "Om Bahal", areas: ["Om Bahal", "Jamal", "Ghantaghar", "Rani Pokhari", "Tundikhel edge"] },
  { number: 24, municipality: "Kathmandu", name: "Maru", areas: ["Maru Tole", "Kasthamandap", "Sikamo Bahal", "Nag Bahal", "Lohan Chowk"] },
  { number: 25, municipality: "Kathmandu", name: "Asan", areas: ["Asan Tole", "Kel Tole", "Nyokha", "Bangemudha (part)", "Wotu", "Tebahal"] },
  { number: 26, municipality: "Kathmandu", name: "Thamel", areas: ["Thamel", "Chaksibari", "Saat Ghumti", "Bhagwan Bahal", "Amrit Marg", "Paknajol (part)"] },
  { number: 27, municipality: "Kathmandu", name: "Jyatha", areas: ["Jyatha", "Kantipath", "Thamel east", "Narayanhiti area", "Durbar Marg edge"] },
  { number: 28, municipality: "Kathmandu", name: "Kamaladi", areas: ["Kamaladi", "Nagpokhari (part)", "Gyaneshwor (part)", "Kamal Pokhari", "Police HQ area"] },
  { number: 29, municipality: "Kathmandu", name: "Dillibazar", areas: ["Dillibazar", "Putalisadak", "Bagbazar", "Pingalasthan (part)", "Seto Pul"] },
  { number: 30, municipality: "Kathmandu", name: "Gyaneshwor", areas: ["Gyaneshwor", "Battisputali", "Sinamangal (part)", "Old Baneshwor edge", "Tangal (part)"] },
  { number: 31, municipality: "Kathmandu", name: "Shantinagar", areas: ["Shantinagar", "Anamnagar (part)", "Baneshwor (part)", "Bijulibazar edge", "Bhimsengola"] },
  { number: 32, municipality: "Kathmandu", name: "Koteshwor", areas: ["Koteshwor", "Jadibuti", "Balkumari", "Tinkune", "Subidhanagar"] },

  // --- TOKHA MUNICIPALITY (1-11) ---
  { number: 1, municipality: "Tokha", name: "Tokha Old Core", areas: ["Tokha", "Chandeswori", "Baniyatar (part)", "Sundarijal road area"] },
  { number: 2, municipality: "Tokha", name: "Tokha Central", areas: ["Tokha Bazaar", "Suryadarshan", "Chandeswori (part)"] },
  { number: 3, municipality: "Tokha", name: "Residential Expansion", areas: ["Greenland", "Grande area", "Dhapasi (part)"] },
  { number: 4, municipality: "Tokha", name: "Dhapasi", areas: ["Dhapasi", "Basundhara (part)", "Grande Hospital area"] },
  { number: 5, municipality: "Tokha", name: "Basundhara", areas: ["Basundhara", "Chakrapath (north ring area)", "Samakhusi (part)"] },
  { number: 6, municipality: "Tokha", name: "Jhor", areas: ["Jhor", "Gurje Bhanjyang", "Tokha hills area"] },
  { number: 7, municipality: "Tokha", name: "Jhor / rural hills", areas: ["Jhor (upper)", "Kakani road area", "Forest/hill settlements"] },
  { number: 8, municipality: "Tokha", name: "Dhapasi Urban", areas: ["Dhapasi", "Golfutar (part)", "Hattigauda (part)"] },
  { number: 9, municipality: "Tokha", name: "Gongabu Border", areas: ["Gongabu (part)", "Samakhusi (part)", "Bus Park influence area"] },
  { number: 10, municipality: "Tokha", name: "Manamaiju", areas: ["Manamaiju", "Futung", "Tinpiple area"] },
  { number: 11, municipality: "Tokha", name: "Manamaiju / Futung", areas: ["Futung", "Ichangu (border area)", "Balaju (border side)"] },
];

export interface SearchableArea {
  name: string;
  ward: number;
  municipality: string;
  keywords: string; // for easier search filtering
}

export const SEARCHABLE_AREAS: SearchableArea[] = DELIVERY_DATA.flatMap(w => 
  w.areas.map(a => ({
    name: a,
    ward: w.number,
    municipality: w.municipality,
    keywords: `${a} ${w.municipality} Ward ${w.number}`.toLowerCase()
  }))
);
