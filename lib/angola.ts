// Divisão administrativa de Angola.
//
// Desde 1 de janeiro de 2025 (decreto presidencial), Angola passou de 18
// para 21 províncias: Icolo e Bengo (dividida de Luanda), Cuando (dividida
// de Cuando Cubango) e Moxico Leste (dividida de Moxico), com 326 municípios
// no total (antes eram 164).
//
// Essa reforma é recente e não há, à data desta escrita, uma lista pública
// fiável dos 326 novos municípios por província. Por isso os municípios
// abaixo são os da divisão anterior (estável há décadas, bem documentada),
// atribuídos à província nova mais próxima. Onde a fronteira exata de uma
// província nova não é clara (Icolo e Bengo, Cuando, Moxico Leste), fica só
// o essencial e confiável — a pessoa que preenche o checkout escolhe
// "Outro" e escreve o nome exato do seu município/bairro. O mesmo vale para
// bairros: só estão preenchidos onde há confiança razoável (Luanda,
// a província mais movimentada); todas as outras localidades usam "Outro".
//
// Reveja e complete esta lista quando houver uma fonte oficial completa.

export const OTHER_OPTION = "Outro";

type MunicipalityData = {
  bairros?: string[];
};

type ProvinceData = Record<string, MunicipalityData>;

const LUANDA_BAIRROS: Record<string, string[]> = {
  Luanda: [
    "Ingombota",
    "Maianga",
    "Rangel",
    "Sambizanga",
    "Samba",
    "Kinaxixi",
    "Mutamba",
    "Alvalade",
    "Miramar",
    "Maculusso",
    "Ilha de Luanda",
    "Coqueiros",
    "Prenda",
    "Bairro Popular",
    "Ingombotas",
  ],
  Talatona: ["Talatona", "Benfica", "Camama", "Patriota", "Nova Vida", "Sequele"],
  Viana: ["Viana", "Zango", "Vila de Viana", "Estalagem", "Km 30", "Km 44"],
  Cacuaco: ["Cacuaco", "Sequele", "Kikolo", "Mulenvos", "Funda"],
  Cazenga: ["Cazenga", "Hoji-ya-Henda", "Tala Hady", "Rocha Pinto"],
  "Kilamba Kiaxi": ["Kilamba Kiaxi", "Golfe", "Sapú", "Palanca", "Neves Bendinha"],
  Belas: ["Belas", "Kilamba", "Ramiros", "Benfica", "Morro Bento"],
};

// Municípios da antiga província de Luanda que ficaram na nova província
// de Icolo e Bengo (área sul, mais rural). Sem lista de bairros confiável.
const ICOLO_E_BENGO_MUNICIPALITIES = ["Icolo e Bengo", "Quiçama"];

