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
	"/.DS_Store": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1804-2DcOGx4CXKiuh2nrvcFELzGxdfY\"",
		"mtime": "2026-07-15T08:55:37.551Z",
		"size": 6148,
		"path": "../public/.DS_Store"
	},
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-15T08:55:37.551Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/assets/AppShell-3bqJoHPc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26a7a-Ii5vnpRfIueJi9vXvgtPAPvo75E\"",
		"mtime": "2026-07-15T08:55:37.403Z",
		"size": 158330,
		"path": "../public/assets/AppShell-3bqJoHPc.js"
	},
	"/assets/RoutePage-BQ13lG71.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"294f-ROcaezQGgTnCMGpMGz1mUkQB/4M\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 10575,
		"path": "../public/assets/RoutePage-BQ13lG71.js"
	},
	"/assets/circle-check-DlZcSxW-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-4a3XLWl3mY7SeK3dvkesGuQ//04\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 170,
		"path": "../public/assets/circle-check-DlZcSxW-.js"
	},
	"/assets/circle-alert-CCO3d4m0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2-9I22DU2i3eUxJz/v1crvaQEGee4\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 242,
		"path": "../public/assets/circle-alert-CCO3d4m0.js"
	},
	"/assets/entry-ByCF38Iy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df5-bduQ+GRP9Hz+E4/IIHmmTIA2bzg\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 7669,
		"path": "../public/assets/entry-ByCF38Iy.js"
	},
	"/assets/dashboard-data-B7xCDVh1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30df-NG5/UHbXngAet3KbSKsX4L/Iz/M\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 12511,
		"path": "../public/assets/dashboard-data-B7xCDVh1.js"
	},
	"/assets/file-text-DXbEu5JV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"179-5Mi/2F/2YSmtZgiDJwErUmQKmcY\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 377,
		"path": "../public/assets/file-text-DXbEu5JV.js"
	},
	"/assets/grant-BI32xtc8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"92-qGAn8/vr4IwNkuAeXSto9g8Vazk\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 146,
		"path": "../public/assets/grant-BI32xtc8.js"
	},
	"/assets/loan-BwlC09SP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"91-UX8+5M+zxNqh5tj1myk8MSvi52Y\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 145,
		"path": "../public/assets/loan-BwlC09SP.js"
	},
	"/assets/info-Dqb9Na8w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10b-V79u8jxusgP8sSiSd6mXMNqMqCI\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 267,
		"path": "../public/assets/info-Dqb9Na8w.js"
	},
	"/assets/index-CmGUAp_6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54f02-F5d8RO9ThTIYP4UVQ1GXwv9XH4k\"",
		"mtime": "2026-07-15T08:55:37.403Z",
		"size": 347906,
		"path": "../public/assets/index-CmGUAp_6.js"
	},
	"/assets/new-BOrKSO2V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4e71-MC07x9jRgTS1ECu2+V5djHv+Vps\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 20081,
		"path": "../public/assets/new-BOrKSO2V.js"
	},
	"/assets/passport-DAEfs9Nc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"95-v+vcL9v14r/0mrkZqy9W1ORwQk4\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 149,
		"path": "../public/assets/passport-DAEfs9Nc.js"
	},
	"/assets/shield-check-9GMzT41s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"138-eyIvO8DeRfdQ6HRtt0qNS36+YwM\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 312,
		"path": "../public/assets/shield-check-9GMzT41s.js"
	},
	"/assets/signin-Cnewqx8c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"187f-d8nITy25uWaM6ney2XYEbj3uvfM\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 6271,
		"path": "../public/assets/signin-Cnewqx8c.js"
	},
	"/assets/styles-BTmu1wQf.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"16bc2-NE2AeKkOJ/Thi1sZcLGFsZS+urc\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 93122,
		"path": "../public/assets/styles-BTmu1wQf.css"
	},
	"/assets/routes-551pMfWu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b257-BhtCRDbragPAz6t/0ido+SIKgAE\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 373335,
		"path": "../public/assets/routes-551pMfWu.js"
	},
	"/assets/ship-Bdbl2GCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2de-UVengtgTL9Sug3ZLs9wuREzJI6c\"",
		"mtime": "2026-07-15T08:55:37.404Z",
		"size": 734,
		"path": "../public/assets/ship-Bdbl2GCG.js"
	},
	"/assets/FactoryScene-By2WGgTY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e20f7-AcFj3OfcTI0mRh2bGo4iKx9NrjY\"",
		"mtime": "2026-07-15T08:55:37.403Z",
		"size": 925943,
		"path": "../public/assets/FactoryScene-By2WGgTY.js"
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
var _lazy_2cxnyN = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_2cxnyN
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
