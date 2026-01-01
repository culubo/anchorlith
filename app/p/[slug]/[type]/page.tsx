import { getPublicPage } from '@/lib/queries/public'
import { notFound } from 'next/navigation'
import { EditButton } from './components/EditButton'

interface PageProps {
  params: {
    slug: string
    type: string
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug, type } = params

  // Validate type
  if (!['resume', 'portfolio', 'links'].includes(type)) {
    notFound()
  }

  let page
  try {
    page = await getPublicPage(slug, type)
  } catch (error) {
    notFound()
  }

  const content = page.content_json

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <EditButton userId={page.user_id} />
      {type === 'resume' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-text-primary">{content.name || 'Resume'}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary flex-wrap">
              {content.email && <span>{content.email}</span>}
              {content.phone && <span>{content.phone}</span>}
              {content.location && <span>{content.location}</span>}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary mt-2 flex-wrap">
              {content.website && (
                <a href={content.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {content.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {content.linkedin && (
                <a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  LinkedIn
                </a>
              )}
              {content.github && (
                <a href={content.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          {content.summary && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-text-primary border-b border-border-subtle pb-1">
                Professional Summary
              </h2>
              <p className="text-text-primary leading-relaxed">{content.summary}</p>
            </div>
          )}

          {/* Experience */}
          {content.experience && content.experience.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-subtle pb-1">
                Professional Experience
              </h2>
              <div className="space-y-5">
                {content.experience.map((exp: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-lg text-text-primary">{exp.title}</h3>
                        <p className="text-sm text-text-secondary italic">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-text-secondary">
                        <span>{exp.startDate}</span>
                        {exp.endDate && <span> - {exp.endDate}</span>}
                        {exp.current && <span> - Present</span>}
                      </div>
                    </div>
                    {exp.location && (
                      <p className="text-xs text-text-tertiary mb-2">{exp.location}</p>
                    )}
                    {exp.description && Array.isArray(exp.description) && exp.description.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        {exp.description.map((desc: string, i: number) => (
                          <li key={i} className="text-sm text-text-primary">{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {content.education && content.education.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-subtle pb-1">
                Education
              </h2>
              <div className="space-y-4">
                {content.education.map((edu: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-lg text-text-primary">{edu.degree}</h3>
                        <p className="text-sm text-text-secondary italic">{edu.school}</p>
                      </div>
                      <div className="text-right text-sm text-text-secondary">
                        <span>{edu.startDate}</span>
                        {edu.endDate && <span> - {edu.endDate}</span>}
                      </div>
                    </div>
                    {edu.location && (
                      <p className="text-xs text-text-tertiary mb-1">{edu.location}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      {edu.honors && Array.isArray(edu.honors) && edu.honors.length > 0 && (
                        <span>Honors: {edu.honors.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {content.skills && Array.isArray(content.skills) && content.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-subtle pb-1">
                Skills
              </h2>
              <div className="space-y-3">
                {content.skills.map((skillGroup: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-semibold text-sm text-text-primary mb-1">{skillGroup.category}:</h3>
                    <p className="text-sm text-text-secondary">
                      {Array.isArray(skillGroup.items) ? skillGroup.items.join(', ') : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {content.projects && Array.isArray(content.projects) && content.projects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-subtle pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {content.projects.map((project: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-lg text-text-primary">{project.name}</h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-text-primary underline hover:text-text-secondary"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-1">{project.description}</p>
                    {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <p className="text-xs text-text-tertiary">
                        Technologies: {project.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {content.certifications && Array.isArray(content.certifications) && content.certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary border-b border-border-subtle pb-1">
                Certifications
              </h2>
              <div className="space-y-3">
                {content.certifications.map((cert: any, index: number) => (
                  <div key={index} className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">{cert.name}</h3>
                      <p className="text-xs text-text-secondary">{cert.issuer}</p>
                    </div>
                    <div className="text-right text-xs text-text-secondary">
                      <div>{cert.date}</div>
                      {cert.expiryDate && <div>Expires: {cert.expiryDate}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'portfolio' && (
        <div className="space-y-12">
          <h1 className="text-3xl mb-8 text-text-primary">Portfolio</h1>
          {content.projects && content.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.projects.map((project: any, index: number) => (
                <div key={index} className="space-y-3">
                  {project.imageUrl && (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                  <h3 className="text-lg text-text-primary">{project.title}</h3>
                  <p className="text-text-secondary">{project.description}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-primary underline hover:text-text-secondary"
                    >
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary">No projects yet</p>
          )}
        </div>
      )}

      {type === 'links' && (
        <div className="space-y-6">
          <h1 className="text-3xl mb-8 text-text-primary">Links</h1>
          {content.links && content.links.length > 0 ? (
            <div className="space-y-3">
              {content.links.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border-b border-border-subtle hover:bg-bg-secondary transition-colors"
                >
                  <h3 className="text-base text-text-primary">{link.label}</h3>
                  <p className="text-sm text-text-tertiary mt-1">{link.url}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-text-tertiary">No links yet</p>
          )}
        </div>
      )}
    </div>
  )
}

