/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRequire } from 'module'

// Force Node.js runtime for this route (required for pdf-parse)
export const runtime = 'nodejs'

// Dynamic import for pdf-parse using createRequire for better compatibility
let pdfParse: any = null
async function getPdfParse() {
  if (!pdfParse) {
    try {
      // Use createRequire for better compatibility with CommonJS modules
      const require = createRequire(import.meta.url)
      const pdfParseModule = require('pdf-parse')
      pdfParse = pdfParseModule.default || pdfParseModule
      
      // Verify it's actually a function
      if (typeof pdfParse !== 'function') {
        throw new Error('pdf-parse module is not a function')
      }
    } catch (error: any) {
      console.error('Failed to import pdf-parse:', error)
      // Provide more detailed error message
      const errorMessage = error?.message || 'Unknown error'
      const errorStack = error?.stack || ''
      
      // Check if it's a module resolution error
      if (errorMessage.includes('Cannot find module') || errorMessage.includes('MODULE_NOT_FOUND')) {
        throw new Error('PDF parsing library not installed. Please run: npm install pdf-parse')
      }
      
      // Check if it's a native dependency issue
      if (errorMessage.includes('native') || errorStack.includes('node-gyp')) {
        throw new Error('PDF parsing library native dependencies not available. Please rebuild: npm rebuild pdf-parse')
      }
      
      throw new Error(`PDF parsing library not available: ${errorMessage}`)
    }
  }
  return pdfParse
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const pdfParser = await getPdfParse()
    const pdfData = await pdfParser(buffer)
    const text = pdfData.text

    // Extract resume data (basic parsing - can be improved with AI/ML)
    const extractedData = extractResumeData(text)

    return NextResponse.json(extractedData)
  } catch (error: unknown) {
    console.error('PDF parsing error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Failed to parse PDF' }, { status: 500 })
  }
}

// Basic resume data extraction from PDF text
function extractResumeData(text: string): any {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const data: any = {
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  }

  // Extract name (usually first line or first few lines)
  const nameMatch = lines[0]?.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/)
  if (nameMatch) {
    data.name = nameMatch[0]
  }

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) {
    data.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  if (phoneMatch) {
    data.phone = phoneMatch[0]
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i)
  if (linkedinMatch) {
    data.linkedin = `https://${linkedinMatch[0]}`
  }

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i)
  if (githubMatch) {
    data.github = `https://${githubMatch[0]}`
  }

  // Extract website
  const websiteMatch = text.match(/https?:\/\/[^\s]+/i)
  if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('github')) {
    data.website = websiteMatch[0]
  }

  // Try to find sections
  let currentSection = ''
  let sectionContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const upperLine = line.toUpperCase()

    // Detect section headers
    if (
      upperLine.includes('EXPERIENCE') ||
      upperLine.includes('WORK EXPERIENCE') ||
      upperLine.includes('EMPLOYMENT')
    ) {
      currentSection = 'experience'
      sectionContent = []
    } else if (
      upperLine.includes('EDUCATION') ||
      upperLine.includes('ACADEMIC')
    ) {
      currentSection = 'education'
      sectionContent = []
    } else if (
      upperLine.includes('SKILLS') ||
      upperLine.includes('TECHNICAL SKILLS') ||
      upperLine.includes('COMPETENCIES')
    ) {
      currentSection = 'skills'
      sectionContent = []
    } else if (
      upperLine.includes('PROJECTS') ||
      upperLine.includes('PROJECT')
    ) {
      currentSection = 'projects'
      sectionContent = []
    } else if (
      upperLine.includes('CERTIFICATIONS') ||
      upperLine.includes('CERTIFICATES')
    ) {
      currentSection = 'certifications'
      sectionContent = []
    } else if (
      upperLine.includes('SUMMARY') ||
      upperLine.includes('PROFILE') ||
      upperLine.includes('OBJECTIVE')
    ) {
      currentSection = 'summary'
      sectionContent = []
    } else if (line.length > 0 && currentSection) {
      sectionContent.push(line)
    }

    // Process section content when we hit a new section or end
    if (currentSection && (i === lines.length - 1 || isSectionHeader(lines[i + 1]))) {
      if (currentSection === 'summary' && sectionContent.length > 0) {
        data.summary = sectionContent.slice(0, 5).join(' ') // Take first few lines for summary
      } else if (currentSection === 'skills' && sectionContent.length > 0) {
        // Try to parse skills
        const skillsText = sectionContent.join(' ')
        const skillItems = skillsText.split(/[,;•\n]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 50)
        if (skillItems.length > 0) {
          data.skills = [{ category: 'Technical Skills', items: skillItems.slice(0, 20) }] // Limit to 20 skills
        }
      } else if (currentSection === 'experience' && sectionContent.length > 0) {
        // Try to parse experience entries
        const expEntries = parseExperienceEntries(sectionContent)
        if (expEntries.length > 0) {
          data.experience = expEntries
        }
      } else if (currentSection === 'education' && sectionContent.length > 0) {
        // Try to parse education entries
        const eduEntries = parseEducationEntries(sectionContent)
        if (eduEntries.length > 0) {
          data.education = eduEntries
        }
      }
      sectionContent = []
    }
  }

  return data
}

