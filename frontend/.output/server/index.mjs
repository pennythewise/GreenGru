globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-15T10:02:25.140Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/assets/arrow-right-Dhxs1DPB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d-vyItcydyvmdLN1wmXJefjEaaNPM\"",
		"mtime": "2026-07-15T14:54:00.648Z",
		"size": 157,
		"path": "../public/assets/arrow-right-Dhxs1DPB.js"
	},
	"/assets/badge-check-BMRg0_8r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"134-NCTRt7uMX88+TJm5XjsKa7ylFsQ\"",
		"mtime": "2026-07-15T14:54:00.650Z",
		"size": 308,
		"path": "../public/assets/badge-check-BMRg0_8r.js"
	},
	"/assets/circle-alert-DKxGmsIi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2-7k4Mp4r/u78FjN8rwO+oqKCohdE\"",
		"mtime": "2026-07-15T14:54:00.653Z",
		"size": 242,
		"path": "../public/assets/circle-alert-DKxGmsIi.js"
	},
	"/assets/entry-2NC8nN9E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2124-zZoVd30sQ6vq3PVavvOqxcnR72s\"",
		"mtime": "2026-07-15T14:54:00.658Z",
		"size": 8484,
		"path": "../public/assets/entry-2NC8nN9E.js"
	},
	"/assets/AppShell-B22Gw34E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"38f5a-7h9HLq9WOPRoP4yIosQW5UIl3KM\"",
		"mtime": "2026-07-15T14:54:00.634Z",
		"size": 233306,
		"path": "../public/assets/AppShell-B22Gw34E.js"
	},
	"/assets/dashboard-data-Wf0OHDvc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"355d-dwxe3dHy/EeFBILdFFOXSpkfu/I\"",
		"mtime": "2026-07-15T14:54:00.655Z",
		"size": 13661,
		"path": "../public/assets/dashboard-data-Wf0OHDvc.js"
	},
	"/assets/loader-circle-DkTWdOE2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-+iVWqFmdZoulgMvGy2L9Z0Oobz0\"",
		"mtime": "2026-07-15T14:54:00.671Z",
		"size": 423,
		"path": "../public/assets/loader-circle-DkTWdOE2.js"
	},
	"/assets/grant-CBHuMyo5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-oaUzuF++xuwm3lRFiMhftyGaURQ\"",
		"mtime": "2026-07-15T14:54:00.664Z",
		"size": 152,
		"path": "../public/assets/grant-CBHuMyo5.js"
	},
	"/assets/file-text-CD3H0cwC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"179-KTTzER4weOMlRyQ9aL9jKHygL6Y\"",
		"mtime": "2026-07-15T14:54:00.661Z",
		"size": 377,
		"path": "../public/assets/file-text-CD3H0cwC.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-15T14:54:00.667Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/loan-D4Ko0cg5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-k/zXXJB13CwInY5yiUsy0Y8GcS8\"",
		"mtime": "2026-07-15T14:54:00.673Z",
		"size": 151,
		"path": "../public/assets/loan-D4Ko0cg5.js"
	},
	"/assets/passport-jJ-xbCQC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-ivA/yGsmR338kWJfnj6M6nddYNY\"",
		"mtime": "2026-07-15T14:54:00.683Z",
		"size": 155,
		"path": "../public/assets/passport-jJ-xbCQC.js"
	},
	"/assets/plus-DhnZ9eXA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-P7uH5DGx5wQRk4FDyBs8syBmxIQ\"",
		"mtime": "2026-07-15T14:54:00.686Z",
		"size": 270,
		"path": "../public/assets/plus-DhnZ9eXA.js"
	},
	"/assets/new-DC_yZ4n9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"73e3-KQUbnL1JP5Jn7nDQFobmFfOsfMY\"",
		"mtime": "2026-07-15T14:54:00.678Z",
		"size": 29667,
		"path": "../public/assets/new-DC_yZ4n9.js"
	},
	"/assets/PieChart-Xzg_K8-q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5aa31-OTSy22ybV74URiA3oN16WFidIR4\"",
		"mtime": "2026-07-15T14:54:00.640Z",
		"size": 371249,
		"path": "../public/assets/PieChart-Xzg_K8-q.js"
	},
	"/assets/lock-BGKLGP5H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-HEqxQGerckaKfROdpokf7dArDns\"",
		"mtime": "2026-07-15T14:54:00.675Z",
		"size": 198,
		"path": "../public/assets/lock-BGKLGP5H.js"
	},
	"/assets/route-flow-t_ksCOV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-l2ERrqUiXJ6/jdg5t9D7L92kcug\"",
		"mtime": "2026-07-15T14:54:00.691Z",
		"size": 999,
		"path": "../public/assets/route-flow-t_ksCOV8.js"
	},
	"/assets/signin-DRIBu0eG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18d2-ZM+33f1bjfIbJAck1XvQnIAiacE\"",
		"mtime": "2026-07-15T14:54:00.699Z",
		"size": 6354,
		"path": "../public/assets/signin-DRIBu0eG.js"
	},
	"/assets/routes-yEkalBLY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49b5-cW5rnRl8JmsaHSPVsVYXACWB9yQ\"",
		"mtime": "2026-07-15T14:54:00.694Z",
		"size": 18869,
		"path": "../public/assets/routes-yEkalBLY.js"
	},
	"/assets/styles-CT60j9E1.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"18371-O91iB1Pa5bfF1xUx0IlvSi7XzaY\"",
		"mtime": "2026-07-15T14:54:00.715Z",
		"size": 99185,
		"path": "../public/assets/styles-CT60j9E1.css"
	},
	"/assets/shield-check-DEJFJMG5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-dC7CnfNa4S0QwXImqW99Y+axLAE\"",
		"mtime": "2026-07-15T14:54:00.697Z",
		"size": 312,
		"path": "../public/assets/shield-check-DEJFJMG5.js"
	},
	"/assets/RoutePage-CjC0Em8C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"728d4-HIO+ehkru1tXTlRpPn/8QcTE0Ss\"",
		"mtime": "2026-07-15T14:54:00.642Z",
		"size": 469204,
		"path": "../public/assets/RoutePage-CjC0Em8C.js"
	},
	"/assets/index-CUSp_zW9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"51f17-3Vd4NcFOsdi8vNtyDQoYQ1WDQYs\"",
		"mtime": "2026-07-15T14:54:00.632Z",
		"size": 335639,
		"path": "../public/assets/index-CUSp_zW9.js"
	},
	"/assets/FactoryScene-GlblV14-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2147-GO2oxSFiqwqNgkRJmazjz/Zryy8\"",
		"mtime": "2026-07-15T14:54:00.637Z",
		"size": 926023,
		"path": "../public/assets/FactoryScene-GlblV14-.js"
	},
	"/assets/upstream-w4as3SuH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cea2-+ZSkM3cbY1ZhyExngsHYHlMH2r8\"",
		"mtime": "2026-07-15T14:54:00.705Z",
		"size": 52898,
		"path": "../public/assets/upstream-w4as3SuH.js"
	},
	"/assets/upstream-map-data-D5Bumvmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f6-6lcMFCmXRR3pEd8oHp5DMZdyi1M\"",
		"mtime": "2026-07-15T14:54:00.703Z",
		"size": 4342,
		"path": "../public/assets/upstream-map-data-D5Bumvmn.js"
	},
	"/assets/UpstreamNetworkMap-B2k4QVOw.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"110b0-ktCrTpfc4yMYyf4bIOXbtYXFctY\"",
		"mtime": "2026-07-15T14:54:00.710Z",
		"size": 69808,
		"path": "../public/assets/UpstreamNetworkMap-B2k4QVOw.css"
	},
	"/assets/with-selector-CFp_xsem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f3-hdcCzxRbP1mbtadIpj5TC18RT4o\"",
		"mtime": "2026-07-15T14:54:00.708Z",
		"size": 5107,
		"path": "../public/assets/with-selector-CFp_xsem.js"
	},
	"/data/cbam-code-lists.json": {
		"type": "application/json",
		"etag": "\"310fe-wI8Jx+iEdju1CM/FPE4uSKcxMyE\"",
		"mtime": "2026-07-15T14:45:04.878Z",
		"size": 200958,
		"path": "../public/data/cbam-code-lists.json"
	},
	"/assets/UpstreamNetworkMap-T97WiKbb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc645-FhBvbK++CwHBIeEwi8mK36N6vY4\"",
		"mtime": "2026-07-15T14:54:00.645Z",
		"size": 1033797,
		"path": "../public/assets/UpstreamNetworkMap-T97WiKbb.js"
	},
	"/templates/CBAM-communication-template.xlsx": {
		"type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"etag": "\"145935-f+qq0aFOhO4MzwnRfi3VNnImGmw\"",
		"mtime": "2026-07-14T13:57:11.073Z",
		"size": 1333557,
		"path": "../public/templates/CBAM-communication-template.xlsx"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_BJbTSX = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_BJbTSX
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
