import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Manual env loader to avoid dependency issues
function loadEnv() {
  const envPath = '.env.local';
  if (existsSync(envPath)) {
    const env = readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.replace(/\\n/g, '\n');
      }
    });
  }
}

loadEnv();

const projects = [
  {
    id: 'neurohire',
    title: 'NeuroHire',
    subtitle: 'AI-Powered ATS Resume Screener',
    domain: 'HR Tech',
    difficulty: 'Major',
    price: 3999,
    originalPrice: 11999,
    techStack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Gemini AI'],
    description: 'An AI-powered Applicant Tracking System that parses resumes (PDF/DOCX), performs semantic search against job descriptions using Gemini embeddings, and ranks candidates automatically. Includes a full admin recruiter dashboard.',
    features: [
      'PDF/DOCX CV Parsing with Gemini 1.5 Flash',
      'Semantic Search & Ranking via Vertex AI Embeddings',
      'Unified Recruiter Dashboard with Real-time Filtering',
      'Direct WhatsApp Integration for Shortlisted Candidates',
      'Automated Interview Scheduling & Feedback Loop'
    ],
    includes: [
      'Full Next.js 14 Frontend Source Code',
      'FastAPI Backend Service with Python base',
      'PostgreSQL Schema & Migration Files',
      'Detailed API Documentation with Postman Collection',
      '14-page Project Implementation Report (PDF)',
      '1x Setup call with our core engineers'
    ],
    featured: true
  },
  {
    id: 'findash',
    title: 'FinDash',
    subtitle: 'Real-time Crypto Portfolio Tracker',
    domain: 'FinTech',
    difficulty: 'Mini',
    price: 2499,
    originalPrice: 6999,
    techStack: ['React', 'Node.js', 'WebSockets', 'Tailwind CSS', 'Chart.js'],
    description: 'A real-time cryptocurrency portfolio tracker that uses WebSocket connections to CoinGecko for live price feeds. Features interactive candlestick charts, portfolio composition breakdowns, and Web Push price alerts.',
    features: [
      'Live WebSocket Price Feeds via CoinGecko SDK',
      'High-performance Candlestick Charts with Chart.js',
      'Multi-currency Support (INR, USD, EUR)',
      'Automatic Portfolio Balancing Recommendations',
      'Secure LocalStorage Persistence with Encryption'
    ],
    includes: [
      'Full React Source Code',
      'WebSocket Proxy Server Logic',
      'Implementation Report & Flowcharts',
      'Presentation Slides for Final Viva'
    ],
    featured: false
  },
  {
    id: 'medchain',
    title: 'MedChain',
    subtitle: 'Blockchain Health Records',
    domain: 'Web3 / Healthcare',
    difficulty: 'Major',
    price: 4999,
    originalPrice: 13999,
    techStack: ['Solidity', 'Ethers.js', 'React', 'IPFS', 'Hardhat'],
    description: 'A decentralized medical records management application deployed on Ethereum Sepolia testnet. Patient records are encrypted and stored on IPFS, with access control managed via smart contracts. Includes a React frontend for patients and doctors.',
    features: [
      'Gas-optimized Solidity Smart Contracts',
      'Encrypted IPFS Storage for Image/PDF reports',
      'Doctor-Patient Access Control via Wallets',
      'Historical Health Timeline for Patients',
      'Integration with Sepolia Testnet Bridge'
    ],
    includes: [
      'Hardhat Project with Deployment Scripts',
      'Frontend DApp Source Code',
      'Audit Report (Mock) & Documentation',
      'Smart Contract Explanation Video'
    ],
    featured: true
  },
  {
    id: 'docuchat',
    title: 'DocuChat',
    subtitle: 'RAG-based PDF Analyzer',
    domain: 'Generative AI',
    difficulty: 'Mini',
    price: 1999,
    originalPrice: 5999,
    techStack: ['Python', 'Streamlit', 'LangChain', 'OpenAI', 'Pinecone'],
    description: 'Upload any PDF document and instantly chat with it using Retrieval-Augmented Generation. Uses LangChain for document chunking, Pinecone for vector storage, and OpenAI for generation. Clean Streamlit UI.',
    features: [
      'Advanced Document Chunking with LangChain',
      'Pinecone Vector Database for Retrieval',
      'Conversational RAG with GPT-3.5 Turbo',
      'Multi-file PDF Upload & Analysis',
      'Citations for RAG Responses'
    ],
    includes: [
      'Python Source Code & Requirements.txt',
      'Environment Setup Guide',
      'Walkthrough Guide on Vector Databases'
    ],
    featured: false
  },
  {
    id: 'shopsync',
    title: 'ShopSync',
    subtitle: 'Microservices E-Commerce Backend',
    domain: 'Cloud Native',
    difficulty: 'Major',
    price: 5999,
    originalPrice: 15999,
    techStack: ['Node.js', 'Docker', 'RabbitMQ', 'Redis', 'MongoDB', 'Kubernetes'],
    description: 'A microservices-based e-commerce backend with independent services for Auth, Products, Orders, and Payments. Services communicate via RabbitMQ message queues. Includes Docker Compose for local dev and Kubernetes manifests for production.',
    features: [
      'Event-driven Architecture with RabbitMQ',
      'Redis Cache for Product Data & Sessions',
      'Containerization with multi-stage Dockerfiles',
      'K8s Manifests for Deployment & Services',
      'Prometheus/Grafana Dashboard Integration'
    ],
    includes: [
      'Full Microservices Project Repo',
      'Docker Compose & K8s Config Files',
      'System Design Diagram (Draw.io)',
      'Backend Scaling Case Study'
    ],
    featured: false
  },
  {
    id: 'campusconnect',
    title: 'CampusConnect',
    subtitle: 'College Social Network',
    domain: 'Social / EdTech',
    difficulty: 'Major',
    price: 3499,
    originalPrice: 10999,
    techStack: ['Next.js', 'Prisma', 'PostgreSQL', 'Socket.io', 'Tailwind'],
    description: 'A full-stack college social networking app with real-time chat, event feeds, study group creation, and resource sharing. Built with Next.js App Router and Prisma ORM. Includes Socket.io for instant messaging.',
    features: [
      'Real-time Messaging with Socket.io',
      'Rich Media Event Feed with Dynamic Likes',
      'Study Group Management & Collaborative Tools',
      'Role-based Access for Students & Admins',
      'Automated Campus Resource Booking System'
    ],
    includes: [
      'Next.js Frontend & Prisma Logic',
      'Database Schema Migration Scripts',
      'Production Deployment Script for Vercel',
      'Project Documentation Template'
    ],
    featured: true
  },
  {
    id: 'greenfleet',
    title: 'GreenFleet',
    subtitle: 'EV Fleet Management Dashboard',
    domain: 'IoT / CleanTech',
    difficulty: 'Mini',
    price: 2999,
    originalPrice: 7999,
    techStack: ['React', 'Express', 'MongoDB', 'Mapbox GL', 'MQTT'],
    description: 'An IoT-powered dashboard for managing a fleet of electric vehicles. Tracks battery levels, trip history, live GPS locations on a Mapbox map, and geofencing alerts. MQTT protocol for simulated vehicle data.',
    features: [
      'MQTT-based Real-time IoT Data Flow',
      'Live Vehicle Tracking with Mapbox GL JS',
      'Geofencing Alerts & Trip Analytics',
      'Battery Health Monitoring & Predictive Maintenance',
      'Historical Data Visualization with Recharts'
    ],
    includes: [
      'Dashboard & Backend Source Code',
      'IoT Simulator Python Script',
      'Setup & Presentation Documentation'
    ],
    featured: false
  },
  {
    id: 'sentinelai',
    title: 'SentinelAI',
    subtitle: 'AI Cybersecurity Threat Detector',
    domain: 'Cybersecurity / AI',
    difficulty: 'Major',
    price: 4499,
    originalPrice: 12999,
    techStack: ['Python', 'TensorFlow', 'Flask', 'React', 'Elasticsearch'],
    description: 'An ML-powered network intrusion detection system. Trains on the CICIDS dataset to classify network traffic as benign or malicious. Features a React dashboard with real-time alert feeds powered by Elasticsearch.',
    features: [
      'Pre-trained TensorFlow Intrusion Detection Model',
      'Log Ingestion & Indexing with Elasticsearch',
      'Real-time Threat Monitoring Dashboard',
      'Automated E-mail Notifications for High Severity',
      'Dataset Pre-processing & Feature Engineering'
    ],
    includes: [
      'Trained Model Files & Logic Scripts',
      'Elasticsearch Configuration Guide',
      'Deep Dive on Cybersecurity ML project report'
    ],
    featured: true
  }
];

async function seed() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing FIREBASE_* environment variables in .env.local');
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const db = getFirestore();

  console.log('Seeding projects...');
  const batch = db.batch();

  for (const project of projects) {
    const docRef = db.collection('projects').doc(project.id);
    batch.set(docRef, project);
  }

  await batch.commit();
  console.log('Successfully seeded all projects to Firestore!');
  process.exit(0);
}

seed().catch(console.error);
