'use client'

import { Button } from '@/components/ui/Button'
import type { ResumeData } from './ResumeEditor'
import { useRef } from 'react'

interface ResumePreviewProps {
  data: ResumeData
  onClose?: () => void
}

export function ResumePreview({ data, onClose }: ResumePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return

    try {
      // Dynamic import of html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      
      const opt = {
        margin: 0.5,
        filename: `${data.name || 'resume'}-resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      }

      await html2pdf().set(opt).from(printRef.current).save()
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      // Fallback to print dialog
      handlePrint()
    }
  }

  const getPublicUrl = () => {
    // This will be populated when the app is hosted
    // For now, return a placeholder structure
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/p/${data.name?.toLowerCase().replace(/\s+/g, '-') || 'username'}/resume`
      : '#'
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button onClick={handlePrint} variant="ghost">
          Print
        </Button>
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(getPublicUrl())
            alert('Link copied to clipboard!')
          }}
          variant="ghost"
        >
          Copy Link
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        )}
      </div>

      {/* Resume content - optimized for print */}
      <div
        ref={printRef}
        data-resume-content
        className="bg-white text-black p-8 max-w-4xl mx-auto print:p-6 print:max-w-full"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6 print:mb-4">
          <h1 className="text-3xl font-bold mb-2 print:text-2xl">{data.name || 'Your Name'}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 print:text-xs flex-wrap">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 print:text-xs mt-2 flex-wrap">
            {data.website && (
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {data.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {data.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                LinkedIn
              </a>
            )}
            {data.github && (
              <a href={data.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-2 print:text-lg border-b-2 border-gray-800 pb-1">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed print:text-xs">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-3 print:text-lg border-b-2 border-gray-800 pb-1">
              Professional Experience
            </h2>
            <div className="space-y-4 print:space-y-3">
              {data.experience.map((exp, index) => (
                <div key={index} className="print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-1 print:mb-0.5">
                    <div>
                      <h3 className="font-semibold text-base print:text-sm">{exp.title}</h3>
                      <p className="text-sm text-gray-700 print:text-xs italic">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 print:text-xs">
                      <span>{exp.startDate}</span>
                      {exp.endDate && <span> - {exp.endDate}</span>}
                      {exp.current && <span> - Present</span>}
                    </div>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-gray-600 print:text-xs mb-2">{exp.location}</p>
                  )}
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-4 print:ml-3 print:space-y-0.5">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm print:text-xs">{desc}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-3 print:text-lg border-b-2 border-gray-800 pb-1">
              Education
            </h2>
            <div className="space-y-3 print:space-y-2">
              {data.education.map((edu, index) => (
                <div key={index} className="print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-1 print:mb-0.5">
                    <div>
                      <h3 className="font-semibold text-base print:text-sm">{edu.degree}</h3>
                      <p className="text-sm text-gray-700 print:text-xs italic">{edu.school}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 print:text-xs">
                      <span>{edu.startDate}</span>
                      {edu.endDate && <span> - {edu.endDate}</span>}
                    </div>
                  </div>
                  {edu.location && (
                    <p className="text-xs text-gray-600 print:text-xs mb-1">{edu.location}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600 print:text-xs">
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    {edu.honors && edu.honors.length > 0 && (
                      <span>Honors: {edu.honors.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-3 print:text-lg border-b-2 border-gray-800 pb-1">
              Skills
            </h2>
            <div className="space-y-3 print:space-y-2">
              {data.skills.map((skillGroup, index) => (
                <div key={index} className="print:break-inside-avoid">
                  <h3 className="font-semibold text-sm print:text-xs mb-1">{skillGroup.category}:</h3>
                  <p className="text-sm print:text-xs text-gray-700">
                    {skillGroup.items.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-3 print:text-lg border-b-2 border-gray-800 pb-1">
              Projects
            </h2>
            <div className="space-y-3 print:space-y-2">
              {data.projects.map((project, index) => (
                <div key={index} className="print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-1 print:mb-0.5">
                    <h3 className="font-semibold text-base print:text-sm">{project.name}</h3>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline print:text-xs"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                  <p className="text-sm print:text-xs text-gray-700 mb-1">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-xs text-gray-600 print:text-xs">
                      Technologies: {project.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h2 className="text-xl font-semibold mb-3 print:text-lg border-b-2 border-gray-800 pb-1">
              Certifications
            </h2>
            <div className="space-y-2 print:space-y-1">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex items-start justify-between print:break-inside-avoid">
                  <div>
                    <h3 className="font-semibold text-sm print:text-xs">{cert.name}</h3>
                    <p className="text-xs text-gray-600 print:text-xs">{cert.issuer}</p>
                  </div>
                  <div className="text-right text-xs text-gray-600 print:text-xs">
                    <div>{cert.date}</div>
                    {cert.expiryDate && <div>Expires: {cert.expiryDate}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0.5in;
          }
          body * {
            visibility: hidden;
          }
          [data-resume-content],
          [data-resume-content] * {
            visibility: visible;
          }
          [data-resume-content] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, nav, header, footer {
            display: none !important;
          }
          a {
            color: #000 !important;
            text-decoration: none !important;
          }
        }
      `}} />
    </div>
  )
}

