import type { State } from "@/types/state";
import type { District } from "@/types/district";
import type { Locality } from "@/types/locality";

function mkDistrict(
  id: string,
  slug: string,
  name: string,
  state: string,
  centroidLat = 20.5937,
  centroidLng = 78.9629,
): District {
  return {
    id,
    slug,
    name,
    state,
    isActive: true,
    centroidLat,
    centroidLng,
  };
}

function mkLocality(
  id: string,
  slug: string,
  name: string,
  citySlug: string,
  aliases: string[] = [],
): Locality {
  return {
    id,
    slug,
    name,
    cityId: citySlug,
    citySlug,
    aliases,
    activeListingCount: 10,
    medianRentPaise: null,
  };
}

export const ALL_INDIAN_STATES: State[] = [
  { id: "st-ap", code: "AP", name: "Andhra Pradesh" },
  { id: "st-ar", code: "AR", name: "Arunachal Pradesh" },
  { id: "st-as", code: "AS", name: "Assam" },
  { id: "st-br", code: "BR", name: "Bihar" },
  { id: "st-ch", code: "CH", name: "Chandigarh" },
  { id: "st-cg", code: "CG", name: "Chhattisgarh" },
  { id: "st-dl", code: "DL", name: "Delhi" },
  { id: "st-ga", code: "GA", name: "Goa" },
  { id: "st-gj", code: "GJ", name: "Gujarat" },
  { id: "st-hr", code: "HR", name: "Haryana" },
  { id: "st-hp", code: "HP", name: "Himachal Pradesh" },
  { id: "st-jk", code: "JK", name: "Jammu and Kashmir" },
  { id: "st-jh", code: "JH", name: "Jharkhand" },
  { id: "st-ka", code: "KA", name: "Karnataka" },
  { id: "st-kl", code: "KL", name: "Kerala" },
  { id: "st-mp", code: "MP", name: "Madhya Pradesh" },
  { id: "st-mh", code: "MH", name: "Maharashtra" },
  { id: "st-mn", code: "MN", name: "Manipur" },
  { id: "st-ml", code: "ML", name: "Meghalaya" },
  { id: "st-mz", code: "MZ", name: "Mizoram" },
  { id: "st-nl", code: "NL", name: "Nagaland" },
  { id: "st-or", code: "OR", name: "Odisha" },
  { id: "st-py", code: "PY", name: "Puducherry" },
  { id: "st-pb", code: "PB", name: "Punjab" },
  { id: "st-rj", code: "RJ", name: "Rajasthan" },
  { id: "st-sk", code: "SK", name: "Sikkim" },
  { id: "st-tn", code: "TN", name: "Tamil Nadu" },
  { id: "st-ts", code: "TS", name: "Telangana" },
  { id: "st-tr", code: "TR", name: "Tripura" },
  { id: "st-up", code: "UP", name: "Uttar Pradesh" },
  { id: "st-uk", code: "UK", name: "Uttarakhand" },
  { id: "st-wb", code: "WB", name: "West Bengal" },
];

