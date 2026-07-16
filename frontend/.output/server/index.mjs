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
	"/assets/arrow-left-CyF7TfKb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-0z0DoDx/W82amhpxTOIkSUmOXyU\"",
		"mtime": "2026-07-16T10:16:23.222Z",
		"size": 154,
		"path": "../public/assets/arrow-left-CyF7TfKb.js"
	},
	"/greengrulogo.png": {
		"type": "image/png",
		"etag": "\"db97-+dhfNgMZivvY+cIESFOaeQYBgHo\"",
		"mtime": "2026-07-16T00:23:08.199Z",
		"size": 56215,
		"path": "../public/greengrulogo.png"
	},
	"/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png": {
		"type": "image/png",
		"etag": "\"2393-AZ8XDyRtFYL6UBwjdLCSlIkEgdA\"",
		"mtime": "2026-07-15T10:02:25.140Z",
		"size": 9107,
		"path": "../public/pngtree-green-earth-with-leaves-a-sustainable-icon-vector-png-image_15907492.png"
	},
	"/assets/AppShell-C1Zqtw1Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e33-K36caqaFgtE1HFQopgsrXa6wSTA\"",
		"mtime": "2026-07-16T10:16:23.212Z",
		"size": 85555,
		"path": "../public/assets/AppShell-C1Zqtw1Y.js"
	},
	"/assets/badge-check-D3n-lQUj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"131-h9uQL+aK7LdCT+UzJJ+mQtbzk6E\"",
		"mtime": "2026-07-16T10:16:23.226Z",
		"size": 305,
		"path": "../public/assets/badge-check-D3n-lQUj.js"
	},
	"/assets/arrow-right-9JfJLhir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-ixZ/kzdZKG8jfcMkeFr3GL3SMLI\"",
		"mtime": "2026-07-16T10:16:23.223Z",
		"size": 154,
		"path": "../public/assets/arrow-right-9JfJLhir.js"
	},
	"/assets/check-Da3By_Gj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-TAfN4dRyBLaeszrSMtYnCTE/CPg\"",
		"mtime": "2026-07-16T10:16:23.228Z",
		"size": 113,
		"path": "../public/assets/check-Da3By_Gj.js"
	},
	"/assets/chevron-right-QsGEZMXZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-zWtIMY36URkhjyp+Iz4Sc+r6YYA\"",
		"mtime": "2026-07-16T10:16:23.229Z",
		"size": 119,
		"path": "../public/assets/chevron-right-QsGEZMXZ.js"
	},
	"/assets/circle-alert-DKxPQIrE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef-KcIyjYhBRLlmRBYXgXydveKv8Cw\"",
		"mtime": "2026-07-16T10:16:23.230Z",
		"size": 239,
		"path": "../public/assets/circle-alert-DKxPQIrE.js"
	},
	"/assets/code-xml-DAxSmKs4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c5-zn6PSydlbW9/a1hnWMLTggeU1UI\"",
		"mtime": "2026-07-16T10:16:23.233Z",
		"size": 197,
		"path": "../public/assets/code-xml-DAxSmKs4.js"
	},
	"/assets/entry-BvNGJFEZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"21b1-05Qs3emkQ+dKNSwQPwhmzuEPTmo\"",
		"mtime": "2026-07-16T10:16:23.237Z",
		"size": 8625,
		"path": "../public/assets/entry-BvNGJFEZ.js"
	},
	"/assets/factory-CKCSItk_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18c-BwllfXiWIZwr+fyVWB2M86MYCtw\"",
		"mtime": "2026-07-16T10:16:23.239Z",
		"size": 396,
		"path": "../public/assets/factory-CKCSItk_.js"
	},
	"/assets/file-text-Ce1VHfk8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f3-tOAOiZV7/r9p/mT/E8YTwVMCjvA\"",
		"mtime": "2026-07-16T10:16:23.241Z",
		"size": 499,
		"path": "../public/assets/file-text-Ce1VHfk8.js"
	},
	"/assets/dashboard-data-DeAyGK_f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35af-8qs5gNobrKAv8FPjjdsgDxTm57E\"",
		"mtime": "2026-07-16T10:16:23.236Z",
		"size": 13743,
		"path": "../public/assets/dashboard-data-DeAyGK_f.js"
	},
	"/assets/grant-Cn5phek6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"98-ubCLo+GL5rDLfkRF5kdyhiXMzQA\"",
		"mtime": "2026-07-16T10:16:23.244Z",
		"size": 152,
		"path": "../public/assets/grant-Cn5phek6.js"
	},
	"/assets/full-api-documentation-COghAcaq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"585c-Phyj9e2NX3OaZWtAKH77wBDvKqo\"",
		"mtime": "2026-07-16T10:16:23.242Z",
		"size": 22620,
		"path": "../public/assets/full-api-documentation-COghAcaq.js"
	},
	"/assets/info-BjuHWF82.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10c-jKOGmSkEZ/983IU8wjOzXsh/N2g\"",
		"mtime": "2026-07-16T10:16:23.245Z",
		"size": 268,
		"path": "../public/assets/info-BjuHWF82.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-16T10:16:23.246Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/index-Da6HWJSg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"522cc-zZak4j7wzk8YPpa3ZUFrUX03bXY\"",
		"mtime": "2026-07-16T10:16:23.209Z",
		"size": 336588,
		"path": "../public/assets/index-Da6HWJSg.js"
	},
	"/assets/loan-qBe2f5Ie.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-+iu8v/SYQnBpdAL270HOxWkvlB8\"",
		"mtime": "2026-07-16T10:16:23.248Z",
		"size": 151,
		"path": "../public/assets/loan-qBe2f5Ie.js"
	},
	"/assets/new-BlpCXYrr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9c0d-R8ak1swvCJTFPnPFVvPwc2fBmTk\"",
		"mtime": "2026-07-16T10:16:23.253Z",
		"size": 39949,
		"path": "../public/assets/new-BlpCXYrr.js"
	},
	"/assets/passport-BT4eUE0d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9b-vYCrej2d+acVePUzKP34zeHfdhU\"",
		"mtime": "2026-07-16T10:16:23.254Z",
		"size": 155,
		"path": "../public/assets/passport-BT4eUE0d.js"
	},
	"/assets/lock-BFYpLf-t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-IAWFFwYuiI5NLWbAykgm8sjAuX4\"",
		"mtime": "2026-07-16T10:16:23.251Z",
		"size": 195,
		"path": "../public/assets/lock-BFYpLf-t.js"
	},
	"/assets/PieChart-5iXQ701D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5aa2e-kP0mWKiSA7XfN5R9mY5K7uaaF08\"",
		"mtime": "2026-07-16T10:16:23.217Z",
		"size": 371246,
		"path": "../public/assets/PieChart-5iXQ701D.js"
	},
	"/assets/FactoryScene-DtxtFFYY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e20e1-7yBmZYmmAanNo0LdzniPMcAw9gk\"",
		"mtime": "2026-07-16T10:16:23.215Z",
		"size": 925921,
		"path": "../public/assets/FactoryScene-DtxtFFYY.js"
	},
	"/assets/play-BM1PExMf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"195-RqZKmwhdK6diyqH0CCaTr/jQIMk\"",
		"mtime": "2026-07-16T10:16:23.255Z",
		"size": 405,
		"path": "../public/assets/play-BM1PExMf.js"
	},
	"/assets/react-BeWBAZAA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a1d-s5cSmQIPk8qdRy2S5NLX5GMrMRM\"",
		"mtime": "2026-07-16T10:16:23.257Z",
		"size": 150045,
		"path": "../public/assets/react-BeWBAZAA.js"
	},
	"/assets/rotate-ccw-Ds-6Mh5w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd-qJKy4N6hnZvg81XZQmyq2S+mCkc\"",
		"mtime": "2026-07-16T10:16:23.260Z",
		"size": 189,
		"path": "../public/assets/rotate-ccw-Ds-6Mh5w.js"
	},
	"/assets/route-flow-t_ksCOV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-l2ERrqUiXJ6/jdg5t9D7L92kcug\"",
		"mtime": "2026-07-16T10:16:23.262Z",
		"size": 999,
		"path": "../public/assets/route-flow-t_ksCOV8.js"
	},
	"/assets/routes-u4W2QuVG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4949-yBRHfoh5hIYror5+5a44oOaTjiI\"",
		"mtime": "2026-07-16T10:16:23.263Z",
		"size": 18761,
		"path": "../public/assets/routes-u4W2QuVG.js"
	},
	"/assets/shield-check-Dz3Tuvgq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-3a1T/lsutY77YuewjnJ0X8YKEZk\"",
		"mtime": "2026-07-16T10:16:23.265Z",
		"size": 309,
		"path": "../public/assets/shield-check-Dz3Tuvgq.js"
	},
	"/assets/signin-1-X3gugB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1975-vT5OE2g+59HwQfVmrr1+uSBVkWU\"",
		"mtime": "2026-07-16T10:16:23.267Z",
		"size": 6517,
		"path": "../public/assets/signin-1-X3gugB.js"
	},
	"/assets/styles-tVx5980h.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1aa35-I/CPI+AWvVxFIDWW9sXUUoc1O1U\"",
		"mtime": "2026-07-16T10:16:23.282Z",
		"size": 109109,
		"path": "../public/assets/styles-tVx5980h.css"
	},
	"/assets/triangle-alert-lgprVfJ7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-KEAljaXrz4Xhww20qwOMHZjQ8C8\"",
		"mtime": "2026-07-16T10:16:23.269Z",
		"size": 254,
		"path": "../public/assets/triangle-alert-lgprVfJ7.js"
	},
	"/assets/upstream-map-data-D5Bumvmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f6-6lcMFCmXRR3pEd8oHp5DMZdyi1M\"",
		"mtime": "2026-07-16T10:16:23.273Z",
		"size": 4342,
		"path": "../public/assets/upstream-map-data-D5Bumvmn.js"
	},
	"/assets/upstream-QJQ5dbtc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf9d-biSg+h7zhsJ/B1C8j1bHPj21g+4\"",
		"mtime": "2026-07-16T10:16:23.270Z",
		"size": 53149,
		"path": "../public/assets/upstream-QJQ5dbtc.js"
	},
	"/assets/UpstreamNetworkMap-B2k4QVOw.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"110b0-ktCrTpfc4yMYyf4bIOXbtYXFctY\"",
		"mtime": "2026-07-16T10:16:23.279Z",
		"size": 69808,
		"path": "../public/assets/UpstreamNetworkMap-B2k4QVOw.css"
	},
	"/assets/useDashboardSnapshot-CdjHDRRK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2f6-fO6/FozOI5GzkIEwiNH13QMLDYk\"",
		"mtime": "2026-07-16T10:16:23.274Z",
		"size": 758,
		"path": "../public/assets/useDashboardSnapshot-CdjHDRRK.js"
	},
	"/assets/with-selector-CFp_xsem.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f3-hdcCzxRbP1mbtadIpj5TC18RT4o\"",
		"mtime": "2026-07-16T10:16:23.277Z",
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
	"/assets/RoutePage-Cqu64jIZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82936-rtpmeLnRqzceV9yzllLYt/z+b5Y\"",
		"mtime": "2026-07-16T10:16:23.219Z",
		"size": 534838,
		"path": "../public/assets/RoutePage-Cqu64jIZ.js"
	},
	"/assets/UpstreamNetworkMap-C53-yWBw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc602-5vQeaSboLa0MDZtHFjtX8Z6fnqY\"",
		"mtime": "2026-07-16T10:16:23.221Z",
		"size": 1033730,
		"path": "../public/assets/UpstreamNetworkMap-C53-yWBw.js"
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
