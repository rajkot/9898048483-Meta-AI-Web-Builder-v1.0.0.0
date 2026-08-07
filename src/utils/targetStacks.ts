import { TargetStackOption } from '../types';

export const TARGET_STACK_PRESETS: TargetStackOption[] = [
  {
    id: 'react-tailwind',
    name: 'React 18 + Tailwind CSS',
    description: 'Modern single-page web app with Vite, TypeScript, and Lucide Icons',
    badge: 'Recommended',
    iconName: 'Atom',
    defaultTech: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Lucide React'],
    sampleFiles: ['src/App.tsx', 'src/components/Header.tsx', 'package.json', 'README.md'],
  },
  {
    id: 'static-web',
    name: 'Pure Static Web',
    description: 'Lightweight HTML5, CSS3, and Vanilla JavaScript with zero build steps',
    badge: 'Zero Build',
    iconName: 'Code',
    defaultTech: ['HTML5', 'CSS3', 'ES6 JavaScript', 'Google Fonts'],
    sampleFiles: ['index.html', 'styles.css', 'app.js', 'README.md'],
  },
  {
    id: 'node-express',
    name: 'Node.js / Express Backend',
    description: 'RESTful API service with TypeScript, Express routes, and structured controllers',
    badge: 'Backend API',
    iconName: 'Server',
    defaultTech: ['Node.js', 'Express', 'TypeScript', 'CORS', 'dotenv'],
    sampleFiles: ['server.ts', 'src/routes/api.ts', 'src/controllers/appController.ts', 'package.json'],
  },
  {
    id: 'flutter-mobile',
    name: 'Flutter / Mobile App',
    description: 'Cross-platform mobile application written in Dart with Material Design 3',
    badge: 'Mobile Native',
    iconName: 'Smartphone',
    defaultTech: ['Flutter 3', 'Dart', 'Material 3', 'Provider'],
    sampleFiles: ['lib/main.dart', 'lib/screens/home_screen.dart', 'pubspec.yaml', 'README.md'],
  },
];

export const DEFAULT_TARGET_STACK = TARGET_STACK_PRESETS[0];
