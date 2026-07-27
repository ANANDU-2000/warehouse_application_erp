type BusinessEvent = {
  type: string;
  business_id: string;
  [key: string]: unknown;
};

const subscribers = new Map<string, Set<(event: BusinessEvent) => void>>();
const recentEvents = new Map<string, BusinessEvent[]>();

const MAX_RECENT = 100;

export function publishBusinessEvent(event: BusinessEvent): void {
  const bid = event.business_id;
  if (!recentEvents.has(bid)) {
    recentEvents.set(bid, []);
  }
  const recent = recentEvents.get(bid)!;
  recent.push(event);
  if (recent.length > MAX_RECENT) {
    recent.splice(0, recent.length - MAX_RECENT);
  }
  const subs = subscribers.get(bid);
  if (subs) {
    for (const cb of subs) {
      try { cb(event); } catch { /* ignore */ }
    }
  }
}

export function subscribeBusinessEvents(
  businessId: string,
  cb: (event: BusinessEvent) => void,
): () => void {
  if (!subscribers.has(businessId)) {
    subscribers.set(businessId, new Set());
  }
  subscribers.get(businessId)!.add(cb);
  return () => {
    subscribers.get(businessId)?.delete(cb);
  };
}

export function recentBusinessEvents(businessId: string, limit: number = 50): BusinessEvent[] {
  const recent = recentEvents.get(businessId);
  if (!recent) return [];
  return recent.slice(-limit);
}
