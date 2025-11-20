import { createRoot } from 'react-dom/client';
import { WidgetContainer } from './components/widget-container';
import './styles/style.css';


function initializeWidget() {
  if (document.readyState !== 'loading') {
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }
}

function onReady() {
  try {
    const script = document.currentScript as HTMLScriptElement;
    const clientKey = getClientKey(script);
    const className = getClassName(script);
    const externalId = getExternalId(script);
    const target = getEmbedTarget(script);
    const contributorEmail = getContributorEmail(script);
    const contributorName = getContributorName(script);
    const desiredHeight = getEmbedHeight(script); // e.g., "800px" or "70vh"

    const hostEl = document.createElement('div');
    const shadow = hostEl.attachShadow({ mode: 'open' });
    const shadowRoot = document.createElement('div');
    shadowRoot.id = 'widget-root';
    shadowRoot.style.width = '100%';
    shadowRoot.style.height = '100%';

    const component = (
      <WidgetContainer
        clientKey={clientKey}
        className={className}
        externalId={externalId}
        contributorEmail={contributorEmail}
        contributorName={contributorName}
      />
    );

    // Inject styles directly into the ShadowRoot for proper scoping
    injectStyle(shadow);
    shadow.appendChild(shadowRoot);
    const root = createRoot(shadowRoot);
    root.render(component);

    if (target) {
      // Make the host fill the target container to allow 100% height usage inside
      hostEl.style.display = 'block';
      hostEl.style.width = '100%';
      hostEl.style.height = '100%';
      // If target has no explicit height, apply desiredHeight (default if not provided)
      const computed = window.getComputedStyle(target);
      const hasExplicitHeight = target.style.height || computed.height;
      if (!hasExplicitHeight || computed.height === '0px') {
        target.style.height = desiredHeight;
      }
      target.appendChild(hostEl);
    } else {
      document.body.appendChild(hostEl);
    }
  } catch (error) {
    console.warn('Widget initialization failed:', error);
  }
}

function injectStyle(shadowRoot: ShadowRoot) {
  const fileName = process.env.WIDGET_NAME || 'widget';
  const href = process.env.WIDGET_CSS_URL || `/${fileName}.css`;

  // Primary: link tag (supported in modern Chromium, but not universally guaranteed in shadow DOM)
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  shadowRoot.appendChild(link);

  // Fallback: style tag with @import ensures broad support inside shadow roots
  const style = document.createElement('style');
  style.textContent = `@import url("${href}");`;
  shadowRoot.appendChild(style);

  // Last-resort fallback: inline CSS text to guarantee styles in Shadow DOM
  try {
    fetch(href, { credentials: 'omit' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`css ${r.status}`))))
      .then((css) => {
        const inline = document.createElement('style');
        inline.textContent = css;
        shadowRoot.appendChild(inline);
      })
      .catch(() => {
        // ignore; link/@import may have already worked
      });
  } catch {
    // ignore
  }
}

function getClientKey(script: HTMLScriptElement | null) {
  // renamed: data-public-token replaces data-client-key
  const clientKey = script?.getAttribute('data-public-token') || script?.getAttribute('data-client-key');

  if (!clientKey) {
    throw new Error('Missing data-public-token attribute');
  }

  return clientKey;
}

function getClassName(script: HTMLScriptElement | null) {
  let className = script?.getAttribute('data-class-name');
  if (!className) {
    className = '';
  }
  return className;
}

function getExternalId(script: HTMLScriptElement | null): string | undefined {
  const val = script?.getAttribute('data-external-id')?.trim();
  return val && val.length > 0 ? val : undefined;
}

function getContributorEmail(script: HTMLScriptElement | null): string | undefined {
  const val = script?.getAttribute('data-email')?.trim();
  return val && val.length > 0 ? val : undefined;
}

function getContributorName(script: HTMLScriptElement | null): string | undefined {
  const val = script?.getAttribute('data-name')?.trim();
  return val && val.length > 0 ? val : undefined;
}

// api base is now configured via env (WIDGET_API_BASE) at build time

function getEmbedTarget(script: HTMLScriptElement | null): HTMLElement | null {
  const sel = script?.getAttribute('data-embed-target');
  if (!sel) return null;
  try {
    const el = document.querySelector(sel);
    if (el instanceof HTMLElement) return el;
    return null;
  } catch {
    return null;
  }
}

function getEmbedHeight(script: HTMLScriptElement | null): string {
  const h = script?.getAttribute('data-height')?.trim();
  // Accept values like "800px", "70vh", "100%"; default to 800px
  return h && h.length > 0 ? h : '800px';
}

initializeWidget();
