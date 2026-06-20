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
        const forkResult = forked;
        return forkResult;
    };
    return result;
};
exports.fork = fork;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9mb3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsOENBRTRCO0FBQzVCLGtFQUErRDtBQUMvRCwrREFBNEM7QUFFNUMsTUFBTSxFQUFFLHdCQUF3QixFQUFFLEdBQUcsZUFBVSxDQUFDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLENBQW1CLFFBQVcsRUFBK0MsRUFBRTtJQUVsRyxNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFRLEVBQUMsUUFBUSxDQUFVLENBQUM7SUFFMUMsTUFBTSxFQUNMLFFBQVEsRUFBRSxJQUFJLEVBQ2QsY0FBYyxFQUFFLFVBQVUsRUFDMUIsVUFBVSxFQUFFLGdCQUFnQixFQUM1QixRQUFRLEVBQ1IsUUFBUSxHQUNSLEdBQUcsS0FBSyxDQUFDO0lBRVYsTUFBTSxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsR0FBRyxJQUFJLENBQUM7SUFFVCxNQUFNLE1BQU0sR0FBRyxVQUF3QixHQUFHLFFBQW1CO1FBRTVELElBQUksTUFBTSxDQUFDO1FBQ1gsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDOUIsZ0JBQWdCLENBQUMsQ0FBQztZQUNsQixVQUFVLENBQUM7UUFFWixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUduRCxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUd2QixNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxRQUFRLENBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakQsQ0FBQzthQUFNLENBQUM7WUFFUCxNQUFNLEdBQUcsSUFBSSxpQ0FBZSxDQUMzQixJQUFJLEVBQ0osd0JBQXdCLENBQUMsSUFBSSxDQUFDLEVBQzlCLElBQUksQ0FDSixDQUFDO1FBQ0gsQ0FBQztRQUVELE1BQU0sVUFBVSxHQUFHLE1BQVcsQ0FBQztRQUMvQixPQUFPLFVBQVUsQ0FBQztJQUVuQixDQUFDLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUVmLENBQUMsQ0FBQztBQTlDVyxRQUFBLElBQUksUUE4Q2YiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7XG5cdGdldFByb3BzLCBQcm9wcyBcbn0gZnJvbSAnLi4vYXBpL3R5cGVzL1Byb3BzJztcbmltcG9ydCB7IEluc3RhbmNlQ3JlYXRvciB9IGZyb20gJy4uL2FwaS90eXBlcy9JbnN0YW5jZUNyZWF0b3InO1xuaW1wb3J0IFR5cGVzVXRpbHMgZnJvbSAnLi4vYXBpL3V0aWxzL2luZGV4JztcblxuY29uc3QgeyByZWZsZWN0UHJpbWl0aXZlV3JhcHBlcnMgfSA9IFR5cGVzVXRpbHM7XG5cbmV4cG9ydCBjb25zdCBmb3JrID0gPFQgZXh0ZW5kcyBvYmplY3Q+KGluc3RhbmNlOiBUKTogKHRoaXM6IG9iamVjdCwgLi4uZm9ya0FyZ3M6IHVua25vd25bXSkgPT4gVCA9PiB7XG5cblx0Y29uc3QgcHJvcHMgPSBnZXRQcm9wcyhpbnN0YW5jZSkgYXMgUHJvcHM7XG5cblx0Y29uc3Qge1xuXHRcdF9fdHlwZV9fOiB0eXBlLFxuXHRcdF9fY29sbGVjdGlvbl9fOiBjb2xsZWN0aW9uLFxuXHRcdF9fcGFyZW50X186IGV4aXN0ZW50SW5zdGFuY2UsXG5cdFx0X19hcmdzX18sXG5cdFx0X19zZWxmX18sXG5cdH0gPSBwcm9wcztcblxuXHRjb25zdCB7XG5cdFx0aXNTdWJUeXBlLFxuXHRcdFR5cGVOYW1lXG5cdH0gPSB0eXBlO1xuXG5cdGNvbnN0IHJlc3VsdCA9IGZ1bmN0aW9uICh0aGlzOiBvYmplY3QsIC4uLmZvcmtBcmdzOiB1bmtub3duW10pIHtcblxuXHRcdGxldCBmb3JrZWQ7XG5cdFx0Y29uc3QgQ29uc3RydWN0b3IgPSBpc1N1YlR5cGUgP1xuXHRcdFx0ZXhpc3RlbnRJbnN0YW5jZSA6XG5cdFx0XHRjb2xsZWN0aW9uO1xuXG5cdFx0Y29uc3QgYXJncyA9IGZvcmtBcmdzLmxlbmd0aCA/IGZvcmtBcmdzIDogX19hcmdzX187XG5cblxuXHRcdGlmICh0aGlzID09PSBfX3NlbGZfXykge1xuXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yICB0aGlzIGlzIGRlZmluaXRlbHkgYSBjb25zdHJ1Y3RvclxuXHRcdFx0Zm9ya2VkID0gbmV3IChDb25zdHJ1Y3RvclsgVHlwZU5hbWUgXSkoLi4uYXJncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZvcmsuY2FsbCA/IGxldCdzIGRvIGl0ICFcblx0XHRcdGZvcmtlZCA9IG5ldyBJbnN0YW5jZUNyZWF0b3IoXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdHJlZmxlY3RQcmltaXRpdmVXcmFwcGVycyh0aGlzKSxcblx0XHRcdFx0YXJnc1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjb25zdCBmb3JrUmVzdWx0ID0gZm9ya2VkIGFzIFQ7XG5cdFx0cmV0dXJuIGZvcmtSZXN1bHQ7XG5cblx0fTtcblx0cmV0dXJuIHJlc3VsdDtcblxufTtcbiJdfQ==