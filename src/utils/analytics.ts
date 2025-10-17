export function trackEvent(name: string, payload: Record<string, any> = {}) {
  try {
    // Google Analytics gtag
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      // @ts-ignore
      window.gtag('event', name, payload);
    }

    // dataLayer (GTM)
    // @ts-ignore
    if (typeof window !== 'undefined' && Array.isArray((window as any).dataLayer)) {
      // @ts-ignore
      window.dataLayer.push({ event: name, ...payload });
    }
  } catch (e) {
    // swallow errors to avoid breaking the app
    // eslint-disable-next-line no-console
    console.warn('trackEvent failed', e);
  }
}
