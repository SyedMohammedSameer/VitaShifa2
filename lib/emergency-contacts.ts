// lib/emergency-contacts.ts
import { Phone, Shield, Heart } from "lucide-react";

export interface EmergencyContact {
  nameKey: string;
  number: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const emergencyContactsByCountry: Record<string, EmergencyContact[]> = {
  US: [
    { nameKey: "emergency.contacts.emergencyServices", number: "911", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.poisonControl", number: "1-800-222-1222", descriptionKey: "emergency.contacts.poisonControl", icon: Shield },
    { nameKey: "emergency.contacts.crisisHotline", number: "988", descriptionKey: "emergency.contacts.crisisHotline", icon: Heart },
  ],
  GB: [
    { nameKey: "emergency.contacts.emergencyServices", number: "999", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.nonUrgentMedical", number: "111", descriptionKey: "emergency.contacts.nonUrgentMedical", icon: Heart },
  ],
  IN: [
    { nameKey: "emergency.contacts.generalEmergency", number: "112", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.police", number: "100", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "102", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
  ],
  PK: [
    { nameKey: "emergency.contacts.police", number: "15", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.fire", number: "16", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
    { nameKey: "emergency.contacts.ambulance", number: "115", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
  ],
  EG: [
    { nameKey: "emergency.contacts.police", number: "122", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "123", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.fire", number: "180", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
  ],
  DZ: [
    { nameKey: "emergency.contacts.generalEmergency", number: "112", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.police", number: "17", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "14", descriptionKey: "emergency.contacts.medicalFireEmergency", icon: Heart },
  ],
  AU: [
    { nameKey: "emergency.contacts.emergencyServices", number: "000", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
  ],
  SG: [
    { nameKey: "emergency.contacts.police", number: "999", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "995", descriptionKey: "emergency.contacts.medicalFireEmergency", icon: Heart },
  ],
  IQ: [
    { nameKey: "emergency.contacts.generalEmergency", number: "112", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
  ],
  SA: [
    { nameKey: "emergency.contacts.generalEmergency", number: "911", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
  ],
  ID: [
    { nameKey: "emergency.contacts.police", number: "110", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "118", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.fire", number: "113", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
  ],
  BR: [
    { nameKey: "emergency.contacts.police", number: "190", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "192", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.fire", number: "193", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
  ],
  JP: [
    { nameKey: "emergency.contacts.police", number: "110", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "119", descriptionKey: "emergency.contacts.medicalFireEmergency", icon: Heart },
  ],
  CN: [
    { nameKey: "emergency.contacts.police", number: "110", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "120", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.fire", number: "119", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
  ],
  MA: [
    { nameKey: "emergency.contacts.police", number: "19", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "15", descriptionKey: "emergency.contacts.medicalFireEmergency", icon: Heart },
  ],
  SY: [
    { nameKey: "emergency.contacts.police", number: "112", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "110", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.fire", number: "113", descriptionKey: "emergency.contacts.fireDepartment", icon: Phone },
  ],
  PS: [
    { nameKey: "emergency.contacts.police", number: "100", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "101", descriptionKey: "emergency.contacts.medicalEmergency", icon: Heart },
    { nameKey: "emergency.contacts.civilDefense", number: "102", descriptionKey: "emergency.contacts.civilDefense", icon: Phone },
  ],
  ZA: [
    { nameKey: "emergency.contacts.police", number: "10111", descriptionKey: "emergency.contacts.policeDepartment", icon: Shield },
    { nameKey: "emergency.contacts.ambulance", number: "10177", descriptionKey: "emergency.contacts.medicalFireEmergency", icon: Heart },
  ],
  NZ: [
    { nameKey: "emergency.contacts.emergencyServices", number: "111", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
  ],
  EU: [
    { nameKey: "emergency.contacts.generalEmergency", number: "112", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
  ],
  default: [
    { nameKey: "emergency.contacts.generalEmergency", number: "112", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.generalEmergency", number: "911", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Phone },
    { nameKey: "emergency.contacts.generalEmergency", number: "000", descriptionKey: "emergency.contacts.policeFireAmbulance", icon: Shield },
  ],
};