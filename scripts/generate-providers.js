const fs = require('fs');

const states = [
  { name: 'Andhra Pradesh', code: 'AP', cities: [
    { city: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
    { city: 'Vijayawada', lat: 16.5062, lon: 80.6480 },
    { city: 'Guntur', lat: 16.3067, lon: 80.4365 }
  ]},
  { name: 'Assam', code: 'AS', cities: [
    { city: 'Guwahati', lat: 26.1445, lon: 91.7362 },
    { city: 'Silchar', lat: 24.8333, lon: 92.7789 },
    { city: 'Dibrugarh', lat: 27.4728, lon: 94.9120 }
  ]},
  { name: 'Jharkhand', code: 'JH', cities: [
    { city: 'Ranchi', lat: 23.3441, lon: 85.3096 },
    { city: 'Jamshedpur', lat: 22.8046, lon: 86.2029 },
    { city: 'Dhanbad', lat: 23.7957, lon: 86.4304 }
  ]},
  { name: 'Karnataka', code: 'KA', cities: [
    { city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { city: 'Mysuru', lat: 12.2958, lon: 76.6394 },
    { city: 'Mangaluru', lat: 12.9141, lon: 74.8560 }
  ]},
  { name: 'Kerala', code: 'KL', cities: [
    { city: 'Kochi', lat: 9.9312, lon: 76.2673 },
    { city: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
    { city: 'Kozhikode', lat: 11.2588, lon: 75.7804 }
  ]},
  { name: 'Madhya Pradesh', code: 'MP', cities: [
    { city: 'Bhopal', lat: 23.2599, lon: 77.4126 },
    { city: 'Indore', lat: 22.7196, lon: 75.8577 },
    { city: 'Gwalior', lat: 26.2183, lon: 78.1828 }
  ]},
  { name: 'Maharashtra', code: 'MH', cities: [
    { city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { city: 'Pune', lat: 18.5204, lon: 73.8567 },
    { city: 'Nagpur', lat: 21.1458, lon: 79.0882 }
  ]},
  { name: 'Manipur', code: 'MN', cities: [
    { city: 'Imphal', lat: 24.8170, lon: 93.9368 },
    { city: 'Thoubal', lat: 24.6220, lon: 94.0054 }
  ]},
  { name: 'Meghalaya', code: 'ML', cities: [
    { city: 'Shillong', lat: 25.5788, lon: 91.8933 },
    { city: 'Tura', lat: 25.5142, lon: 90.2020 }
  ]},
  { name: 'Mizoram', code: 'MZ', cities: [
    { city: 'Aizawl', lat: 23.7271, lon: 92.7176 },
    { city: 'Lunglei', lat: 22.8848, lon: 92.7338 }
  ]},
  { name: 'Nagaland', code: 'NL', cities: [
    { city: 'Kohima', lat: 25.6751, lon: 94.1086 },
    { city: 'Dimapur', lat: 25.9063, lon: 93.7266 }
  ]},
  { name: 'Odisha', code: 'OD', cities: [
    { city: 'Bhubaneswar', lat: 20.2961, lon: 85.8245 },
    { city: 'Cuttack', lat: 20.4625, lon: 85.8828 },
    { city: 'Rourkela', lat: 22.2604, lon: 84.8536 }
  ]},
  { name: 'Punjab', code: 'PB', cities: [
    { city: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
    { city: 'Ludhiana', lat: 30.9010, lon: 75.8573 },
    { city: 'Amritsar', lat: 31.6340, lon: 74.8723 }
  ]},
  { name: 'Tamil Nadu', code: 'TN', cities: [
    { city: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { city: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
    { city: 'Madurai', lat: 9.9252, lon: 78.1198 }
  ]},
  { name: 'Telangana', code: 'TS', cities: [
    { city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { city: 'Warangal', lat: 17.9784, lon: 79.5941 }
  ]},
  { name: 'Chandigarh', code: 'CH', cities: [
    { city: 'Chandigarh', lat: 30.7333, lon: 76.7794 }
  ]},
  { name: 'Delhi', code: 'DL', cities: [
    { city: 'New Delhi', lat: 28.6139, lon: 77.2090 }
  ]},
  { name: 'Rajasthan', code: 'RJ', cities: [
    { city: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { city: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
    { city: 'Udaipur', lat: 24.5854, lon: 73.7125 }
  ]}
];

const hospitalPrefixes = ['Apex', 'Sunrise', 'Global', 'Medstar', 'Hopewell', 'PrimeCare', 'NovaLife', 'Summit', 'Riverbend', 'Silverline', 'Trinity', 'Lifeline'];
const clinicPrefixes = ['CarePoint', 'Neighborhood', 'Community', 'Pulse', 'Harmony', 'Curewell', 'Family', 'Regen', 'Wellness', 'Holistic', 'Trusted', 'City'];
const hospitalTypes = ['Multispecialty', 'Cardiac Centre', 'Neuro & Spine', 'Cancer Care', 'Mother & Child', 'Orthopedic', 'Trauma Centre'];
const specialties = ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Pulmonology', 'Oncology', 'Nephrology', 'Endocrinology', 'Pediatrics', 'Gynaecology'];
const doctorFirst = ['Nisha', 'Arjun', 'Ravi', 'Meera', 'Karthik', 'Anita', 'Rahul', 'Priya', 'Vikram', 'Divya', 'Suresh', 'Lakshmi', 'Farhan', 'Ananya', 'Kiran'];
const doctorLast = ['Reddy', 'Iyer', 'Sharma', 'Nair', 'Patel', 'Khan', 'Singh', 'Das', 'Mukherjee', 'Menon', 'Kulkarni', 'Chatterjee', 'Varma', 'Gill', 'Chetri'];
const pharmacyPrefixes = ['MediServe', 'Apollo Meds', 'WellCare Pharmacy', 'LifeMeds', 'CureCart', 'TrustMed', 'HealthKart', 'MedBay', 'PharmaPlus', 'HealthHub'];
const labPrefixes = ['DiagnoPlus', 'Precision Labs', 'Pathway', 'Insight Diagnostics', 'ClearPath Labs', 'MedGenome', 'VitalCheck', 'SureTest', 'HealthTrack', 'AccuLabs'];
const ambulanceProviders = ['Rapid Response', 'City Ambulance', 'Guardian EMS', 'Lifeline Ambulance', 'Swift Aid', 'RescueMed'];

function randomFrom(arr, idx) {
  return arr[idx % arr.length];
}

function phone(seed) {
  const base = (9000000000 + seed * 12345).toString().slice(0, 10);
  return `+91-${base}`;
}

function createProviderData() {
  return states.map((state) => {
    const hospitals = [];
    const clinics = [];
    const doctors = [];
    const pharmacies = [];
    const labs = [];
    const ambulances = [];

    const cityList = state.cities;

    for (let i = 0; i < 10; i++) {
      const city = cityList[i % cityList.length];
      const name = `${randomFrom(hospitalPrefixes, i)} ${city.city} Medical Center`;
      hospitals.push({
        id: `HOSP-${state.code}-${String(i + 1).padStart(3, '0')}`,
        name,
        type: randomFrom(hospitalTypes, i + 2),
        latitude: Number((city.lat + (i % 3) * 0.01).toFixed(4)),
        longitude: Number((city.lon + (i % 3) * 0.01).toFixed(4)),
        rating: Number((4.2 + (i % 5) * 0.1).toFixed(1)),
        beds: 150 + i * 15,
        isCashless: i % 2 === 0,
        specialties: [randomFrom(specialties, i), randomFrom(specialties, i + 3), randomFrom(specialties, i + 6)],
        contact: phone(i + state.code.length),
        address: `${city.city} ${state.name}`,
        distance_km: null
      });
    }

    for (let i = 0; i < 10; i++) {
      const city = cityList[(i + 1) % cityList.length];
      clinics.push({
        id: `CLIN-${state.code}-${String(i + 1).padStart(3, '0')}`,
        name: `${randomFrom(clinicPrefixes, i)} Clinic ${city.city}`,
        latitude: Number((city.lat + (i % 2) * 0.008).toFixed(4)),
        longitude: Number((city.lon + (i % 2) * 0.008).toFixed(4)),
        rating: Number((4.1 + (i % 4) * 0.1).toFixed(1)),
        services: [randomFrom(specialties, i + 1), randomFrom(specialties, i + 4)],
        contact: phone(i + 50),
        address: `${city.city} ${state.name}`,
        isCashless: i % 3 === 0,
        distance_km: null
      });
    }

    for (let i = 0; i < 10; i++) {
      const city = cityList[(i + 2) % cityList.length];
      const hospital = hospitals[i % hospitals.length].name;
      const specialty = randomFrom(specialties, i + 2);
      doctors.push({
        id: `DOC-${state.code}-${String(i + 1).padStart(3, '0')}`,
        name: `Dr. ${randomFrom(doctorFirst, i)} ${randomFrom(doctorLast, i)}`,
        specialty,
        experience: 6 + (i % 10),
        rating: Number((4.2 + (i % 4) * 0.1).toFixed(1)),
        hospital,
        latitude: Number((city.lat + (i % 2) * 0.006).toFixed(4)),
        longitude: Number((city.lon + (i % 2) * 0.006).toFixed(4)),
        fees: 400 + i * 30,
        isOnline: i % 2 === 0,
        distance_km: null
      });
    }

    for (let i = 0; i < 10; i++) {
      const city = cityList[(i + 1) % cityList.length];
      pharmacies.push({
        id: `PHAR-${state.code}-${String(i + 1).padStart(3, '0')}`,
        name: `${randomFrom(pharmacyPrefixes, i)} ${city.city}`,
        latitude: Number((city.lat + (i % 3) * 0.005).toFixed(4)),
        longitude: Number((city.lon + (i % 3) * 0.005).toFixed(4)),
        rating: Number((4.0 + (i % 5) * 0.1).toFixed(1)),
        is24x7: i % 3 === 0,
        hasDelivery: true,
        contact: phone(i + 100),
        address: `${city.city} ${state.name}`,
        distance_km: null
      });
    }

    for (let i = 0; i < 10; i++) {
      const city = cityList[i % cityList.length];
      labs.push({
        id: `LAB-${state.code}-${String(i + 1).padStart(3, '0')}`,
        name: `${randomFrom(labPrefixes, i)} ${city.city}`,
        latitude: Number((city.lat + (i % 2) * 0.007).toFixed(4)),
        longitude: Number((city.lon + (i % 2) * 0.007).toFixed(4)),
        rating: Number((4.1 + (i % 4) * 0.1).toFixed(1)),
        services: ['CBC', 'Lipid', 'Thyroid', 'HbA1c', 'Kidney/Liver Panel'],
        homeCollection: i % 2 === 0,
        contact: phone(i + 200),
        address: `${city.city} ${state.name}`,
        distance_km: null
      });
    }

    for (let i = 0; i < 5; i++) {
      const city = cityList[i % cityList.length];
      ambulances.push({
        id: `AMB-${state.code}-${String(i + 1).padStart(3, '0')}`,
        type: i % 3 === 0 ? 'ICU' : i % 2 === 0 ? 'ALS' : 'BLS',
        provider: `${randomFrom(ambulanceProviders, i)} ${city.city}`,
        latitude: Number((city.lat + (i % 2) * 0.004).toFixed(4)),
        longitude: Number((city.lon + (i % 2) * 0.004).toFixed(4)),
        contact: phone(i + 300),
        availability: i % 2 === 0 ? 'Available' : 'On Trip',
        distance_km: null
      });
    }

    return {
      state: state.name,
      hospitals,
      clinics,
      doctors,
      pharmacies,
      labs,
      ambulances
    };
  });
}

const data = createProviderData();
fs.writeFileSync('providers.json', JSON.stringify(data, null, 2));
console.log('providers.json generated with', data.length, 'states');
