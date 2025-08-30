# VitaShifa - AI Health Companion 🏥

A comprehensive AI-powered health platform offering medical consultations, wellness planning, medication reminders, and emergency care assistance with multilingual support.

## ✨ Features

### 🤖 AI Medical Consultation
- Real-time chat with AI health assistant
- Natural language processing in 7+ languages
- Conversation history and continuity
- Medical disclaimer and safety guidelines

### 🔍 AI Diagnosis from Medical Images
- Medical image analysis (X-rays, MRI, dermatology)
- Confidence scoring and findings analysis
- Actionable recommendations
- Privacy-focused processing

### 💊 Medication Reminders
- Smart medication scheduling
- Adherence tracking and analytics
- Multiple time slots and frequencies
- Visual adherence charts

### 🎯 Wellness Planning
- Personalized health assessments
- AI-generated nutrition plans
- Custom fitness recommendations
- Mindfulness and stress management
- Weekly scheduling with PDF export

### 🚨 Emergency Care
- Country-specific emergency contacts
- Interactive first-aid guides
- Symptom severity checker
- Hospital location finder
- Video-guided emergency procedures

### 🌍 Multilingual Support
- 7 languages: English, Arabic, Spanish, French, Japanese, Indonesian, Hindi
- RTL support for Arabic
- Localized medical terminology
- Cultural adaptations

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React i18next** - Internationalization

### Backend & APIs
- **Google Gemini AI** - Medical reasoning and image analysis
- **Firebase Auth** - User authentication
- **Firestore** - Real-time database
- **Next.js API Routes** - Serverless backend

### Key Libraries
- **Lucide React** - Icon system
- **Date-fns** - Date manipulation
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Firebase project
- Google AI API key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/vitashifa.git
cd vitashifa
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Add your configuration:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Base64 encoded service account)
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_service_account

# Google AI
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Firebase:**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Generate service account key

5. **Run the development server:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai-diagnosis/  # Image analysis
│   │   ├── medical-consultation/ # Chat API
│   │   ├── medication-reminders/ # Medication CRUD
│   │   └── wellness-planning/ # Wellness plans
│   ├── signin/           # Authentication pages
│   └── signup/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── ai-diagnosis.tsx # Medical image analysis
│   ├── medical-consultation.tsx # Chat interface
│   ├── wellness-planning.tsx # Health assessments
│   └── dashboard-layout.tsx # Main layout
├── lib/                 # Utilities and configuration
│   ├── firebase.ts     # Firebase client
│   ├── firebaseAdmin.ts # Firebase admin
│   ├── i18n.ts         # Internationalization
│   └── utils.ts        # Helper functions
├── public/locales/     # Translation files
└── context/            # React context providers
```

## 🌟 Key Features Detail

### Smart Medical Consultation
- Context-aware conversations
- Medical reasoning with chain-of-thought
- Safety guardrails and disclaimers
- Multilingual medical terminology

### Image Analysis Pipeline
- HIPAA-compliant processing
- Multi-modal AI analysis
- Confidence scoring
- Structured medical reports

### Wellness Intelligence
- Personalized recommendations
- BMI and health metrics
- Activity level assessment
- Cultural dietary preferences

### Emergency Response System
- Geolocation-based contacts
- Interactive first-aid videos
- Severity triage algorithms
- Multi-language emergency phrases

## 🔒 Privacy & Security

- **Data Protection**: No medical images stored permanently
- **HIPAA Compliance**: Privacy-first architecture
- **Encryption**: All data encrypted in transit and at rest
- **Authentication**: Secure Firebase Auth integration
- **Disclaimers**: Clear medical advice limitations

## 🌍 Internationalization

Supported languages with full localization:
- 🇺🇸 English (en)
- 🇸🇦 Arabic (ar) - RTL support
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇯🇵 Japanese (ja)
- 🇮🇩 Indonesian (id)
- 🇮🇳 Hindi (hi)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Set build command to `pnpm build`
- **Railway**: Dockerfile included
- **Firebase Hosting**: Static export supported

## 📚 API Documentation

### Medical Consultation
```http
POST /api/medical-consultation
Content-Type: application/json

{
  "message": "string",
  "conversationId": "string (optional)",
  "language": "string"
}

Response:
{
  "reply": "string",
  "conversationId": "string"
}
```

### AI Diagnosis
```http
POST /api/ai-diagnosis
Content-Type: application/json

{
  "image": "string (base64)",
  "language": "string"
}

Response:
{
  "confidence": "number",
  "findings": ["string"],
  "recommendations": ["string"]
}
```

### Medication Reminders
```http
GET    /api/medication-reminders          # List all reminders
POST   /api/medication-reminders          # Create reminder
PUT    /api/medication-reminders/[id]     # Update reminder
DELETE /api/medication-reminders/[id]     # Delete reminder
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use existing UI components from `components/ui/`
- Maintain i18n support for new features
- Add proper error handling and loading states
- Write descriptive commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

VitaShifa is an AI-powered health information tool and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.

## 🙏 Acknowledgments

- Google AI for Gemini API
- Firebase for backend infrastructure
- Radix UI for accessible components
- The open-source community for amazing tools

## 📞 Support

For support, email support@vitashifa.com or join our [Discord community](https://discord.gg/vitashifa).

---

**Built with ❤️ for global health accessibility**

## 🔄 Roadmap

- [ ] Integration with wearable devices
- [ ] Telemedicine video consultations
- [ ] Advanced AI models for better medical reasoning
- [ ] Integration with electronic health records
- [ ] Mobile app development
- [ ] Voice-based interactions
- [ ] Community health features