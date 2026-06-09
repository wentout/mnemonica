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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9mb3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsOENBQXFEO0FBQ3JELGtFQUErRDtBQUMvRCwrREFBNEM7QUFFNUMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsZUFBVSxDQUFDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBZ0IsRUFBRSxFQUFFO0lBRXhDLE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVEsRUFBQyxRQUFRLENBQVUsQ0FBQztJQUUxQyxNQUFNLEVBQ0wsUUFBUSxFQUFFLElBQUksRUFDZCxjQUFjLEVBQUUsVUFBVSxFQUMxQixVQUFVLEVBQUUsZ0JBQWdCLEVBQzVCLFFBQVEsRUFDUixRQUFRLEdBQ1IsR0FBRyxLQUFLLENBQUM7SUFFVixNQUFNLEVBQ0wsU0FBUyxFQUNULFFBQVEsRUFDUixHQUFHLElBQUksQ0FBQztJQUVULE1BQU0sTUFBTSxHQUFHLFVBQXdCLEdBQUcsUUFBbUI7UUFFNUQsSUFBSSxNQUFNLENBQUM7UUFDWCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUM5QixnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xCLFVBQVUsQ0FBQztRQUVaLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBR25ELElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBR3ZCLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFFLFFBQVEsQ0FBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO2FBQU0sQ0FBQztZQUVQLE1BQU0sR0FBRyxJQUFJLGlDQUFlLENBQzNCLElBQUksRUFDSix3QkFBd0IsQ0FBQyxJQUFJLENBQUMsRUFDOUIsSUFBSSxDQUNKLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFFZixDQUFDLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQTdDVyxRQUFBLElBQUksUUE2Q2YiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IGdldFByb3BzLCBQcm9wcyB9IGZyb20gJy4uL2FwaS90eXBlcy9Qcm9wcyc7XG5pbXBvcnQgeyBJbnN0YW5jZUNyZWF0b3IgfSBmcm9tICcuLi9hcGkvdHlwZXMvSW5zdGFuY2VDcmVhdG9yJztcbmltcG9ydCBUeXBlc1V0aWxzIGZyb20gJy4uL2FwaS91dGlscy9pbmRleCc7XG5cbmNvbnN0IHsgcmVmbGVjdFByaW1pdGl2ZVdyYXBwZXJzIH0gPSBUeXBlc1V0aWxzO1xuXG5leHBvcnQgY29uc3QgZm9yayA9IChpbnN0YW5jZTogb2JqZWN0KSA9PiB7XG5cblx0Y29uc3QgcHJvcHMgPSBnZXRQcm9wcyhpbnN0YW5jZSkgYXMgUHJvcHM7XG5cblx0Y29uc3Qge1xuXHRcdF9fdHlwZV9fOiB0eXBlLFxuXHRcdF9fY29sbGVjdGlvbl9fOiBjb2xsZWN0aW9uLFxuXHRcdF9fcGFyZW50X186IGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0X19hcmdzX18sXG5cdFx0X19zZWxmX18sXG5cdH0gPSBwcm9wcztcblxuXHRjb25zdCB7XG5cdFx0aXNTdWJUeXBlLFxuXHRcdFR5cGVOYW1lXG5cdH0gPSB0eXBlO1xuXG5cdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uICh0aGlzOiBvYmplY3QsIC4uLmZvcmtBcmdzOiB1bmtub3duW10pIHtcblxuXHRcdGxldCBmb3JrZWQ7XG5cdFx0Y29uc3QgQ29uc3RydWN0b3IgPSBpc1N1YlR5cGUgP1xuXHRcdFx0ZXhpc3RlbnRJbnN0YW5jZSA6XG5cdFx0XHRjb2xsZWN0aW9uO1xuXG5cdFx0Y29uc3QgYXJncyA9IGZvcmtBcmdzLmxlbmd0aCA/IGZvcmtBcmdzIDogX19hcmdzX187XG5cblxuXHRcdGlmICh0aGlzID09PSBfX3NlbGZfXykge1xuXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yICB0aGlzIGlzIGRlZmluaXRlbHkgYSBjb25zdHJ1Y3RvclxuXHRcdFx0Zm9ya2VkID0gbmV3IChDb25zdHJ1Y3RvclsgVHlwZU5hbWUgXSkoLi4uYXJncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZvcmsuY2FsbCA/IGxldCdzIGRvIGl0ICFcblx0XHRcdGZvcmtlZCA9IG5ldyBJbnN0YW5jZUNyZWF0b3IoXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdHJlZmxlY3RQcmltaXRpdmVXcmFwcGVycyh0aGlzKSxcblx0XHRcdFx0YXJnc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZm9ya2VkO1xuXG5cdH07XG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG4iXX0=