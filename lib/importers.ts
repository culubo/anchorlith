export function parseCSVToMarkdownTable(csvText: string): string {
  const rows = csvText.split(/\r?\n/).filter(Boolean).map(line => line.split(',').map(cell => cell.trim()))
  if (rows.length === 0) return ''
  const headers = rows[0]
  const body = rows.slice(1)
  const headerLine = `| ${headers.join(' | ')} |`
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`
  const rowLines = body.map(r => `| ${r.join(' | ')} |`)
  return [headerLine, sepLine, ...rowLines].join('\n')
}

export function parseICSToList(icsText: string): string {
  // Very small ICS parser for VEVENT summary/date pairs
  const lines = icsText.split(/\r?\n/)
  const events: string[] = []
  let current: Record<string, string> = {}
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = {}
    if (line === 'END:VEVENT') {
      const summary = current['SUMMARY'] || 'Event'
      const dt = current['DTSTART'] || ''
      // Basic date formatting: keep as-is for now
      events.push(`- ${summary} (${dt})`)
    }
    const [k, ...rest] = line.split(':')
    if (k && rest.length > 0) {
      current[k] = rest.join(':')
    }
  }
  return events.join('\n')
}
