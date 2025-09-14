# 🌾 Krishi Sakhi - AI-Powered Farming Assistant

Krishi Sakhi is a comprehensive mobile application designed to assist farmers with AI-powered crop disease detection, farming guidance, community support, and real-time agricultural information.

## 🚀 Features

- **🤖 AI Chatbot**: Multi-language (English & Malayalam) intelligent assistant
- **🌱 Crop Doctor**: AI-powered disease detection with treatment recommendations
- **📅 Crop Calendar**: Activity tracking with priority alerts and roadmap
- **📚 Knowledge Base**: Comprehensive farming guides and search functionality
- **👥 Community Forum**: Farmer-to-farmer interaction and knowledge sharing
- **🌤️ Weather Alerts**: Real-time weather information and government schemes
- **🛡️ Error Handling**: Comprehensive error recovery and offline support
- **✅ Input Validation**: Security features and data validation

## 🛠️ Tech Stack

- **Frontend**: React Native, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI/ML**: TensorFlow.js, OpenAI API
- **Authentication**: JWT, OTP-based
- **Deployment**: Vercel, Netlify

## 📱 Mobile App Setup

### Prerequisites
- Node.js (>=18.0.0)
- npm (>=8.0.0)
- React Native CLI
- Android Studio / Xcode

### Installation
```bash
# Clone the repository
git clone https://github.com/emailready2test-collab/ks.git
cd ks

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🌐 Backend API Setup

### Local Development
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the server directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/krishi-sakhi
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
FIREBASE_CONFIG=your-firebase-config
```

## 🚀 Deployment

### Vercel Deployment
The backend API is already deployed on Vercel:
- **Production URL**: https://krishisakhi-f21embyeq-emailready2test-collabs-projects.vercel.app
- **Inspect URL**: https://vercel.com/emailready2test-collabs-projects/krishi_sakhi

### Netlify Deployment
For Netlify deployment, use the optimized configuration:

1. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository
   - Use the following build settings:
     - **Base directory**: `server`
     - **Build command**: `npm install --legacy-peer-deps`
     - **Publish directory**: `.`

2. **Environment Variables** (in Netlify dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Build Settings**:
   - Node version: 18
   - NPM version: 9
   - Use `--legacy-peer-deps` flag for dependency resolution

### Fixing Dependency Conflicts

If you encounter `ERESOLVE unable to resolve dependency tree` errors:

1. **Use legacy peer deps**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Force installation**:
   ```bash
   npm install --force
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

## 📁 Project Structure

```
krishi-sakhi/
├── src/                    # React Native source code
│   ├── components/         # Reusable components
│   ├── screens/           # App screens
│   ├── services/          # API services
│   └── config/            # Configuration files
├── server/                # Backend API
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── package.json           # Root package.json
├── netlify.toml          # Netlify configuration
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## 🔧 API Endpoints

- **Authentication**: `/api/auth/*`
- **Crop Doctor**: `/api/crop-doctor/*`
- **Community**: `/api/community/*`
- **Knowledge Base**: `/api/knowledge/*`
- **Crop Calendar**: `/api/calendar/*`
- **Weather Alerts**: `/api/alerts/*`
- **Chatbot**: `/api/chatbot/*`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Developer**: MALLEPAKA GANESH
- **Repository**: https://github.com/emailready2test-collab/ks.git

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**Krishi Sakhi** - Empowering farmers with AI technology 🌾📱✨