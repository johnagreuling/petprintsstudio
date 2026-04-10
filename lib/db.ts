import { sql } from '@vercel/postgres';

// Session metadata stored for each generation run
export interface SessionRecord {
  id: string;
  session_id: string;
  created_at: string;
  customer_email: string;
  customer_last_name: string;
  pet_name: string;
  pet_type: string;
  images: SessionImage[];
  questionnaire: Record<string, string>;
}

export interface SessionImage {
  style_id: string;
  style_name: string;
  url: string;
  variant_index: number;
}

// Initialize the sessions table
export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      customer_email VARCHAR(255),
      customer_last_name VARCHAR(255),
      pet_name VARCHAR(255),
      pet_type VARCHAR(100),
      images JSONB DEFAULT '[]',
      questionnaire JSONB DEFAULT '{}'
    )
  `;
  
  // Create indexes for fast searching
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_pet_name ON sessions(pet_name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_last_name ON sessions(customer_last_name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id)`;
}

// Save a new session
export async function saveSession(data: {
  sessionId: string;
  customerEmail?: string;
  customerLastName?: string;
  petName?: string;
  petType?: string;
  images: SessionImage[];
  questionnaire?: Record<string, string>;
}) {
  const { sessionId, customerEmail, customerLastName, petName, petType, images, questionnaire } = data;
  
  await sql`
    INSERT INTO sessions (session_id, customer_email, customer_last_name, pet_name, pet_type, images, questionnaire)
    VALUES (
      ${sessionId},
      ${customerEmail || ''},
      ${customerLastName || ''},
      ${petName || ''},
      ${petType || 'dog'},
      ${JSON.stringify(images)},
      ${JSON.stringify(questionnaire || {})}
    )
    ON CONFLICT (session_id) DO UPDATE SET
      images = sessions.images || ${JSON.stringify(images)}::jsonb,
      customer_email = COALESCE(NULLIF(${customerEmail || ''}, ''), sessions.customer_email),
      customer_last_name = COALESCE(NULLIF(${customerLastName || ''}, ''), sessions.customer_last_name),
      pet_name = COALESCE(NULLIF(${petName || ''}, ''), sessions.pet_name)
  `;
}

// Add images to existing session
export async function addImagesToSession(sessionId: string, images: SessionImage[]) {
  await sql`
    UPDATE sessions 
    SET images = images || ${JSON.stringify(images)}::jsonb
    WHERE session_id = ${sessionId}
  `;
}

// Search sessions
export async function searchSessions(query: {
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  const { search, startDate, endDate, limit = 50, offset = 0 } = query;
  
  let result;
  
  if (search) {
    const searchPattern = `%${search.toLowerCase()}%`;
    result = await sql`
      SELECT * FROM sessions 
      WHERE 
        LOWER(pet_name) LIKE ${searchPattern}
        OR LOWER(customer_last_name) LIKE ${searchPattern}
        OR LOWER(customer_email) LIKE ${searchPattern}
        OR session_id LIKE ${searchPattern}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (startDate && endDate) {
    result = await sql`
      SELECT * FROM sessions 
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    result = await sql`
      SELECT * FROM sessions 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  
  return result.rows;
}

// Get single session by ID
export async function getSession(sessionId: string) {
  const result = await sql`
    SELECT * FROM sessions WHERE session_id = ${sessionId}
  `;
  return result.rows[0] || null;
}

// Get session count
export async function getSessionCount() {
  const result = await sql`SELECT COUNT(*) as count FROM sessions`;
  return parseInt(result.rows[0].count);
}
