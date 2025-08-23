import { Phone, Shield, Heart } from "lucide-react";

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const emergencyContactsByCountry: Record<string, EmergencyContact[]> = {
  US: [
    { name: "Emergency Services", number: "911", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "Poison Control", number: "1-800-222-1222", description: "24/7 Poison Emergency", icon: Shield },
    { name: "Crisis Hotline", number: "988", description: "Mental Health Crisis", icon: Heart },
  ],
  GB: [
    { name: "Emergency Services", number: "999", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "NHS Non-Emergency", number: "111", description: "Non-urgent medical advice", icon: Heart },
  ],
  IN: [
    { name: "General Emergency", number: "112", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "Police", number: "100", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "102", description: "Medical Emergency", icon: Heart },
  ],
  PK: [
    { name: "Police", number: "15", description: "Police Department", icon: Shield },
    { name: "Fire", number: "16", description: "Fire Department", icon: Phone },
    { name: "Ambulance", number: "115", description: "Medical Emergency", icon: Heart },
  ],
  EG: [
    { name: "Police", number: "122", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "123", description: "Medical Emergency", icon: Heart },
    { name: "Fire", number: "180", description: "Fire Department", icon: Phone },
  ],
  DZ: [
    { name: "General Emergency", number: "112", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "Police", number: "17", description: "Police Department", icon: Shield },
    { name: "Ambulance / Fire", number: "14", description: "Medical & Fire Emergency", icon: Heart },
  ],
  AU: [
    { name: "Emergency Services", number: "000", description: "Police, Fire, Ambulance", icon: Phone },
  ],
  SG: [
    { name: "Police", number: "999", description: "Police Department", icon: Shield },
    { name: "Ambulance / Fire", number: "995", description: "Medical & Fire Emergency", icon: Heart },
  ],
  IQ: [
    { name: "General Emergency", number: "112", description: "Police, Fire, Ambulance", icon: Phone },
  ],
  SA: [
    { name: "General Emergency", number: "911", description: "Police, Fire, Ambulance", icon: Phone },
  ],
  ID: [
    { name: "Police", number: "110", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "118", description: "Medical Emergency", icon: Heart },
    { name: "Fire", number: "113", description: "Fire Department", icon: Phone },
  ],
  BR: [
    { name: "Police", number: "190", description: "Military Police", icon: Shield },
    { name: "Ambulance", number: "192", description: "Medical Emergency", icon: Heart },
    { name: "Fire", number: "193", description: "Fire Department", icon: Phone },
  ],
  JP: [
    { name: "Police", number: "110", description: "Police Department", icon: Shield },
    { name: "Ambulance / Fire", number: "119", description: "Medical & Fire Emergency", icon: Heart },
  ],
  CN: [
    { name: "Police", number: "110", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "120", description: "Medical Emergency", icon: Heart },
    { name: "Fire", number: "119", description: "Fire Department", icon: Phone },
  ],
  MA: [
    { name: "Police", number: "19", description: "Police Department", icon: Shield },
    { name: "Ambulance / Fire", number: "15", description: "Medical & Fire Emergency", icon: Heart },
  ],
  SY: [
    { name: "Police", number: "112", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "110", description: "Medical Emergency", icon: Heart },
    { name: "Fire", number: "113", description: "Fire Department", icon: Phone },
  ],
  PS: [
    { name: "Police", number: "100", description: "Police Department", icon: Shield },
    { name: "Ambulance", number: "101", description: "Medical Emergency", icon: Heart },
    { name: "Civil Defense", number: "102", description: "Civil Defense", icon: Phone },
  ],
  ZA: [
    { name: "Police", number: "10111", description: "Police Department", icon: Shield },
    { name: "Ambulance / Fire", number: "10177", description: "Medical & Fire Emergency", icon: Heart },
  ],
  NZ: [
    { name: "Emergency Services", number: "111", description: "Police, Fire, Ambulance", icon: Phone },
  ],
  EU: [
    { name: "General Emergency", number: "112", description: "Police, Fire, Ambulance", icon: Phone },
  ],
  default: [
    { name: "General Emergency (Europe)", number: "112", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "General Emergency (US/Canada)", number: "911", description: "Police, Fire, Ambulance", icon: Phone },
    { name: "General Emergency (Australia)", number: "000", description: "Police, Fire, Ambulance", icon: Shield },
  ],
};