export const DISTRICTS_BY_STATE: Record<string, District[]> = {
  UP: [
    mkDistrict("dist-gbn", "gautam-buddha-nagar", "Gautam Buddha Nagar (Noida)", "Uttar Pradesh", 28.5355, 77.391),
    mkDistrict("dist-gzb", "ghaziabad", "Ghaziabad", "Uttar Pradesh", 28.6692, 77.4538),
    mkDistrict("dist-lko", "lucknow", "Lucknow", "Uttar Pradesh", 26.8467, 80.9462),
    mkDistrict("dist-knp", "kanpur", "Kanpur", "Uttar Pradesh", 26.4499, 80.3319),
    mkDistrict("dist-vns", "varanasi", "Varanasi", "Uttar Pradesh", 25.3176, 82.9739),
    mkDistrict("dist-agr", "agra", "Agra", "Uttar Pradesh", 27.1767, 78.0081),
    mkDistrict("dist-pry", "prayagraj", "Prayagraj (Allahabad)", "Uttar Pradesh", 25.4358, 81.8463),
    mkDistrict("dist-mrt", "meerut", "Meerut", "Uttar Pradesh", 28.9845, 77.7064),
    mkDistrict("dist-bly", "bareilly", "Bareilly", "Uttar Pradesh", 28.367, 79.4304),
    mkDistrict("dist-alg", "aligarh", "Aligarh", "Uttar Pradesh", 27.8974, 78.088),
  ],
  DL: [
    mkDistrict("dist-cdl", "central-delhi", "Central Delhi", "Delhi", 28.6448, 77.2167),
    mkDistrict("dist-ndl", "new-delhi", "New Delhi", "Delhi", 28.6139, 77.209),
    mkDistrict("dist-sdl", "south-delhi", "South Delhi", "Delhi", 28.4817, 77.1873),
    mkDistrict("dist-swdl", "south-west-delhi", "South West Delhi", "Delhi", 28.5921, 77.046),
    mkDistrict("dist-edl", "east-delhi", "East Delhi", "Delhi", 28.6279, 77.2784),
    mkDistrict("dist-wdl", "west-delhi", "West Delhi", "Delhi", 28.6664, 77.0674),
    mkDistrict("dist-nwdl", "north-west-delhi", "North West Delhi", "Delhi", 28.7297, 77.1009),
    mkDistrict("dist-nedl", "north-east-delhi", "North East Delhi", "Delhi", 28.6946, 77.271),
  ],
  HR: [
    mkDistrict("dist-gur", "gurugram", "Gurugram (Gurgaon)", "Haryana", 28.4595, 77.0266),
    mkDistrict("dist-fbd", "faridabad", "Faridabad", "Haryana", 28.4089, 77.3178),
    mkDistrict("dist-pnl", "panipat", "Panipat", "Haryana", 29.3909, 76.9635),
    mkDistrict("dist-snt", "sonipat", "Sonipat", "Haryana", 28.9931, 77.0151),
    mkDistrict("dist-pkn", "panchkula", "Panchkula", "Haryana", 30.6942, 76.8606),
    mkDistrict("dist-amb", "ambala", "Ambala", "Haryana", 30.3782, 76.7767),
    mkDistrict("dist-knl", "karnal", "Karnal", "Haryana", 29.6857, 76.9905),
  ],
  KA: [
    mkDistrict("dist-blr-u", "bengaluru-urban", "Bengaluru Urban", "Karnataka", 12.9716, 77.5946),
    mkDistrict("dist-blr-r", "bengaluru-rural", "Bengaluru Rural", "Karnataka", 13.2847, 77.5544),
    mkDistrict("dist-mys", "mysuru", "Mysuru", "Karnataka", 12.2958, 76.6394),
    mkDistrict("dist-mng", "mangaluru", "Dakshina Kannada (Mangaluru)", "Karnataka", 12.9141, 74.856),
    mkDistrict("dist-hbl", "hubballi-dharwad", "Dharwad (Hubballi)", "Karnataka", 15.3647, 75.124),
  ],
  MH: [
    mkDistrict("dist-mum", "mumbai-city", "Mumbai City", "Maharashtra", 18.9388, 72.8354),
    mkDistrict("dist-msb", "mumbai-suburban", "Mumbai Suburban", "Maharashtra", 19.076, 72.8777),
    mkDistrict("dist-pun", "pune", "Pune", "Maharashtra", 18.5204, 73.8567),
    mkDistrict("dist-thn", "thane", "Thane", "Maharashtra", 19.2183, 72.9781),
    mkDistrict("dist-ngp", "nagpur", "Nagpur", "Maharashtra", 21.1458, 79.0882),
    mkDistrict("dist-nsk", "nashik", "Nashik", "Maharashtra", 19.9975, 73.7898),
  ],
  TS: [
    mkDistrict("dist-hyd", "hyderabad", "Hyderabad", "Telangana", 17.385, 78.4867),
    mkDistrict("dist-med", "medchal-malkajgiri", "Medchal-Malkajgiri", "Telangana", 17.6297, 78.4813),
    mkDistrict("dist-rrd", "rangareddy", "Ranga Reddy", "Telangana", 17.1883, 78.3377),
    mkDistrict("dist-wgl", "warangal", "Warangal", "Telangana", 17.9689, 79.5941),
  ],
  TN: [
    mkDistrict("dist-chn", "chennai", "Chennai", "Tamil Nadu", 13.0827, 80.2707),
    mkDistrict("dist-cbe", "coimbatore", "Coimbatore", "Tamil Nadu", 11.0168, 76.9558),
    mkDistrict("dist-mdu", "madurai", "Madurai", "Tamil Nadu", 9.9252, 78.1198),
    mkDistrict("dist-kan", "kanchipuram", "Kanchipuram", "Tamil Nadu", 12.8342, 79.7036),
  ],
  WB: [
    mkDistrict("dist-kol", "kolkata", "Kolkata", "West Bengal", 22.5726, 88.3639),
    mkDistrict("dist-n24", "north-24-parganas", "North 24 Parganas", "West Bengal", 22.7196, 88.4683),
    mkDistrict("dist-s24", "south-24-parganas", "South 24 Parganas", "West Bengal", 22.1352, 88.4014),
    mkDistrict("dist-how", "howrah", "Howrah", "West Bengal", 22.5958, 88.2636),
  ],
  GJ: [
    mkDistrict("dist-ahd", "ahmedabad", "Ahmedabad", "Gujarat", 23.0225, 72.5714),
    mkDistrict("dist-srt", "surat", "Surat", "Gujarat", 21.1702, 72.8311),
    mkDistrict("dist-vad", "vadodara", "Vadodara", "Gujarat", 22.3072, 73.1812),
  ],
  RJ: [
    mkDistrict("dist-jpr", "jaipur", "Jaipur", "Rajasthan", 26.9124, 75.7873),
    mkDistrict("dist-jdh", "jodhpur", "Jodhpur", "Rajasthan", 26.2389, 73.0243),
    mkDistrict("dist-uda", "udaipur", "Udaipur", "Rajasthan", 24.5854, 73.7125),
  ],
  KL: [
    mkDistrict("dist-ekm", "ernakulam", "Ernakulam (Kochi)", "Kerala", 9.9816, 76.2999),
    mkDistrict("dist-tvm", "thiruvananthapuram", "Thiruvananthapuram", "Kerala", 8.5241, 76.9366),
  ],
  MP: [
    mkDistrict("dist-idr", "indore", "Indore", "Madhya Pradesh", 22.7196, 75.8577),
    mkDistrict("dist-bpl", "bhopal", "Bhopal", "Madhya Pradesh", 23.2599, 77.4126),
  ],
  PB: [
    mkDistrict("dist-ldh", "ludhiana", "Ludhiana", "Punjab", 30.901, 75.8573),
    mkDistrict("dist-sas", "sas-nagar", "SAS Nagar (Mohali)", "Punjab", 30.7046, 76.7179),
  ],
  BR: [
    mkDistrict("dist-pat", "patna", "Patna", "Bihar", 25.5941, 85.1376),
  ],
  UK: [
    mkDistrict("dist-ddn", "dehradun", "Dehradun", "Uttarakhand", 30.3165, 78.0322),
  ],
  GA: [
    mkDistrict("dist-nga", "north-goa", "North Goa (Panaji)", "Goa", 15.4909, 73.8278),
  ],
  CH: [
    mkDistrict("dist-chd", "chandigarh-city", "Chandigarh", "Chandigarh", 30.7333, 76.7794),
  ],
};

