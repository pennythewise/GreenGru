export type RouteSlug = "loan" | "grant" | "passport";

const FLOW_KEY = "greengru-route-flow";
const CONFIDENCE_FLOOR = 0.7;

/** Fill order when user confirms multiple routes: EU license → Loan → Grant */
export const ROUTE_CONFIRM_ORDER: RouteSlug[] = ["passport", "loan", "grant"];

export const ROUTE_LABELS: Record<RouteSlug, string> = {
  loan: "Loan 贷款",
  grant: "Grant 补贴",
  passport: "EU license CBAM",
};

export const ROUTE_LABELS_ZH: Record<RouteSlug, string> = {
  loan: "贷款",
  grant: "补贴",
  passport: "欧盟许可",
};

export function getRouteLabel(slug: RouteSlug, isZh: boolean): string {
  if (isZh) return ROUTE_LABELS_ZH[slug];
  const en: Record<RouteSlug, string> = { loan: "Loan", grant: "Grant", passport: "EU license" };
  return en[slug];
}

type RouteFlowState = {
  routes: RouteSlug[];
  currentIndex: number;
};

export function startRouteFlow(routes: RouteSlug[]) {
  if (routes.length === 0) return;
  const state: RouteFlowState = { routes, currentIndex: 0 };
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(state));
}

export function getRouteFlow(): RouteFlowState | null {
  try {
    const raw = sessionStorage.getItem(FLOW_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RouteFlowState;
  } catch {
    return null;
  }
}

export function clearRouteFlow() {
  sessionStorage.removeItem(FLOW_KEY);
}

export function getFlowProgress(slug: RouteSlug) {
  const flow = getRouteFlow();
  if (!flow || flow.routes[flow.currentIndex] !== slug) return null;
  const next = flow.routes[flow.currentIndex + 1];
  return {
    step: flow.currentIndex + 1,
    total: flow.routes.length,
    nextSlug: next ?? null,
    nextLabel: next ? ROUTE_LABELS[next] : null,
  };
}

/** Advance to next route in queue; returns next slug or null when flow is complete. */
export function advanceRouteFlow(): RouteSlug | null {
  const flow = getRouteFlow();
  if (!flow) return null;
  const nextIndex = flow.currentIndex + 1;
  if (nextIndex >= flow.routes.length) {
    clearRouteFlow();
    return null;
  }
  const next = flow.routes[nextIndex];
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ routes: flow.routes, currentIndex: nextIndex }));
  return next;
}

export function buildConfirmedRoutes(selected: Record<string, boolean>): RouteSlug[] {
  return ROUTE_CONFIRM_ORDER.filter((k) => selected[k]);
}

export { CONFIDENCE_FLOOR };
