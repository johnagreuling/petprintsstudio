import { sql } from '@vercel/postgres';

// ============================================================================
// TYPES
// ============================================================================

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

// API usage tracking
export interface ApiUsageRecord {
  id: number;
  session_id: string | null;
  provider: string;
  model: string;
  operation: string;
  tokens_input: number;
  tokens_output: number;
  images_generated: number;
  cost_cents: number;
  created_at: string;
}

// Order tracking
export interface OrderRecord {
  id: number;
  session_id: string;
  printify_order_id: string | null;
  stripe_payment_id: string | null;
  customer_email: string;
  customer_name: string;
  product_type: string;
  product_name: string;
  quantity: number;
  subtotal_cents: number;
  status: 'pending' | 'paid' | 'processing' | 'fulfilled' | 'shipped' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Page view tracking
export interface PageViewRecord {
  id: number;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  visitor_id: string;
  created_at: string;
}

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// Initialize all database tables
export async function initializeDatabase() {
  // Sessions table
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
  
  // API usage tracking table
  await sql`
    CREATE TABLE IF NOT EXISTS api_usage (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255),
      provider VARCHAR(50) NOT NULL,
      model VARCHAR(100) NOT NULL,
      operation VARCHAR(100) NOT NULL,
      tokens_input INT DEFAULT 0,
      tokens_output INT DEFAULT 0,
      images_generated INT DEFAULT 0,
      cost_cents INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Orders table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255),
      printify_order_id VARCHAR(255),
      stripe_payment_id VARCHAR(255),
      customer_email VARCHAR(255),
      customer_name VARCHAR(255),
      product_type VARCHAR(100),
      product_name VARCHAR(255),
      quantity INT DEFAULT 1,
      subtotal_cents INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Page views table (lightweight analytics)
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      path VARCHAR(500) NOT NULL,
      referrer VARCHAR(500),
      user_agent TEXT,
      country VARCHAR(100),
      city VARCHAR(100),
      region VARCHAR(100),
      visitor_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Brand Assets (DAM — digital asset manager)
  await sql`
    CREATE TABLE IF NOT EXISTS brand_assets (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(500) NOT NULL,
      url VARCHAR(1000) NOT NULL,
      r2_key VARCHAR(1000) NOT NULL,
      category VARCHAR(50) DEFAULT 'uncategorized',
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      file_size_bytes BIGINT DEFAULT 0,
      content_type VARCHAR(100),
      width INT,
      height INT,
      notes TEXT DEFAULT '',
      uploaded_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Create indexes for fast querying
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_pet_name ON sessions(pet_name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_last_name ON sessions(customer_last_name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id)`;
  
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_session_id ON api_usage(session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider)`;
  
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
  
  await sql`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id)`;
  
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_category ON brand_assets(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_uploaded_at ON brand_assets(uploaded_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_tags ON brand_assets USING GIN(tags)`;
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

// ============================================================================
// API USAGE TRACKING
// ============================================================================

// OpenAI pricing (as of 2024) - in cents per unit
const PRICING = {
  'gpt-image-1': { perImage: 4 }, // ~$0.04 per image edit
  'gpt-4o-mini': { inputPer1k: 0.015, outputPer1k: 0.06 }, // $0.15/1M input, $0.60/1M output
  'gpt-4o': { inputPer1k: 0.25, outputPer1k: 1.0 }, // $2.50/1M input, $10/1M output
  'dall-e-3': { perImage: 4 }, // $0.04 standard
  'fal-flux-pro': { perImage: 5.5 }, // ~$0.055 per image
};

export async function logApiUsage(data: {
  sessionId?: string;
  provider: string;
  model: string;
  operation: string;
  tokensInput?: number;
  tokensOutput?: number;
  imagesGenerated?: number;
}) {
  const { sessionId, provider, model, operation, tokensInput = 0, tokensOutput = 0, imagesGenerated = 0 } = data;
  
  // Calculate cost based on model
  let costCents = 0;
  const pricing = PRICING[model as keyof typeof PRICING];
  
  if (pricing) {
    if ('perImage' in pricing && imagesGenerated > 0) {
      costCents = Math.round(pricing.perImage * imagesGenerated);
    } else if ('inputPer1k' in pricing) {
      costCents = Math.round(
        (tokensInput / 1000) * pricing.inputPer1k +
        (tokensOutput / 1000) * pricing.outputPer1k
      );
    }
  }
  
  await sql`
    INSERT INTO api_usage (session_id, provider, model, operation, tokens_input, tokens_output, images_generated, cost_cents)
    VALUES (${sessionId || null}, ${provider}, ${model}, ${operation}, ${tokensInput}, ${tokensOutput}, ${imagesGenerated}, ${costCents})
  `;
  
  return costCents;
}

export async function getApiUsageStats(days: number = 30) {
  const result = await sql`
    SELECT 
      DATE(created_at) as date,
      provider,
      model,
      COUNT(*) as calls,
      SUM(tokens_input) as total_tokens_input,
      SUM(tokens_output) as total_tokens_output,
      SUM(images_generated) as total_images,
      SUM(cost_cents) as total_cost_cents
    FROM api_usage
    WHERE created_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at), provider, model
    ORDER BY date DESC
  `;
  return result.rows;
}

export async function getTotalApiSpend() {
  const result = await sql`
    SELECT 
      SUM(cost_cents) as total_cents,
      SUM(images_generated) as total_images,
      COUNT(*) as total_calls
    FROM api_usage
  `;
  return {
    totalCents: parseInt(result.rows[0]?.total_cents || '0'),
    totalImages: parseInt(result.rows[0]?.total_images || '0'),
    totalCalls: parseInt(result.rows[0]?.total_calls || '0'),
  };
}

export async function getDailyApiSpend(days: number = 30) {
  const result = await sql`
    SELECT 
      DATE(created_at) as date,
      SUM(cost_cents) as cost_cents,
      SUM(images_generated) as images
    FROM api_usage
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return result.rows;
}

// ============================================================================
// ORDERS
// ============================================================================

export async function createOrder(data: {
  sessionId: string;
  customerEmail: string;
  customerName: string;
  productType: string;
  productName: string;
  quantity: number;
  subtotalCents: number;
  stripePaymentId?: string;
}) {
  const result = await sql`
    INSERT INTO orders (session_id, customer_email, customer_name, product_type, product_name, quantity, subtotal_cents, stripe_payment_id, status)
    VALUES (${data.sessionId}, ${data.customerEmail}, ${data.customerName}, ${data.productType}, ${data.productName}, ${data.quantity}, ${data.subtotalCents}, ${data.stripePaymentId || null}, 'pending')
    RETURNING id
  `;
  return result.rows[0].id;
}

export async function updateOrderStatus(orderId: number, status: string, printifyOrderId?: string) {
  await sql`
    UPDATE orders 
    SET status = ${status}, printify_order_id = COALESCE(${printifyOrderId || null}, printify_order_id), updated_at = NOW()
    WHERE id = ${orderId}
  `;
}

export async function getOrders(options: { limit?: number; status?: string } = {}) {
  const { limit = 50, status } = options;
  
  if (status) {
    const result = await sql`
      SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit}
    `;
    return result.rows;
  }
  
  const result = await sql`
    SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}
  `;
  return result.rows;
}

export async function getOrderStats() {
  const result = await sql`
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'paid' OR status = 'fulfilled' OR status = 'shipped' THEN subtotal_cents ELSE 0 END) as total_revenue_cents,
      COUNT(CASE WHEN status = 'paid' OR status = 'fulfilled' OR status = 'shipped' THEN 1 END) as completed_orders
    FROM orders
  `;
  return {
    totalOrders: parseInt(result.rows[0]?.total_orders || '0'),
    totalRevenueCents: parseInt(result.rows[0]?.total_revenue_cents || '0'),
    completedOrders: parseInt(result.rows[0]?.completed_orders || '0'),
  };
}

export async function getDailyRevenue(days: number = 30) {
  const result = await sql`
    SELECT 
      DATE(created_at) as date,
      SUM(subtotal_cents) as revenue_cents,
      COUNT(*) as orders
    FROM orders
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
      AND (status = 'paid' OR status = 'fulfilled' OR status = 'shipped')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return result.rows;
}

// ============================================================================
// PAGE VIEWS / ANALYTICS
// ============================================================================

export async function logPageView(data: {
  path: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  region?: string;
  visitorId: string;
}) {
  await sql`
    INSERT INTO page_views (path, referrer, user_agent, country, city, region, visitor_id)
    VALUES (${data.path}, ${data.referrer || null}, ${data.userAgent || null}, ${data.country || null}, ${data.city || null}, ${data.region || null}, ${data.visitorId})
  `;
}

export async function getPageViewStats(days: number = 30) {
  const result = await sql`
    SELECT 
      COUNT(*) as total_views,
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
  `;
  return {
    totalViews: parseInt(result.rows[0]?.total_views || '0'),
    uniqueVisitors: parseInt(result.rows[0]?.unique_visitors || '0'),
  };
}

export async function getDailyPageViews(days: number = 30) {
  const result = await sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return result.rows;
}

export async function getTopPages(days: number = 30, limit: number = 10) {
  const result = await sql`
    SELECT 
      path,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    GROUP BY path
    ORDER BY views DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function getTopReferrers(days: number = 30, limit: number = 10) {
  const result = await sql`
    SELECT 
      COALESCE(referrer, 'Direct') as referrer,
      COUNT(*) as visits,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    GROUP BY referrer
    ORDER BY visits DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

export async function getVisitorLocations(days: number = 30, limit: number = 10) {
  const result = await sql`
    SELECT 
      COALESCE(country, 'Unknown') as country,
      COALESCE(region, '') as region,
      COUNT(*) as visits,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
    GROUP BY country, region
    ORDER BY visitors DESC
    LIMIT ${limit}
  `;
  return result.rows;
}

// ============================================================================
// DASHBOARD AGGREGATES
// ============================================================================

export async function getDashboardStats() {
  // Get all stats in parallel
  const [sessionCount, apiSpend, orderStats, pageViewStats] = await Promise.all([
    getSessionCount(),
    getTotalApiSpend(),
    getOrderStats(),
    getPageViewStats(30),
  ]);
  
  // Calculate conversion rate (orders / sessions)
  const conversionRate = sessionCount > 0 
    ? ((orderStats.completedOrders / sessionCount) * 100).toFixed(1)
    : '0';
  
  return {
    sessions: {
      total: sessionCount,
    },
    api: {
      totalSpendCents: apiSpend.totalCents,
      totalImages: apiSpend.totalImages,
      totalCalls: apiSpend.totalCalls,
    },
    orders: {
      total: orderStats.totalOrders,
      completed: orderStats.completedOrders,
      revenueCents: orderStats.totalRevenueCents,
    },
    traffic: {
      views: pageViewStats.totalViews,
      visitors: pageViewStats.uniqueVisitors,
    },
    conversionRate,
  };
}


// ============================================================================
// BRAND ASSETS (DAM — digital asset manager)
// ============================================================================

export interface BrandAssetRecord {
  id: number;
  filename: string;
  url: string;
  r2_key: string;
  category: string;
  tags: string[];
  file_size_bytes: number;
  content_type: string | null;
  width: number | null;
  height: number | null;
  notes: string;
  uploaded_at: string;
}

export const BRAND_ASSET_CATEGORIES = [
  'hero',
  'lifestyle-canvas',
  'lifestyle-print',
  'lifestyle-apparel',
  'lifestyle-home',
  'ugc',
  'logo',
  'stock',
  'campaign',
  'uncategorized',
] as const;

export async function insertBrandAsset(data: {
  filename: string;
  url: string;
  r2_key: string;
  category?: string;
  tags?: string[];
  file_size_bytes?: number;
  content_type?: string | null;
  width?: number | null;
  height?: number | null;
  notes?: string;
}) {
  const category = data.category || 'uncategorized';
  const tags = data.tags || [];
  const result = await sql`
    INSERT INTO brand_assets
      (filename, url, r2_key, category, tags, file_size_bytes, content_type, width, height, notes)
    VALUES
      (${data.filename}, ${data.url}, ${data.r2_key}, ${category}, ${tags as any},
       ${data.file_size_bytes || 0}, ${data.content_type || null}, ${data.width || null},
       ${data.height || null}, ${data.notes || ''})
    RETURNING *
  `;
  return result.rows[0] as BrandAssetRecord;
}

export async function getBrandAssets(opts: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const limit = opts.limit ?? 200;
  const offset = opts.offset ?? 0;

  if (opts.category && opts.search) {
    const s = `%${opts.search}%`;
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE category = ${opts.category}
        AND (filename ILIKE ${s} OR notes ILIKE ${s} OR ${opts.search} = ANY(tags))
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  if (opts.category) {
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE category = ${opts.category}
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  if (opts.search) {
    const s = `%${opts.search}%`;
    const r = await sql`
      SELECT * FROM brand_assets
      WHERE filename ILIKE ${s} OR notes ILIKE ${s} OR ${opts.search} = ANY(tags)
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return r.rows as BrandAssetRecord[];
  }
  const r = await sql`
    SELECT * FROM brand_assets
    ORDER BY uploaded_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return r.rows as BrandAssetRecord[];
}

export async function getBrandAssetCountsByCategory() {
  const r = await sql`
    SELECT category, COUNT(*)::int as count
    FROM brand_assets
    GROUP BY category
  `;
  return r.rows as { category: string; count: number }[];
}

export async function updateBrandAsset(id: number, updates: {
  category?: string;
  tags?: string[];
  notes?: string;
}) {
  if (updates.category !== undefined && updates.tags !== undefined && updates.notes !== undefined) {
    const r = await sql`
      UPDATE brand_assets
      SET category = ${updates.category}, tags = ${updates.tags as any}, notes = ${updates.notes}
      WHERE id = ${id}
      RETURNING *
    `;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.category !== undefined) {
    const r = await sql`UPDATE brand_assets SET category = ${updates.category} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.tags !== undefined) {
    const r = await sql`UPDATE brand_assets SET tags = ${updates.tags as any} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  if (updates.notes !== undefined) {
    const r = await sql`UPDATE brand_assets SET notes = ${updates.notes} WHERE id = ${id} RETURNING *`;
    return r.rows[0] as BrandAssetRecord;
  }
  return null;
}

export async function getBrandAssetById(id: number) {
  const r = await sql`SELECT * FROM brand_assets WHERE id = ${id}`;
  return r.rows[0] as BrandAssetRecord | undefined;
}

export async function deleteBrandAsset(id: number) {
  const r = await sql`DELETE FROM brand_assets WHERE id = ${id} RETURNING *`;
  return r.rows[0] as BrandAssetRecord | undefined;
}
