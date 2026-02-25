// Report uploader — sends session data to Cloudflare KV via the proxy
// Auto-uploads after analysis is generated so the admin can browse all reports

const REPORTS_BASE = import.meta.env.DEV
  ? '/api/reports'
  : 'https://drevil-proxy.drevil.workers.dev/api/reports'

export interface ReportPayload {
  sessionId: string
  userId: string
  mode: string
  genre?: string
  startedAt: number
  turnCount: number
  turns: unknown[]
  analyses: unknown[]
}

export interface ReportMeta {
  sessionId: string
  userId: string
  mode: string
  genre: string | null
  startedAt: number
  turnCount: number
  hasAnalysis: boolean
  uploadedAt: number
}

/**
 * Upload a session report to the server.
 * Called automatically after analysis is generated.
 */
export async function uploadReport(payload: ReportPayload): Promise<void> {
  try {
    const response = await fetch(REPORTS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      console.warn(`Report upload failed: ${response.status}`)
    }
  } catch (err) {
    console.warn('Report upload error:', err)
  }
}

/**
 * List all uploaded reports (metadata only).
 */
export async function listReports(): Promise<ReportMeta[]> {
  const response = await fetch(REPORTS_BASE)
  if (!response.ok) throw new Error(`Failed to list reports: ${response.status}`)
  const data = await response.json() as { reports: ReportMeta[] }
  return data.reports
}

/**
 * Fetch a full report by session ID.
 */
export async function getReport(sessionId: string): Promise<ReportPayload> {
  const response = await fetch(`${REPORTS_BASE}/${encodeURIComponent(sessionId)}`)
  if (!response.ok) throw new Error(`Failed to fetch report: ${response.status}`)
  return response.json() as Promise<ReportPayload>
}
