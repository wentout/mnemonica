'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fork = void 0;
const Props_1 = require("../api/types/Props");
const InstanceCreator_1 = require("../api/types/InstanceCreator");
const index_1 = __importDefault(require("../api/utils/index"));
const { reflectPrimitiveWrappers } = index_1.default;
const fork = (instance) => {
    const props = (0, Props_1.getProps)(instance);
    const { __type__: type, __collection__: collection, __parent__: existentInstance, __args__, __self__, } = props;
    const { isSubType, TypeName } = type;
    const result = function (...forkArgs) {
        let forked;
        const Constructor = isSubType ?
            existentInstance :
            collection;
        const args = forkArgs.length ? forkArgs : __args__;
        if (this === __self__) {
            forked = new (Constructor[TypeName])(...args);
        }
        else {
            forked = new InstanceCreator_1.InstanceCreator(type, reflectPrimitiveWrappers(this), args);
        }
        return forked;
    };
    return result;
};
exports.fork = fork;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9mb3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsOENBRTRCO0FBQzVCLGtFQUErRDtBQUMvRCwrREFBNEM7QUFFNUMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsZUFBVSxDQUFDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO0lBRXhDLE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVEsRUFBQyxRQUFRLENBQVUsQ0FBQztJQUUxQyxNQUFNLEVBQ0wsUUFBUSxFQUFFLElBQUksRUFDZCxjQUFjLEVBQUUsVUFBVSxFQUMxQixVQUFVLEVBQUUsZ0JBQWdCLEVBQzVCLFFBQVEsRUFDUixRQUFRLEdBQ1IsR0FBRyxLQUFLLENBQUM7SUFFVixNQUFNLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixHQUFHLElBQUksQ0FBQztJQUVULE1BQU0sTUFBTSxHQUFHLFVBQXdCLEdBQUcsUUFBbUI7UUFFNUQsSUFBSSxNQUFNLENBQUM7UUFDWCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUM5QixnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xCLFVBQVUsQ0FBQztRQUVaLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBR25ELElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBR3ZCLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFFLFFBQVEsQ0FBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO2FBQU0sQ0FBQztZQUVQLE1BQU0sR0FBRyxJQUFJLGlDQUFlLENBQzNCLElBQUksRUFDSix3QkFBd0IsQ0FBQyxJQUFJLENBQUMsRUFDOUIsSUFBSSxDQUNKLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFFZixDQUFDLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQTdDVyxRQUFBLElBQUksUUE2Q2YiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7XG5cdGdldFByb3BzLCBQcm9wcyBcbn0gZnJvbSAnLi4vYXBpL3R5cGVzL1Byb3BzJztcbmltcG9ydCB7IEluc3RhbmNlQ3JlYXRvciB9IGZyb20gJy4uL2FwaS90eXBlcy9JbnN0YW5jZUNyZWF0b3InO1xuaW1wb3J0IFR5cGVzVXRpbHMgZnJvbSAnLi4vYXBpL3V0aWxzL2luZGV4JztcblxuY29uc3QgeyByZWZsZWN0UHJpbWl0aXZlV3JhcHBlcnMgfSA9IFR5cGVzVXRpbHM7XG5cbmV4cG9ydCBjb25zdCBmb3JrID0gKGluc3RhbmNlOiBvYmplY3QpID0+IHtcblxuXHRjb25zdCBwcm9wcyA9IGdldFByb3BzKGluc3RhbmNlKSBhcyBQcm9wcztcblxuXHRjb25zdCB7XG5cdFx0X190eXBlX186IHR5cGUsXG5cdFx0X19jb2xsZWN0aW9uX186IGNvbGxlY3Rpb24sXG5cdFx0X19wYXJlbnRfXzogZXhpc3RlbnRJbnN0YW5jZSxcblx0XHRfX2FyZ3NfXyxcblx0XHRfX3NlbGZfXyxcblx0fSA9IHByb3BzO1xuXG5cdGNvbnN0IHtcblx0XHRpc1N1YlR5cGUsXG5cdFx0VHlwZU5hbWVcblx0fSA9IHR5cGU7XG5cblx0Y29uc3QgcmVzdWx0ID0gZnVuY3Rpb24gKHRoaXM6IG9iamVjdCwgLi4uZm9ya0FyZ3M6IHVua25vd25bXSkge1xuXG5cdFx0bGV0IGZvcmtlZDtcblx0XHRjb25zdCBDb25zdHJ1Y3RvciA9IGlzU3ViVHlwZSA/XG5cdFx0XHRleGlzdGVudEluc3RhbmNlIDpcblx0XHRcdGNvbGxlY3Rpb247XG5cblx0XHRjb25zdCBhcmdzID0gZm9ya0FyZ3MubGVuZ3RoID8gZm9ya0FyZ3MgOiBfX2FyZ3NfXztcblxuXG5cdFx0aWYgKHRoaXMgPT09IF9fc2VsZl9fKSB7XG5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3IgIHRoaXMgaXMgZGVmaW5pdGVseSBhIGNvbnN0cnVjdG9yXG5cdFx0XHRmb3JrZWQgPSBuZXcgKENvbnN0cnVjdG9yWyBUeXBlTmFtZSBdKSguLi5hcmdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9yay5jYWxsID8gbGV0J3MgZG8gaXQgIVxuXHRcdFx0Zm9ya2VkID0gbmV3IEluc3RhbmNlQ3JlYXRvcihcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0cmVmbGVjdFByaW1pdGl2ZVdyYXBwZXJzKHRoaXMpLFxuXHRcdFx0XHRhcmdzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3JrZWQ7XG5cblx0fTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcbiJdfQ==