import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error(`ERROR: .env.local not found at ${envPath}`);
    process.exit(1);
  }
  
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
  } catch (err) {
    console.error('Firebase Initialization Failed:', err.message);
    process.exit(1);
  }
}

const db = admin.firestore();

const projectsToInport = [
  { title: "Apartment Management System", tech: "VB.NET", domain: "Management", difficulty: "Mini" },
  { title: "Blood Bank Management System", tech: "VB.NET", domain: "Healthcare", difficulty: "Mini" },
  { title: "Bug Tracking System", tech: "Java", domain: "Software Development", difficulty: "Major" },
  { title: "Cargo Management System", tech: "ASP.NET", domain: "Logistics", difficulty: "Major" },
  { title: "Customer Relationship Management", tech: "ASP.NET", domain: "Business", difficulty: "Major" },
  { title: "Cyber Cafe Management System", tech: "VB.NET", domain: "Management", difficulty: "Mini" },
  { title: "Digital Steganography", tech: "Java", domain: "Cybersecurity", difficulty: "Major" },
  { title: "Discussion Forum", tech: "ASP.NET", domain: "Social Networks", difficulty: "Major" },
  { title: "Gas Agency Management", tech: "VB.NET", domain: "Management", difficulty: "Mini" },
  { title: "Hostel Management System", tech: "VB.NET", domain: "Education", difficulty: "Mini" },
  { title: "Human Resource Management", tech: "VB.NET", domain: "Business", difficulty: "Major" },
  { title: "Infrastructure Management System", tech: "ASP.NET", domain: "Civil/Management", difficulty: "Major" },
  { title: "Inventory Management System", tech: "VB.NET", domain: "Management", difficulty: "Mini" },
  { title: "Jewellery Management System", tech: "VB.NET", domain: "Management", difficulty: "Mini" },
  { title: "Mail Server Project", tech: "Java", domain: "Networking", difficulty: "Major" },
  { title: "Network Packet Sniffer", tech: "Java", domain: "Networking", difficulty: "Major" },
  { title: "Online Book Store", tech: "Java", domain: "E-Commerce", difficulty: "Major" },
  { title: "Online Building Management", tech: "ASP.NET", domain: "Management", difficulty: "Major" },
  { title: "Online Collaboration System", tech: "ASP.NET", domain: "Productivity", difficulty: "Major" },
  { title: "Online Document Management", tech: "Java", domain: "Management", difficulty: "Major" },
  { title: "Online Grading System", tech: "PHP", domain: "Education", difficulty: "Mini" },
  { title: "Online IT Service Help Desk", tech: "ASP.NET", domain: "IT Support", difficulty: "Major" },
  { title: "Online Survey System", tech: "Java", domain: "Web App", difficulty: "Mini" },
  { title: "Online Text Editor", tech: "ASP.NET", domain: "Productivity", difficulty: "Mini" },
  { title: "Post Office Management System", tech: "VB.NET", domain: "Government/Services", difficulty: "Mini" },
  { title: "Project Management System", tech: "PHP", domain: "Business", difficulty: "Major" }
];

async function seed() {
  console.log(`Starting import of ${projectsToInport.length} projects...`);
  const batch = db.batch();
  
  projectsToInport.forEach(p => {
    const docRef = db.collection('projects').doc();
    const price = p.difficulty === "Major" ? 3499 : 1999;
    
    batch.set(docRef, {
      id: docRef.id,
      title: p.title,
      subtitle: `${p.tech} based ${p.title} Project`,
      description: `A comprehensive ${p.title} developed using ${p.tech}. Ideal for final year B.Tech/CSE students looking for a robust ${p.domain} solution. Features clear source code, database diagrams, and full documentation.`,
      domain: p.domain,
      difficulty: p.difficulty,
      price: price,
      originalPrice: price * 3,
      techStack: [p.tech, "SQL Server", "Crystal Reports"],
      tags: [p.tech, p.domain, "Student Project", "B.Tech"],
      features: [
        "User Authentication & Role Management",
        "Dashboard with Real-time Analytics",
        "Automated Report Generation",
        "Secure Data Handling & Backup",
        "Responsive & User-friendly UI"
      ],
      includes: [
        "Full Source Code (.zip)",
        "Database Schema (.sql)",
        "Project Report (40+ Pages)",
        "Installation Video Guide",
        "Free AI Mentor Access"
      ],
      thumbnailUrl: `/projects/thumbnails/${p.tech.toLowerCase()}.png`,
      status: "active",
      visibility: "public",
      featured: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log('✅ Ported all projects successfully!');
  process.exit(0);
}

seed();
