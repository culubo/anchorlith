import { getPublicPage } from '@/lib/queries/public'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
    type: string
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug, type } = params

  let page
  try {
    page = await getPublicPage(slug, type)
  } catch (error) {
    notFound()
  }

  const content = page.content_json

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {type === 'resume' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl mb-2 text-text-primary">{content.name || 'Resume'}</h1>
            {content.email && (
              <p className="text-text-secondary">{content.email}</p>
            )}
            {content.phone && (
              <p className="text-text-secondary">{content.phone}</p>
            )}
          </div>

          {content.summary && (
            <div>
              <h2 className="text-xl mb-4 text-text-primary">Summary</h2>
              <p className="text-text-primary leading-relaxed">{content.summary}</p>
            </div>
          )}

          {content.experience && content.experience.length > 0 && (
            <div>
              <h2 className="text-xl mb-4 text-text-primary">Experience</h2>
              <div className="space-y-6">
                {content.experience.map((exp: any, index: number) => (
                  <div key={index} className="pl-4 border-l-2 border-border-subtle">
                    <h3 className="text-lg text-text-primary">{exp.title}</h3>
                    <p className="text-text-secondary">{exp.company} • {exp.period}</p>
                    <p className="text-text-primary mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.education && content.education.length > 0 && (
            <div>
              <h2 className="text-xl mb-4 text-text-primary">Education</h2>
              <div className="space-y-4">
                {content.education.map((edu: any, index: number) => (
                  <div key={index} className="pl-4 border-l-2 border-border-subtle">
                    <h3 className="text-lg text-text-primary">{edu.degree}</h3>
                    <p className="text-text-secondary">{edu.school} • {edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.skills && content.skills.length > 0 && (
            <div>
              <h2 className="text-xl mb-4 text-text-primary">Skills</h2>
              <p className="text-text-primary">{content.skills.join(', ')}</p>
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

