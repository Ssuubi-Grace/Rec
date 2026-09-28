const BLOCK = /^(P|H3|H4|LI|DIV)$/i;
const TAG = /^(P|BR|STRONG|B|EM|I|U|S|STRIKE|UL|OL|LI|H3|H4|DIV)$/i;
const STYLE_KEYS = ['text-align', 'line-height', 'margin-left', 'margin-top', 'margin-bottom'];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanStyle(style = ''): string {
  const out: Record<string, string> = {};
  for (const part of String(style).split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const key = part.slice(0, i).trim().toLowerCase();
    const val = part.slice(i + 1).trim();
    if (STYLE_KEYS.includes(key) && val && !/expression|url\s*\(/i.test(val)) {
      out[key] = val;
    }
  }
  return Object.entries(out)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

export function sanitizeRich(html = ''): string {
  const s = String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '');
  const div = document.createElement('div');
  div.innerHTML = s;
  div.querySelectorAll('*').forEach((el) => {
    if (!TAG.test(el.tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
      return;
    }
    if (el.getAttribute('style')) {
      const cleaned = cleanStyle(el.getAttribute('style') || '');
      if (cleaned) el.setAttribute('style', cleaned);
      else el.removeAttribute('style');
    }
  });
  return div.innerHTML.trim();
}

export function richToPlain(html = ''): string {
  const d = document.createElement('div');
  d.innerHTML = sanitizeRich(html);
  return d.textContent?.replace(/\s+\n/g, '\n').trim() || '';
}

export function plainToHtml(text = ''): string {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeRich(text);
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Split rich or plain multiline content into bullet lines (for JD list fields). */
export function richTextToLines(value = ''): string[] {
  const plain = /<[a-z][\s\S]*>/i.test(value) ? richToPlain(value) : value;
  return plain
    .split('\n')
    .map((s) => s.replace(/^[\s•\-–]+/, '').trim())
    .filter(Boolean);
}

export function applyBlockStyle(body: HTMLElement, prop: string, value: string): void {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === 3) node = node.parentNode;
  while (node && node !== body && !(node instanceof HTMLElement && BLOCK.test(node.nodeName))) {
    node = node.parentNode;
  }
  const block = node instanceof HTMLElement && node !== body ? node : null;
  if (block) {
    block.style[prop as never] = value as never;
    return;
  }
  document.execCommand('formatBlock', false, 'p');
  let retry: Node | null = sel.anchorNode;
  if (retry?.nodeType === 3) retry = retry.parentNode;
  while (retry && retry !== body && !(retry instanceof HTMLElement && BLOCK.test(retry.nodeName))) {
    retry = retry.parentNode;
  }
  if (retry instanceof HTMLElement && retry !== body) {
    retry.style[prop as never] = value as never;
  }
}
