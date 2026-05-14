import { NextRequest, NextResponse } from 'next/server'
import type { CartItem, OrderForm } from '@/lib/types'

type OrderPayload = {
  form: OrderForm
  items: CartItem[]
  totalCost: number
}

// ─── Airtable ────────────────────────────────────────────────────────────────

const BASE_ID = process.env.AIRTABLE_BASE_ID || 'appknMHaYAoq1VKkC'
const API_KEY = process.env.AIRTABLE_API_KEY

async function createAirtableRecord(
  table: string,
  fields: Record<string, unknown>
): Promise<string | null> {
  if (!API_KEY) return null

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error(`Airtable create error (${table}):`, err)
    return null
  }

  const data = await res.json()
  return data.id as string
}

async function recordOrderInAirtable(payload: OrderPayload): Promise<void> {
  const { form, items } = payload

  // 1. Create the Order record
  const orderId = await createAirtableRecord('Orders', {
    'PO Number': form.poNumber,
    'Order Date': new Date().toISOString().split('T')[0], // YYYY-MM-DD
    'Order Status': 'New',
    'Notes': form.notes || '',
    // Company, Contact, Ship To will be linked once auth is built
  })

  if (!orderId) {
    console.error('Failed to create Order record — skipping Order Items')
    return
  }

  // 2. Create an Order Item record for each cart item
  const itemPromises = items.map((item) => {
    const orderType = item.type === 'mattress' ? 'Mattress Only' : 'Set'
    const lineItemName = `${form.poNumber} — ${item.size} — ${orderType}`

    return createAirtableRecord('Order Items', {
      'Line Item': lineItemName,
      'Orders': [orderId],           // linked record
      'Products': [item.productId],  // linked record
      'Order Type': orderType,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
    })
  })

  await Promise.all(itemPromises)
}

// ─── Email ───────────────────────────────────────────────────────────────────

function buildEmailHtml(payload: OrderPayload): string {
  const { form, items, totalCost } = payload

  const itemRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 10px 12px; font-size: 13px; color: #1c2333;">
          <strong>${item.modelName}</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">${item.collectionName} · SKU: ${item.sku}</span>
        </td>
        <td style="padding: 10px 12px; text-align: center; font-size: 13px;">
          <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${item.size}</span>
        </td>
        <td style="padding: 10px 12px; text-align: center; font-size: 13px;">
          <span style="background: #e8f8fb; color: #2ab9d4; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
            ${item.type === 'mattress' ? 'Mattress Only' : 'Set'}
          </span>
        </td>
        <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #6b7280;">
          $${item.unitPrice.toFixed(2)}
        </td>
        <td style="padding: 10px 12px; text-align: center; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: 600; color: #1c2333;">
          $${(item.unitPrice * item.quantity).toFixed(2)}
        </td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 20px;">
  <div style="max-width: 680px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <div style="background: #2ab9d4; padding: 28px 32px;">
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">New Order Received</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">PO #${form.poNumber}</p>
    </div>

    <div style="padding: 24px 32px; border-bottom: 1px solid #f3f4f6;">
      <h2 style="font-size: 14px; font-weight: 700; color: #1c2333; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Client Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #6b7280; width: 120px;">Name</td>
          <td style="padding: 4px 0; font-size: 13px; color: #1c2333; font-weight: 600;">${form.clientName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Company</td>
          <td style="padding: 4px 0; font-size: 13px; color: #1c2333; font-weight: 600;">${form.companyName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Email</td>
          <td style="padding: 4px 0; font-size: 13px;"><a href="mailto:${form.clientEmail}" style="color: #2ab9d4;">${form.clientEmail}</a></td>
        </tr>
        ${form.clientPhone ? `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Phone</td>
          <td style="padding: 4px 0; font-size: 13px; color: #1c2333;">${form.clientPhone}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="padding: 24px 32px; border-bottom: 1px solid #f3f4f6;">
      <h2 style="font-size: 14px; font-weight: 700; color: #1c2333; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
            <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #6b7280; text-transform: uppercase;">Product</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6b7280; text-transform: uppercase;">Size</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6b7280; text-transform: uppercase;">Type</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6b7280; text-transform: uppercase;">Unit</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6b7280; text-transform: uppercase;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6b7280; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    <div style="padding: 20px 32px; border-bottom: 1px solid #f3f4f6; text-align: right;">
      <span style="font-size: 15px; color: #6b7280;">Order Total: </span>
      <span style="font-size: 22px; font-weight: 700; color: #2ab9d4;">$${totalCost.toFixed(2)}</span>
    </div>

    ${form.notes ? `
    <div style="padding: 20px 32px; border-bottom: 1px solid #f3f4f6;">
      <h2 style="font-size: 14px; font-weight: 700; color: #1c2333; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.05em;">Notes</h2>
      <p style="font-size: 13px; color: #6b7280; margin: 0;">${form.notes}</p>
    </div>` : ''}

    <div style="padding: 20px 32px; background: #f9fafb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
        Comfort Bedding Mfg. · Comfort Portal · PO #${form.poNumber}
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload: OrderPayload = await req.json()

    // Run Airtable recording and email in parallel
    const [, emailRes] = await Promise.all([
      recordOrderInAirtable(payload),
      sendEmail(payload),
    ])

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.error('Resend error:', errText)
      // Order is already recorded in Airtable — don't fail the whole request
      return NextResponse.json({
        success: true,
        warning: 'Order recorded but email failed to send',
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order submission error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function sendEmail(payload: OrderPayload): Promise<Response> {
  const resendKey = process.env.RESEND_API_KEY
  const orderEmail = process.env.ORDER_EMAIL || 'comfortbedding@chrisborst.com'

  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return new Response(null, { status: 200 })
  }

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'Comfort Portal <onboarding@resend.dev>',
      to: [orderEmail],
      subject: `New Order — PO #${payload.form.poNumber} — ${payload.form.companyName}`,
      html: buildEmailHtml(payload),
    }),
  })
}