export const ANGOLA_LOCATIONS: Record<string, ProvinceData> = {
  Luanda: Object.fromEntries(
    ["Luanda", "Belas", "Cacuaco", "Cazenga", "Kilamba Kiaxi", "Talatona", "Viana"].map((m) => [
      m,
      { bairros: LUANDA_BAIRROS[m] },
    ]),
  ),
  "Icolo e Bengo": Object.fromEntries(ICOLO_E_BENGO_MUNICIPALITIES.map((m) => [m, {}])),
  Bengo: Object.fromEntries(
    ["Ambriz", "Bula Atumba", "Dande (Caxito)", "Dembos", "Nambuangongo", "Pango Aluquém"].map((m) => [m, {}]),
  ),
  Benguela: Object.fromEntries(
    [
      "Baía Farta",
      "Balombo",
      "Benguela",
      "Bocoio",
      "Caimbambo",
      "Catumbela",
      "Chongorói",
      "Cubal",
      "Ganda",
      "Lobito",
    ].map((m) => [m, {}]),
  ),
  Bié: Object.fromEntries(
    [
      "Andulo",
      "Camacupa",
      "Catabola",
      "Chinguar",
      "Chitembo",
      "Cuemba",
      "Cunhinga",
      "Kuito",
      "N'harea",
    ].map((m) => [m, {}]),
  ),
  Cabinda: Object.fromEntries(["Belize", "Buco-Zau", "Cabinda", "Cacongo"].map((m) => [m, {}])),
  "Cuando Cubango": Object.fromEntries(
    [
      "Calai",
      "Cuangar",
      "Cuchi",
      "Cuito Cuanavale",
      "Dirico",
      "Mavinga",
      "Menongue",
      "Nancova",
      "Rivungo",
    ].map((m) => [m, {}]),
  ),
  // Nova província (2025): fronteira exata ainda não confirmada com fonte oficial.
  Cuando: { Cuando: {} },
  "Cuanza Norte": Object.fromEntries(
    [
      "Ambaca",
      "Banga",
      "Bolongongo",
      "Cambambe",
      "Cazengo (N'dalatando)",
      "Golungo Alto",
      "Gonguembo",
      "Lucala",
      "Quiculungo",
      "Samba Cajú",
    ].map((m) => [m, {}]),
  ),
  "Cuanza Sul": Object.fromEntries(
    [
      "Amboim (Gabela)",
      "Cassongue",
      "Cela (Waku Kungo)",
      "Conda",
      "Ebo",
      "Libolo (Calulo)",
      "Mussende",
      "Quibala",
      "Quilenda",
      "Seles",
      "Sumbe",
    ].map((m) => [m, {}]),
  ),
  Cunene: Object.fromEntries(
    ["Cahama", "Cuanhama (Ondjiva)", "Curoca", "Cuvelai", "Namacunde", "Ombadja (Xangongo)"].map((m) => [
      m,
      {},
    ]),
  ),
  Huambo: Object.fromEntries(
    [
      "Bailundo",
      "Caála",
      "Ekunha",
      "Huambo",
      "Londuimbali",
      "Longonjo",
      "Mungo",
      "Tchicala-Tcholoanga",
      "Tchindjenje",
      "Ucuma",
    ].map((m) => [m, {}]),
  ),
  Huíla: Object.fromEntries(
    [
      "Caconda",
      "Cacula",
      "Caluquembe",
      "Chibia",
      "Chicomba",
      "Chipindo",
      "Cuvango",
      "Gambos",
      "Humpata",
      "Jamba",
      "Lubango",
      "Matala",
      "Quilengues",
      "Quipungo",
    ].map((m) => [m, {}]),
  ),
  "Lunda Norte": Object.fromEntries(
    [
      "Cambulo",
      "Capenda-Camulemba",
      "Caungula",
      "Chitato",
      "Cuango",
      "Cuílo",
      "Lóvua",
      "Lubalo",
      "Lucapa",
      "Xá-Muteba",
    ].map((m) => [m, {}]),
  ),
  "Lunda Sul": Object.fromEntries(["Cacolo", "Dala", "Muconda", "Saurimo"].map((m) => [m, {}])),
  Malanje: Object.fromEntries(
    [
      "Cacuso",
      "Calandula",
      "Cambundi-Catembo",
      "Cangandala",
      "Caombo",
      "Cunda-Dia-Baze",
      "Kiwaba Nzogi",
      "Luquembo",
      "Malanje",
      "Marimba",
      "Massango",
      "Mucari",
      "Quela",
      "Quirima",
    ].map((m) => [m, {}]),
  ),
  Moxico: Object.fromEntries(["Camanongue", "Cameia", "Léua", "Luchazes", "Luena"].map((m) => [m, {}])),
  // Nova província (2025): fronteira exata ainda não confirmada com fonte oficial.
  "Moxico Leste": Object.fromEntries(["Alto Zambeze", "Luau", "Lumbala N'guimbo"].map((m) => [m, {}])),
  Namibe: Object.fromEntries(["Bibala", "Camucuio", "Moçâmedes", "Tômbua", "Virei"].map((m) => [m, {}])),
  Uíge: Object.fromEntries(
    [
      "Ambuíla",
      "Bembe",
      "Buengas",
      "Bungo",
      "Cangola",
      "Damba",
      "Maquela do Zombo",
      "Mucaba",
      "Negage",
      "Puri",
      "Quimbele",
      "Quitexe",
      "Santa Cruz do Cuanza",
      "Sanza Pombo",
      "Songo",
      "Uíge",
    ].map((m) => [m, {}]),
  ),
  Zaire: Object.fromEntries(
    ["Cuimba", "M'banza Kongo", "Noqui", "N'zeto", "Soyo", "Tomboco"].map((m) => [m, {}]),
  ),
};

// Ordem de exibição nos selects (agrupada por região, capital primeiro).
export const ANGOLA_PROVINCES = Object.keys(ANGOLA_LOCATIONS) as readonly string[];

export function isAngolaProvince(value: string): boolean {
  return ANGOLA_PROVINCES.includes(value);
}

export function municipalitiesFor(province: string): string[] {
  return Object.keys(ANGOLA_LOCATIONS[province] ?? {});
}

export function bairrosFor(province: string, municipality: string): string[] {
  return ANGOLA_LOCATIONS[province]?.[municipality]?.bairros ?? [];
}

// Normaliza números angolanos para 9 dígitos (ex: "+244 923 456 789" -> "923456789"),
// para que a pesquisa de pedidos funcione independentemente da forma como foi escrito.
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("244")) return digits.slice(3);
  if (digits.length === 14 && digits.startsWith("00244")) return digits.slice(5);
  return digits;
}
