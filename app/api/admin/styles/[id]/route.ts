import { NextResponse, NextRequest } from 'next/server'
import {
  readStyleById,
  updateStyle,
  deleteStyle,
  type StyleUpsertInput,
} from '@/lib/portrait-engine'

interface RouteCtx {
  params: Promise<{ id: string }> | { id: string }
}

async function getId(ctx: RouteCtx): Promise<string> {
  const p = await ctx.params
  return p.id
}

// ─── GET single style ───────────────────────────────────────────
export async function GET(_: NextRequest, ctx: RouteCtx) {
  try {
    const id = await getId(ctx)
    const style = await readStyleById(id)
    if (!style) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ style })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── PATCH update ───────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  try {
    const id = await getId(ctx)
    const existing = await readStyleById(id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const patch = (await req.json()) as Partial<StyleUpsertInput>

    // Disallow id rename via PATCH (would orphan sample images)
    if (patch.id && patch.id !== id) {
      return NextResponse.json(
        { error: 'id cannot be renamed; create a new style and soft-delete the old one' },
        { status: 400 }
      )
    }

    const updated = await updateStyle(id, patch)
    return NextResponse.json({ ok: true, style: updated })
  } catch (err) {
    console.error('Style PATCH error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── DELETE (soft by default) ──────────────────────────────────
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  try {
    const id = await getId(ctx)
    const url = new URL(req.url)
    const hard = url.searchParams.get('hard') === 'true'
    await deleteStyle(id, hard)
    return NextResponse.json({ ok: true, mode: hard ? 'hard' : 'soft' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
