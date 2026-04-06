export interface Project {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  difficulty: 'Mini' | 'Major';
  price: number;
  originalPrice: number;
  techStack: string[];
  tags?: string[];
  description: string;
  features: string[];
  includes: string[];
  thumbnail: string;
  createdAt: string;
  featured: boolean;
  fileTree?: any[];
  sourceUrl?: string;
}

export const PROJECTS_DB: Project[] = [
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
      'Resume Parsing (PDF/DOCX) with OCR fallback',
      'Semantic Search via Gemini Embeddings',
      'Admin Dashboard for Recruiters with analytics',
      'Email Notification System (Nodemailer)',
      'Role-based Auth (Student / Recruiter)',
      'RESTful API with Swagger docs',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Step-by-step PDF implementation guide (42 pages)',
      'Database schema + ER diagrams',
      'Postman collection for API testing',
      'Docker Compose deployment config',
      '1-click Vercel deployment guide',
      'College submission report template (.docx)',
      'Unlimited AI Mentor access for this project',
    ],
    thumbnail: '/projects/neurohire.png',
    createdAt: '2026-03-01',
    featured: true,
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
      'Real-time Candlestick & Line Charts (Chart.js)',
      'Portfolio composition pie charts',
      'Live WebSocket price streaming',
      'OAuth2 Google Login',
      'Price alert system via Web Push Notifications',
      'Responsive mobile-first dark UI',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Implementation guide (28 pages)',
      'API integration documentation',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/findash.png',
    createdAt: '2026-02-15',
    featured: true,
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
      'Solidity Smart Contracts (ERC-based access control)',
      'IPFS file storage for encrypted records',
      'Hardhat deployment & testing scripts',
      'Role-based UI (Patient / Doctor / Admin)',
      'MetaMask wallet integration',
      'Full unit test suite with Chai',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Smart contract audit report',
      'Implementation guide (50 pages)',
      'Testnet deployment guide (Sepolia)',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/medchain.png',
    createdAt: '2026-03-10',
    featured: true,
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
      'PDF upload & automatic text extraction',
      'Document chunking with LangChain splitters',
      'Vector storage in Pinecone',
      'Conversational RAG chain with memory',
      'Source citation in answers',
      'Streamlit UI with chat interface',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Implementation guide (20 pages)',
      'API key setup documentation',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/docuchat.png',
    createdAt: '2026-01-20',
    featured: true,
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
      'Microservices architecture (4 independent services)',
      'RabbitMQ event-driven communication',
      'Redis caching layer for product catalog',
      'JWT-based auth service',
      'PhonePe payment integration',
      'Kubernetes deployment manifests',
      'API Gateway with rate limiting',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Architecture design document (35 pages)',
      'Docker Compose & K8s configs',
      'Postman collection for all services',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/shopsync.png',
    createdAt: '2026-03-15',
    featured: false,
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
      'Real-time messaging with Socket.io',
      'Post feed with likes, comments, shares',
      'Study group creation & management',
      'Event calendar with RSVP',
      'File/resource sharing marketplace',
      'Admin moderation panel',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Implementation guide (38 pages)',
      'Prisma migration files',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/campusconnect.png',
    createdAt: '2026-02-28',
    featured: false,
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
      'Live GPS tracking on Mapbox map',
      'Battery & charging status monitoring',
      'Trip history with route replays',
      'Geofencing alerts',
      'MQTT data simulation script',
      'Responsive dashboard UI',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'Implementation guide (24 pages)',
      'MQTT simulator setup guide',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/greenfleet.png',
    createdAt: '2026-03-05',
    featured: false,
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
      'TensorFlow model trained on CICIDS2017',
      'Real-time traffic classification API (Flask)',
      'Elasticsearch-powered alert indexing',
      'React dashboard with live threat feed',
      'Automated model retraining pipeline',
      'Detailed classification reports',
    ],
    includes: [
      'Production-ready source code (.zip)',
      'ML model training notebooks (.ipynb)',
      'Implementation guide (45 pages)',
      'Dataset download & prep scripts',
      'College submission report template (.docx)',
      'AI Mentor access for this project',
    ],
    thumbnail: '/projects/sentinelai.png',
    createdAt: '2026-03-18',
    featured: false,
  },
];

/* helper to look up by ID */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS_DB.find(p => p.id === id);
}

/* helper to filter */
export function filterProjects(opts?: {
  domain?: string;
  difficulty?: string;
  featured?: boolean;
  search?: string;
}): Project[] {
  let results = [...PROJECTS_DB];
  if (opts?.domain) results = results.filter(p => p.domain.toLowerCase().includes(opts.domain!.toLowerCase()));
  if (opts?.difficulty) results = results.filter(p => p.difficulty.toLowerCase() === opts.difficulty!.toLowerCase());
  if (opts?.featured) results = results.filter(p => p.featured);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    results = results.filter(p => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.techStack.some(t => t.toLowerCase().includes(q)));
  }
  return results;
}
