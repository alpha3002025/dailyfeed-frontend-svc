export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch link preview:', response.status);
      return null;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (name: string): string | null => {
      const element = doc.querySelector(`meta[property="${name}"]`) ||
                     doc.querySelector(`meta[name="${name}"]`);
      return element?.getAttribute('content') || null;
    };

    const title = getMetaContent('og:title') ||
                 getMetaContent('twitter:title') ||
                 doc.querySelector('title')?.textContent ||
                 '';

    const description = getMetaContent('og:description') ||
                       getMetaContent('twitter:description') ||
                       getMetaContent('description') ||
                       '';

    const image = getMetaContent('og:image') ||
                 getMetaContent('twitter:image') ||
                 '';

    const siteName = getMetaContent('og:site_name') ||
                    new URL(url).hostname ||
                    '';

    return {
      url,
      title: title.trim(),
      description: description.trim(),
      image: image,
      siteName: siteName,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
}

export function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}