export const CITIES_BY_DISTRICT: Record<string, Locality[]> = {
  "gautam-buddha-nagar": [
    mkLocality("loc-noida-sec62", "noida-sector-62", "Noida Sector 62", "gautam-buddha-nagar", ["Sector 62", "Sec 62 Noida"]),
    mkLocality("loc-noida-sec18", "noida-sector-18", "Noida Sector 18", "gautam-buddha-nagar", ["Sector 18", "Atta Market"]),
    mkLocality("loc-noida-sec15", "noida-sector-15", "Noida Sector 15", "gautam-buddha-nagar", ["Sector 15"]),
    mkLocality("loc-noida-sec50", "noida-sector-50", "Noida Sector 50", "gautam-buddha-nagar", ["Sector 50"]),
    mkLocality("loc-noida-sec76", "noida-sector-76", "Noida Sector 76", "gautam-buddha-nagar", ["Sector 76"]),
    mkLocality("loc-noida-sec137", "noida-sector-137", "Noida Sector 137", "gautam-buddha-nagar", ["Sector 137", "Expressway"]),
    mkLocality("loc-noida-ext", "greater-noida-west", "Greater Noida West (Noida Extension)", "gautam-buddha-nagar", ["Noida Extension", "Gaur City"]),
    mkLocality("loc-gr-noida-pari", "greater-noida-pari-chowk", "Greater Noida (Pari Chowk)", "gautam-buddha-nagar", ["Pari Chowk", "Alpha 1", "Beta 1"]),
  ],
  ghaziabad: [
    mkLocality("loc-indrapuram", "indirapuram", "Indirapuram", "ghaziabad", ["Indirapuram Ghaziabad"]),
    mkLocality("loc-vaishali", "vaishali", "Vaishali", "ghaziabad", ["Vaishali Sector 4"]),
    mkLocality("loc-vasundhara", "vasundhara", "Vasundhara", "ghaziabad", ["Vasundhara Sector 1"]),
    mkLocality("loc-crossings", "crossings-republik", "Crossings Republik", "ghaziabad", ["Crossings"]),
  ],
  gurugram: [
    mkLocality("loc-dlf-ph1", "dlf-phase-1", "DLF Phase 1", "gurugram", ["DLF 1"]),
    mkLocality("loc-dlf-ph2", "dlf-phase-2", "DLF Phase 2", "gurugram", ["DLF 2", "Cyber City"]),
    mkLocality("loc-dlf-ph3", "dlf-phase-3", "DLF Phase 3", "gurugram", ["DLF 3", "Udyog Vihar"]),
    mkLocality("loc-sec56", "sector-56", "Sector 56 (Golf Course Ext)", "gurugram", ["Golf Course Road"]),
    mkLocality("loc-sohna-rd", "sohna-road", "Sohna Road", "gurugram", ["Subhash Chowk"]),
    mkLocality("loc-sec48", "sector-48", "Sector 48", "gurugram", ["Vipul World"]),
  ],
  "south-delhi": [
    mkLocality("loc-saket", "saket", "Saket", "south-delhi", ["Saket Metro"]),
    mkLocality("loc-hauz-khas", "hauz-khas", "Hauz Khas", "south-delhi", ["HKV", "Green Park"]),
    mkLocality("loc-lajpat-nagar", "lajpat-nagar", "Lajpat Nagar", "south-delhi", ["Lajpat Nagar 2", "Lajpat Nagar 4"]),
    mkLocality("loc-malviya-nagar", "malviya-nagar", "Malviya Nagar", "south-delhi", ["Malviya"]),
    mkLocality("loc-greater-kailash", "greater-kailash", "Greater Kailash (GK)", "south-delhi", ["GK 1", "GK 2"]),
  ],
  "new-delhi": [
    mkLocality("loc-connaught-place", "connaught-place", "Connaught Place", "new-delhi", ["CP"]),
    mkLocality("loc-karol-bagh", "karol-bagh", "Karol Bagh", "new-delhi", ["Rajendra Nagar"]),
    mkLocality("loc-patel-nagar", "patel-nagar", "Patel Nagar", "new-delhi", ["East Patel Nagar"]),
  ],
  "bengaluru-urban": [
    mkLocality("loc-koramangala", "koramangala", "Koramangala", "bengaluru-urban", ["Koramangla", "5th Block"]),
    mkLocality("loc-hsr", "hsr-layout", "HSR Layout", "bengaluru-urban", ["HSR Sector 1", "HSR Sector 2"]),
    mkLocality("loc-indiranagar", "indiranagar", "Indiranagar", "bengaluru-urban", ["100 Feet Road", "Defence Colony"]),
    mkLocality("loc-whitefield", "whitefield", "Whitefield", "bengaluru-urban", ["ITPL Road", "EPIP Zone"]),
    mkLocality("loc-btm", "btm-layout", "BTM Layout", "bengaluru-urban", ["BTM 1st Stage", "BTM 2nd Stage"]),
    mkLocality("loc-bellandur", "bellandur", "Bellandur", "bengaluru-urban", ["Outer Ring Road", "Ecospace"]),
    mkLocality("loc-electronic-city", "electronic-city", "Electronic City", "bengaluru-urban", ["E-City Phase 1", "Phase 2"]),
    mkLocality("loc-marathahalli", "marathahalli", "Marathahalli", "bengaluru-urban", ["Bridge", "Outer Ring Road"]),
  ],
  "mumbai-suburban": [
    mkLocality("loc-andheri-west", "andheri-west", "Andheri West", "mumbai-suburban", ["Lokhandwala", "Versova"]),
    mkLocality("loc-andheri-east", "andheri-east", "Andheri East", "mumbai-suburban", ["MIDC", "JB Nagar", "Marol"]),
    mkLocality("loc-bandra-west", "bandra-west", "Bandra West", "mumbai-suburban", ["Pali Hill", "Carter Road"]),
    mkLocality("loc-powai", "powai", "Powai", "mumbai-suburban", ["Hiranandani", "IIT"]),
    mkLocality("loc-malad-west", "malad-west", "Malad West", "mumbai-suburban", ["Mindspace", "Link Road"]),
  ],
  pune: [
    mkLocality("loc-hinjewadi", "hinjewadi", "Hinjewadi", "pune", ["Phase 1", "Phase 2", "Phase 3"]),
    mkLocality("loc-wakad", "wakad", "Wakad", "pune", ["Dange Chowk", "Kaspate Vasti"]),
    mkLocality("loc-baner", "baner", "Baner", "pune", ["Baner Road", "Pashan"]),
    mkLocality("loc-viman-nagar", "viman-nagar", "Viman Nagar", "pune", ["Phoenix Mall"]),
    mkLocality("loc-kharadi", "kharadi", "Kharadi", "pune", ["EON IT Park", "World Trade Center"]),
  ],
  hyderabad: [
    mkLocality("loc-gachibowli", "gachibowli", "Gachibowli", "hyderabad", ["Financial District"]),
    mkLocality("loc-hitech-city", "hitech-city", "Hitec City", "hyderabad", ["Madhapur", "Cyber Towers"]),
    mkLocality("loc-kondapur", "kondapur", "Kondapur", "hyderabad", ["Botanical Garden"]),
    mkLocality("loc-kukatpally", "kukatpally", "Kukatpally (KPHB)", "hyderabad", ["KPHB Colony"]),
    mkLocality("loc-madhapur", "madhapur", "Madhapur", "hyderabad", ["Ayyappa Society"]),
  ],
};
