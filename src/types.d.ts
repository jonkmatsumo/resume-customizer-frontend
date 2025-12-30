declare module 'event-source-polyfill' {
  export class EventSourcePolyfill extends EventTarget {
    constructor(url: string, eventSourceInitDict?: Record<string, unknown>);
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    readyState: number;
    url: string;
    withCredentials: boolean;
    close(): void;
  }
}
