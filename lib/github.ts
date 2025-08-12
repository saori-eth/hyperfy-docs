import { getCached, setCache } from './cache';

const GITHUB_OWNER = 'hyperfy-xyz';
const GITHUB_REPO = 'hyperfy';
const GITHUB_DOCS_PATH = 'docs';

export const BRANCHES = ['main', 'dev'] as const;
export type Branch = typeof BRANCHES[number];

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  children?: GitHubFile[];
}

export interface DocFile {
  slug: string[];
  title: string;
  content: string;
}

async function fetchGitHubAPI(path: string, branch: Branch = 'main') {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${branch}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
    next: { revalidate: process.env.NODE_ENV === 'production' ? 86400 : 3600 }, // 24h in prod, 1h in dev
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function getDocsStructure(branch: Branch = 'main'): Promise<GitHubFile> {
  // Check cache first in development
  const cacheKey = `docs-structure-${branch}`;
  const cached = getCached<GitHubFile>(cacheKey);
  if (cached) {
    console.log('Using cached docs structure');
    return cached;
  }

  async function fetchDirectory(path: string): Promise<GitHubFile> {
    const contents = await fetchGitHubAPI(path, branch);
    
    const result: GitHubFile = {
      name: path.split('/').pop() || 'docs',
      path,
      type: 'dir',
      children: [],
    };

    for (const item of contents) {
      if (item.type === 'dir') {
        const subDir = await fetchDirectory(item.path);
        result.children!.push(subDir);
      } else if (item.name.endsWith('.md')) {
        result.children!.push({
          name: item.name,
          path: item.path,
          type: 'file',
        });
      }
    }

    return result;
  }

  const structure = await fetchDirectory(GITHUB_DOCS_PATH);
  setCache(cacheKey, structure);
  return structure;
}

export async function getMarkdownContent(path: string, branch: Branch = 'main'): Promise<string> {
  // Check cache first in development
  const cacheKey = `content-${branch}-${path}`;
  const cached = getCached<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${path}`,
    {
      next: { revalidate: process.env.NODE_ENV === 'production' ? 86400 : 3600 }, // 24h in prod, 1h in dev
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  const content = await response.text();
  setCache(cacheKey, content);
  return content;
}

export async function getAllDocs(branch: Branch = 'main'): Promise<DocFile[]> {
  // Check cache first in development
  const cacheKey = `all-docs-${branch}`;
  const cached = getCached<DocFile[]>(cacheKey);
  if (cached) {
    console.log('Using cached all docs');
    return cached;
  }

  const docs: DocFile[] = [];

  async function processFile(file: GitHubFile, parentPath: string[] = []) {
    if (file.type === 'dir' && file.children) {
      for (const child of file.children) {
        const newPath = file.name === 'docs' ? [] : [...parentPath, file.name];
        await processFile(child, newPath);
      }
    } else if (file.type === 'file') {
      const content = await getMarkdownContent(file.path, branch);
      const slug = [...parentPath];
      
      if (file.name === 'README.md') {
        // README files represent their parent directory
        if (slug.length === 0) {
          slug.push('index');
        }
      } else {
        // Remove .md extension and add to slug
        slug.push(file.name.replace('.md', ''));
      }
      
      docs.push({
        slug,
        title: file.name.replace('.md', '').replace(/[-_]/g, ' '),
        content,
      });
    }
  }

  const structure = await getDocsStructure(branch);
  await processFile(structure);
  
  setCache(cacheKey, docs);
  return docs;
}

export function getDocBySlug(docs: DocFile[], slug: string[]): DocFile | undefined {
  return docs.find(doc => 
    doc.slug.length === slug.length && 
    doc.slug.every((s, i) => s === slug[i])
  );
}