// Parse experience entries from text
function parseExperienceEntries(lines: string[]): any[] {
  const entries: any[] = []
  let currentEntry: any = null

  for (const line of lines) {
    // Look for job title patterns (usually all caps or title case)
    if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:Engineer|Developer|Manager|Analyst|Designer|Specialist|Lead|Senior|Junior)/)) {
      if (currentEntry) {
        entries.push(currentEntry)
      }
      currentEntry = {
        title: line,
        company: '',
        description: [],
      }
    } else if (currentEntry && !currentEntry.company && line.length > 0 && line.length < 100) {
      // Next line after title is usually company
      currentEntry.company = line
    } else if (currentEntry && line.match(/\d{4}|\d{1,2}\/\d{4}|Present|Current/i)) {
      // Date line
      const dateMatch = line.match(/(\d{1,2}\/\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\d{4}|Present|Current)/i)
      if (dateMatch) {
        // Convert date to YYYY-MM format
        const startDate = normalizeDate(dateMatch[1])
        if (startDate) {
          currentEntry.startDate = startDate
        }
        
        if (dateMatch[2] && !dateMatch[2].match(/Present|Current/i)) {
          const endDate = normalizeDate(dateMatch[2])
          if (endDate) {
            currentEntry.endDate = endDate
          }
        } else {
          currentEntry.current = true
        }
      }
    } else if (currentEntry && line.trim().startsWith('•') || line.trim().startsWith('-')) {
      // Bullet point
      currentEntry.description.push(line.replace(/^[•\-]\s*/, '').trim())
    } else if (currentEntry && line.length > 10 && line.length < 200) {
      // Regular description line
      if (currentEntry.description.length < 5) {
        currentEntry.description.push(line)
      }
    }
  }

  if (currentEntry) {
    entries.push(currentEntry)
  }

  return entries.slice(0, 10) // Limit to 10 entries
}

// Parse education entries from text
function parseEducationEntries(lines: string[]): any[] {
  const entries: any[] = []
  let currentEntry: any = null

  for (const line of lines) {
    // Look for degree patterns
    if (line.match(/(Bachelor|Master|PhD|Doctorate|Associate|Certificate).*?(?:in|of|,)/i)) {
      if (currentEntry) {
        entries.push(currentEntry)
      }
      currentEntry = {
        degree: line,
        school: '',
      }
    } else if (currentEntry && !currentEntry.school && line.length > 0 && line.length < 100) {
      // Next line after degree is usually school
      currentEntry.school = line
    } else if (currentEntry && line.match(/\d{4}/)) {
      // Date line
      const yearMatch = line.match(/(\d{4})/)
      if (yearMatch) {
        currentEntry.endDate = `${yearMatch[1]}-01` // Default to January
      }
    }
  }

  if (currentEntry) {
    entries.push(currentEntry)
  }

  return entries.slice(0, 5) // Limit to 5 entries
}

// Normalize date to YYYY-MM format
function normalizeDate(dateStr: string): string | null {
  // Handle MM/YYYY format
  const mmYYYY = dateStr.match(/(\d{1,2})\/(\d{4})/)
  if (mmYYYY) {
    const month = mmYYYY[1].padStart(2, '0')
    return `${mmYYYY[2]}-${month}`
  }
  
  // Handle YYYY format
  const yyyy = dateStr.match(/(\d{4})/)
  if (yyyy) {
    return `${yyyy[1]}-01` // Default to January
  }
  
  return null
}

function isSectionHeader(line: string | undefined): boolean {
  if (!line) return false
  const upper = line.toUpperCase()
  return (
    upper.includes('EXPERIENCE') ||
    upper.includes('EDUCATION') ||
    upper.includes('SKILLS') ||
    upper.includes('PROJECTS') ||
    upper.includes('CERTIFICATIONS') ||
    upper.includes('SUMMARY') ||
    upper.includes('PROFILE') ||
    upper.includes('OBJECTIVE')
  )
}

