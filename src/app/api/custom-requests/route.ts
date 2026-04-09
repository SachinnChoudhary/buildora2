import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const all = searchParams.get('all'); // For admin panel to fetch all requests

  try {
    let query = supabase.from('custom_requests').select('*');

    if (all === 'true') {
      // Admin: fetch all requests
      query = query.order('created_at', { ascending: false });
    } else if (userId) {
      // User: fetch only their own requests
      query = query.eq('user_id', userId).order('created_at', { ascending: false });
    } else {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await query;

    const formatId = (id: string, dateStr: string) => {
      if (id.startsWith('BUILD-')) return id;
      const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
      const num = parseInt(id.replace(/-/g, '').substring(0, 8), 16) || Math.floor(Math.random() * 9999);
      return `BUILD-${year}-${(num % 10000).toString().padStart(4, '0')}`;
    };

    let supabaseRequests = [];
    if (error) {
      console.error('Error fetching custom requests from Supabase:', error);
    } else {
      supabaseRequests = (data || []).map((row: any) => ({
        id: row.id,
        displayId: formatId(row.id, row.created_at),
        userId: row.user_id,
        title: row.title,
        requirements: row.requirements,
        budget: row.budget,
        deadline: row.deadline,
        techStack: row.tech_stack || [],
        contactName: row.contact_name,
        whatsapp: row.whatsapp,
        email: row.email,
        institution: row.institution,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    let firebaseRequests: any[] = [];
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const { getAdminDb } = await import('@/lib/firebase-admin');
        const adminDb = getAdminDb();
        
        let fbQuery = adminDb.collection('project_requests');
        if (userId && all !== 'true') {
          fbQuery = fbQuery.where('requesterId', '==', userId) as any;
        }

        const snapshot = await fbQuery.orderBy('createdAt', 'desc').get();
        firebaseRequests = snapshot.docs.map(doc => {
          const fbData = doc.data();
          return {
            id: doc.id,
            displayId: formatId(doc.id, fbData.createdAt?.toDate ? fbData.createdAt.toDate().toISOString() : new Date().toISOString()),
            userId: fbData.requesterId || fbData.user_id || fbData.userId || 'Unknown',
            title: fbData.projectTitle || fbData.title || 'Legacy Request',
            requirements: fbData.message || fbData.requirements || 'N/A',
            budget: fbData.budget || 'Flexible',
            deadline: fbData.deadline || 'Flexible',
            techStack: fbData.techStack || [],
            contactName: fbData.requesterName || fbData.contactName || 'Unknown',
            whatsapp: fbData.whatsapp || 'N/A',
            email: fbData.email || 'N/A',
            institution: fbData.institution || 'N/A',
            status: fbData.status || 'pending',
            adminNotes: fbData.adminNotes || '',
            createdAt: fbData.createdAt?.toDate ? fbData.createdAt.toDate().toISOString() : new Date().toISOString(),
          };
        });
      } catch (err) {
        console.error('Error fetching custom requests from Firebase:', err);
      }
    }

    const mergedRequests = [...supabaseRequests, ...firebaseRequests];

    // Fetch universal admin notes from Firebase to avoid Supabase schema changes
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const { getAdminDb } = await import('@/lib/firebase-admin');
        const adminDb = getAdminDb();
        const notesSnap = await adminDb.collection('custom_request_notes').get();
        const notesMap = new Map();
        notesSnap.docs.forEach(doc => {
          notesMap.set(doc.id, doc.data());
        });
        mergedRequests.forEach(req => {
          const notesData = notesMap.get(req.id) || {};
          req.adminNotes = notesData.adminNotes !== undefined ? notesData.adminNotes : (req.adminNotes || '');
          req.adminQuote = notesData.adminQuote !== undefined ? notesData.adminQuote : null;
          req.userOffer = notesData.userOffer !== undefined ? notesData.userOffer : null;
          req.tokenAmount = notesData.tokenAmount !== undefined ? notesData.tokenAmount : null;
          req.negotiationStatus = notesData.negotiationStatus || '';

          if (notesData.status !== undefined) req.status = notesData.status;
          if (notesData.title !== undefined) req.title = notesData.title;
          if (notesData.requirements !== undefined) req.requirements = notesData.requirements;
          if (notesData.budget !== undefined) req.budget = notesData.budget;
          if (notesData.deadline !== undefined) req.deadline = notesData.deadline;
          if (notesData.techStack !== undefined) req.techStack = notesData.techStack;
          if (notesData.contactName !== undefined) req.contactName = notesData.contactName;
          if (notesData.whatsapp !== undefined) req.whatsapp = notesData.whatsapp;
          if (notesData.email !== undefined) req.email = notesData.email;
          if (notesData.institution !== undefined) req.institution = notesData.institution;
        });
      } catch (err) {
        console.error('Error fetching universal notes:', err);
      }
    }

    // Sort merged requests by createdAt desc
    mergedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: mergedRequests });
  } catch (error) {
    console.error('Error fetching custom requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, requirements, budget, deadline, techStack, contactName, whatsapp, email, institution } = body;

    if (!userId || !title || !requirements) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and requirements are required' },
        { status: 400 }
      );
    }

    const insertData = {
      user_id: userId,
      title,
      requirements,
      budget: budget || 'Flexible',
      deadline: deadline || 'No deadline',
      tech_stack: techStack || [],
      contact_name: contactName || 'Not provided',
      whatsapp: whatsapp || 'Not provided',
      email: email || 'Not provided',
      institution: institution || 'Not provided',
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('custom_requests')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting custom request into Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Return camelCase version for frontend
    const responseData = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      requirements: data.requirements,
      budget: data.budget,
      deadline: data.deadline,
      techStack: data.tech_stack,
      contactName: data.contact_name,
      whatsapp: data.whatsapp,
      email: data.email,
      institution: data.institution,
      status: data.status,
      createdAt: data.created_at,
    };

    return NextResponse.json({ success: true, data: responseData }, { status: 201 });

  } catch (error) {
    console.error('Custom request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit custom request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, adminNotes, title, requirements, budget, deadline, techStack, contactName, whatsapp, email, institution, adminQuote, userOffer, tokenAmount, negotiationStatus } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (status !== undefined) updatePayload.status = status;
    if (title !== undefined) updatePayload.title = title;
    if (requirements !== undefined) updatePayload.requirements = requirements;
    if (budget !== undefined) updatePayload.budget = budget;
    if (deadline !== undefined) updatePayload.deadline = deadline;
    if (techStack !== undefined) updatePayload.tech_stack = techStack;
    if (contactName !== undefined) updatePayload.contact_name = contactName;
    if (whatsapp !== undefined) updatePayload.whatsapp = whatsapp;
    if (email !== undefined) updatePayload.email = email;
    if (institution !== undefined) updatePayload.institution = institution;

    // Try Supabase first
    const { error: sbError } = await supabase
      .from('custom_requests')
      .update(updatePayload)
      .eq('id', id);

    // If it's a UUID, it's likely Supabase. If not, try Firebase just in case.
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      
      // Save universal notes & negotiations
      const notesPayload: any = { updatedAt: new Date() };
      if (adminNotes !== undefined) notesPayload.adminNotes = adminNotes;
      if (adminQuote !== undefined) notesPayload.adminQuote = adminQuote;
      if (userOffer !== undefined) notesPayload.userOffer = userOffer;
      if (tokenAmount !== undefined) notesPayload.tokenAmount = tokenAmount;
      if (negotiationStatus !== undefined) notesPayload.negotiationStatus = negotiationStatus;
      
      if (status !== undefined) notesPayload.status = status;
      if (title !== undefined) notesPayload.title = title;
      if (requirements !== undefined) notesPayload.requirements = requirements;
      if (budget !== undefined) notesPayload.budget = budget;
      if (deadline !== undefined) notesPayload.deadline = deadline;
      if (techStack !== undefined) notesPayload.techStack = techStack;
      if (contactName !== undefined) notesPayload.contactName = contactName;
      if (whatsapp !== undefined) notesPayload.whatsapp = whatsapp;
      if (email !== undefined) notesPayload.email = email;
      if (institution !== undefined) notesPayload.institution = institution;
      
      if (Object.keys(notesPayload).length > 1) { // More than just updatedAt
        await adminDb.collection('custom_request_notes').doc(id).set(notesPayload, { merge: true }).catch(() => {});
      }

      // If it's a firebase legacy request
      if (!id.includes('-')) {
        const fbUpdatePayload: any = { updatedAt: new Date() };
        if (status !== undefined) fbUpdatePayload.status = status;
        if (title !== undefined) fbUpdatePayload.title = title;
        if (requirements !== undefined) fbUpdatePayload.requirements = requirements;
        if (budget !== undefined) fbUpdatePayload.budget = budget;
        if (deadline !== undefined) fbUpdatePayload.deadline = deadline;
        if (techStack !== undefined) fbUpdatePayload.techStack = techStack;
        if (contactName !== undefined) fbUpdatePayload.contactName = contactName;
        if (whatsapp !== undefined) fbUpdatePayload.whatsapp = whatsapp;
        if (email !== undefined) fbUpdatePayload.email = email;
        if (institution !== undefined) fbUpdatePayload.institution = institution;

        await adminDb.collection('project_requests').doc(id).update(fbUpdatePayload).catch(() => {});
      }
    }

    if (sbError && id.includes('-')) {
      return NextResponse.json({ success: false, error: sbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
