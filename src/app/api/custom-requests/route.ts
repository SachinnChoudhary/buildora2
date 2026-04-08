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

    if (error) {
      console.error('Error fetching custom requests from Supabase:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Map snake_case columns to camelCase for frontend compatibility
    const mapped = (data || []).map((row: any) => ({
      id: row.id,
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

    return NextResponse.json({ success: true, data: mapped });
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
