'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.hooks = exports.errors = void 0;
const hooks_1 = require("./hooks");
const types_1 = require("./types");
exports.errors = __importStar(require("./errors"));
exports.hooks = {
    invokeHook: hooks_1.invokeHook,
    registerHook: hooks_1.registerHook,
    registerFlowChecker: hooks_1.registerFlowChecker,
};
exports.types = {
    define: types_1.define,
    lazy: types_1.lazy,
    lookup: types_1.lookup,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBpL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRWIsbUNBSWlCO0FBQ2pCLG1DQUlpQjtBQUVqQixtREFBbUM7QUFFdEIsUUFBQSxLQUFLLEdBQUc7SUFDcEIsVUFBVSxFQUFWLGtCQUFVO0lBQ1YsWUFBWSxFQUFaLG9CQUFZO0lBQ1osbUJBQW1CLEVBQW5CLDJCQUFtQjtDQUNuQixDQUFDO0FBRVcsUUFBQSxLQUFLLEdBQUc7SUFDcEIsTUFBTSxFQUFOLGNBQU07SUFDTixJQUFJLEVBQUosWUFBSTtJQUNKLE1BQU0sRUFBTixjQUFNO0NBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtcblx0aW52b2tlSG9vayxcblx0cmVnaXN0ZXJIb29rLFxuXHRyZWdpc3RlckZsb3dDaGVja2VyLFxufSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7XG5cdGRlZmluZSxcblx0bGF6eSxcblx0bG9va3VwLFxufSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0ICogYXMgZXJyb3JzIGZyb20gJy4vZXJyb3JzJztcblxuZXhwb3J0IGNvbnN0IGhvb2tzID0ge1xuXHRpbnZva2VIb29rLFxuXHRyZWdpc3Rlckhvb2ssXG5cdHJlZ2lzdGVyRmxvd0NoZWNrZXIsXG59O1xuXG5leHBvcnQgY29uc3QgdHlwZXMgPSB7XG5cdGRlZmluZSxcblx0bGF6eSxcblx0bG9va3VwLFxufTtcbiJdfQ==