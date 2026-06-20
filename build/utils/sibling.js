'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.sibling = void 0;
const Props_1 = require("../api/types/Props");
const sibling = (instance) => {
    const siblings = (SiblingTypeName) => {
        const props = (0, Props_1.getProps)(instance);
        const { __collection__: collection, } = props;
        const answer = collection[SiblingTypeName];
        return answer;
    };
    const result = new Proxy(siblings, {
        get(_, prop) {
            const proxyResult = siblings(prop);
            return proxyResult;
        },
        apply(_, __, args) {
            const proxyResult = siblings(args[0]);
            return proxyResult;
        }
    });
    return result;
};
exports.sibling = sibling;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2libGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zaWJsaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsOENBRzRCO0FBRXJCLE1BQU0sT0FBTyxHQUFHLENBQUMsUUFBZ0IsRUFBVyxFQUFFO0lBRXBELE1BQU0sUUFBUSxHQUFHLENBQUMsZUFBdUIsRUFBRSxFQUFFO1FBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVEsRUFBQyxRQUFRLENBQVUsQ0FBQztRQUMxQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUUsZUFBZSxDQUFFLENBQUM7UUFDN0MsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FDdkIsUUFBUSxFQUNSO1FBQ0MsR0FBRyxDQUFFLENBQUMsRUFBRSxJQUFZO1lBQ25CLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBQ0QsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSTtZQUNqQixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUM7WUFDeEMsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztLQUNELENBQ0QsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDO0FBRWYsQ0FBQyxDQUFDO0FBekJXLFFBQUEsT0FBTyxXQXlCbEIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7XG5cdGdldFByb3BzLFxuXHRQcm9wc1xufSBmcm9tICcuLi9hcGkvdHlwZXMvUHJvcHMnO1xuXG5leHBvcnQgY29uc3Qgc2libGluZyA9IChpbnN0YW5jZTogb2JqZWN0KTogdW5rbm93biA9PiB7XG5cblx0Y29uc3Qgc2libGluZ3MgPSAoU2libGluZ1R5cGVOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCBwcm9wcyA9IGdldFByb3BzKGluc3RhbmNlKSBhcyBQcm9wcztcblx0XHRjb25zdCB7IF9fY29sbGVjdGlvbl9fOiBjb2xsZWN0aW9uLCB9ID0gcHJvcHM7XG5cdFx0Y29uc3QgYW5zd2VyID0gY29sbGVjdGlvblsgU2libGluZ1R5cGVOYW1lIF07XG5cdFx0cmV0dXJuIGFuc3dlcjtcblx0fTtcblxuXHRjb25zdCByZXN1bHQgPSBuZXcgUHJveHkoXG5cdFx0c2libGluZ3MsXG5cdFx0e1xuXHRcdFx0Z2V0IChfLCBwcm9wOiBzdHJpbmcpIHtcblx0XHRcdFx0Y29uc3QgcHJveHlSZXN1bHQgPSBzaWJsaW5ncyhwcm9wKTtcblx0XHRcdFx0cmV0dXJuIHByb3h5UmVzdWx0O1xuXHRcdFx0fSxcblx0XHRcdGFwcGx5IChfLCBfXywgYXJncywpIHtcblx0XHRcdFx0Y29uc3QgcHJveHlSZXN1bHQgPSBzaWJsaW5ncyhhcmdzWyAwIF0pO1xuXHRcdFx0XHRyZXR1cm4gcHJveHlSZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXG5cdHJldHVybiByZXN1bHQ7XG5cbn07XG4iXX0=