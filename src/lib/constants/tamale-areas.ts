export interface TamaleAreaInfo {
  name: string;
  slug: string;
  zoneSlug: "tamale-central" | "tamale-outer";
  zoneName: string;
  coordinates: [number, number]; // [longitude, latitude]
  commonLandmarks: string[];
}

export const TAMALE_AREAS: TamaleAreaInfo[] = [
  {
    name: "Lamashegu",
    slug: "lamashegu",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8520, 9.3900],
    commonLandmarks: ["Lamashegu Market", "Old Stadium", "Total Filling Station"],
  },
  {
    name: "Tamale Central Market",
    slug: "central-market",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8400, 9.4070],
    commonLandmarks: ["Central Mosque", "Taxi Rank", "Old Market Clock Tower"],
  },
  {
    name: "Jisonayili",
    slug: "jisonayili",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8480, 9.4280],
    commonLandmarks: ["Jisonayili Primary", "Jisonayili Junction", "Shell Station"],
  },
  {
    name: "Vittin",
    slug: "vittin",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8190, 9.3870],
    commonLandmarks: ["Vittin Barrier", "Vittin Target School", "Dungu Junction"],
  },
  {
    name: "Sakasaka",
    slug: "sakasaka",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8420, 9.4180],
    commonLandmarks: ["Sakasaka Primary School", "Police Barracks", "Melcom"],
  },
  {
    name: "Choggu",
    slug: "choggu",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8510, 9.4350],
    commonLandmarks: ["Choggu Roundabout", "Choggu Yapalsi", "Al-Hassan Mosque"],
  },
  {
    name: "Nyohini",
    slug: "nyohini",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8350, 9.3960],
    commonLandmarks: ["Nyohini Children's Home", "Presby Church", "Water Works"],
  },
  {
    name: "Aboabo",
    slug: "aboabo",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8320, 9.4040],
    commonLandmarks: ["Aboabo Market", "Timber Market", "Post Office"],
  },
  {
    name: "Kalpohin",
    slug: "kalpohin",
    zoneSlug: "tamale-central",
    zoneName: "Tamale Central (Zone 1)",
    coordinates: [-0.8260, 9.4240],
    commonLandmarks: ["Kalpohin Estates", "Senior High School", "Water Reservoir"],
  },
  {
    name: "Sagnarigu",
    slug: "sagnarigu",
    zoneSlug: "tamale-outer",
    zoneName: "Tamale Outer & Sagnarigu (Zone 2)",
    coordinates: [-0.8710, 9.4420],
    commonLandmarks: ["Sagnarigu Chief Palace", "Municipal Assembly", "Katariga Junction"],
  },
  {
    name: "Kanvili",
    slug: "kanvili",
    zoneSlug: "tamale-outer",
    zoneName: "Tamale Outer & Sagnarigu (Zone 2)",
    coordinates: [-0.8590, 9.4580],
    commonLandmarks: ["Kanvili Tuunaayili", "Presby College of Education", "Kamina Barracks"],
  },
  {
    name: "Datoyili",
    slug: "datoyili",
    zoneSlug: "tamale-outer",
    zoneName: "Tamale Outer & Sagnarigu (Zone 2)",
    coordinates: [-0.8750, 9.3550],
    commonLandmarks: ["Datoyili Barrier", "Kpasenkpe Link", "Kumasi Highway Exit"],
  },
];

export function getTamaleAreaByName(name: string): TamaleAreaInfo | undefined {
  return TAMALE_AREAS.find(
    (a) => a.name.toLowerCase() === name.toLowerCase() || a.slug === name.toLowerCase()
  );
}
