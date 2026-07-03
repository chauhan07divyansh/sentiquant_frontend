// ─────────────────────────────────────────────
//  FILE-BASED BLOG SYSTEM
//  Reads Markdown (.md) files from content/blogs/.
//  Frontmatter parsed with gray-matter.
//  Server-only — never imported from client components.
// ─────────────────────────────────────────────

import fs   from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { BlogPost, BlogAuthor, BlogCategory } from '@/lib/blog'

const BLOGS_DIR = path.join(process.cwd(), 'content', 'blogs')

// ── Known authors → BlogAuthor shape ──────────
const AUTHOR_MAP: Record<string, BlogAuthor> = {
  'Shreyansh Chauhan': { name: 'Shreyansh Chauhan', role: 'CEO & Co-Founder',   avatar: 'SC' },
  'Keshav Chauhan':    { name: 'Keshav Chauhan',    role: 'COO & Co-Founder',   avatar: 'KC' },
  'Divyansh Chauhan':  { name: 'Divyansh Chauhan',  role: 'CTO & Co-Founder',   avatar: 'DC' },
  'Sentiquant Research': { name: 'Sentiquant Research', role: 'Research Team',  avatar: 'SR' },
}

function resolveAuthor(raw: unknown): BlogAuthor {
  if (raw && typeof raw === 'object' && 'name' in raw) return raw as BlogAuthor
  if (typeof raw === 'string' && AUTHOR_MAP[raw]) return AUTHOR_MAP[raw]
  if (typeof raw === 'string') {
    const initials = raw.split(' ').map((w) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
    return { name: raw, role: 'Contributor', avatar: initials }
  }
  return { name: 'Sentiquant Research', role: 'Research Team', avatar: 'SR' }
}

function calcReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
}

// ─────────────────────────────────────────────
//  getAllBlogs
//  Returns all PUBLISHED posts, newest first.
//  Called from server components only.
// ─────────────────────────────────────────────
export function getAllBlogs(): BlogPost[] {
  if (!fs.existsSync(BLOGS_DIR)) return []

  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith('.md'))

  return files
    .map((file): BlogPost | null => {
      const slug     = file.replace(/\.md$/, '')
      const raw      = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8')
      const { data, content } = matter(raw)

      // Skip drafts
      if (data.published === false) return null

      return {
        slug,
        title:          data.title        ?? 'Untitled',
        excerpt:        data.excerpt       ?? '',
        content,
        category:       (data.category    ?? 'Market Analysis') as BlogCategory,
        author:         resolveAuthor(data.author),
        publishedAt:    data.date          ?? new Date().toISOString().slice(0, 10),
        readTime:       data.readTime      ?? calcReadTime(content),
        tags:           data.tags          ?? [],
        featured:       data.featured      ?? false,
        coverGradient:  data.coverGradient ?? undefined,
        // Flag so the detail page knows to render as markdown
        contentType:    'markdown' as const,
      } satisfies BlogPost & { contentType: 'markdown' }
    })
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}

// ─────────────────────────────────────────────
//  getBlogBySlug
// ─────────────────────────────────────────────
export function getBlogBySlug(slug: string): (BlogPost & { contentType: 'markdown' }) | null {
  const filePath = path.join(BLOGS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  if (data.published === false) return null

  return {
    slug,
    title:         data.title        ?? 'Untitled',
    excerpt:       data.excerpt       ?? '',
    content,
    category:      (data.category    ?? 'Market Analysis') as BlogCategory,
    author:        resolveAuthor(data.author),
    publishedAt:   data.date          ?? new Date().toISOString().slice(0, 10),
    readTime:      data.readTime      ?? calcReadTime(content),
    tags:          data.tags          ?? [],
    featured:      data.featured      ?? false,
    coverGradient: data.coverGradient ?? undefined,
    contentType:   'markdown' as const,
  }
}

// ─────────────────────────────────────────────
//  getAllTags — unique sorted tag list
// ─────────────────────────────────────────────
export function getAllTags(): string[] {
  const tags = new Set<string>()
  getAllBlogs().forEach((b) => b.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}
