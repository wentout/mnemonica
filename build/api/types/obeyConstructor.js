'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.obey = void 0;
const constants_1 = require("../../constants");
const { SymbolUsed } = constants_1.constants;
const errors_1 = require("../../descriptors/errors");
const { PROTOTYPE_USED_TWICE, } = errors_1.ErrorsTypes;
const obey = (existentInstance, ModificatorType) => {
    let protoConstructor = ModificatorType;
    while (protoConstructor instanceof Function) {
        if (Object.prototype.hasOwnProperty.call(protoConstructor, SymbolUsed) && protoConstructor[SymbolUsed]) {
            const error = new PROTOTYPE_USED_TWICE(`${protoConstructor.name}.prototype > ${ModificatorType.name}`);
            throw error;
        }
        const sample = Reflect.getPrototypeOf(protoConstructor);
        if (sample instanceof Function) {
            protoConstructor = sample;
        }
        else {
            Object.defineProperty(protoConstructor, SymbolUsed, {
                get() {
                    return true;
                }
            });
            break;
        }
    }
    Reflect.setPrototypeOf(protoConstructor, existentInstance.constructor);
};
exports.obey = obey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JleUNvbnN0cnVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaS90eXBlcy9vYmV5Q29uc3RydWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYiwrQ0FBNEM7QUFDNUMsTUFBTSxFQUNMLFVBQVUsRUFDVixHQUFHLHFCQUFTLENBQUM7QUFFZCxxREFBdUQ7QUFDdkQsTUFBTSxFQUNMLG9CQUFvQixHQUNwQixHQUFHLG9CQUFXLENBQUM7QUFFVCxNQUFNLElBQUksR0FBRyxDQUFFLGdCQUFxQixFQUFFLGVBQW9CLEVBQUcsRUFBRTtJQUNyRSxJQUFJLGdCQUFnQixHQUFRLGVBQWUsQ0FBQztJQUM1QyxPQUFRLGdCQUFnQixZQUFZLFFBQVEsRUFBRyxDQUFDO1FBQy9DLElBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFFLGdCQUFnQixFQUFFLFVBQVUsQ0FBRSxJQUFJLGdCQUFnQixDQUFFLFVBQVUsQ0FBRSxFQUFFLENBQUM7WUFDN0csTUFBTSxLQUFLLEdBQUcsSUFBSSxvQkFBb0IsQ0FBRSxHQUFHLGdCQUFnQixDQUFDLElBQUksZ0JBQWdCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBRSxDQUFDO1lBQ3pHLE1BQU0sS0FBSyxDQUFDO1FBQ2IsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztRQUMxRCxJQUFLLE1BQU0sWUFBWSxRQUFRLEVBQUcsQ0FBQztZQUNsQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7UUFDM0IsQ0FBQzthQUFNLENBQUM7WUFDUCxNQUFNLENBQUMsY0FBYyxDQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRTtnQkFDcEQsR0FBRztvQkFDRixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2FBQ0QsQ0FBRSxDQUFDO1lBQ0osTUFBTTtRQUNQLENBQUM7SUFDRixDQUFDO0lBQ0QsT0FBTyxDQUFDLGNBQWMsQ0FBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUUsQ0FBQztBQUMxRSxDQUFDLENBQUM7QUFwQlcsUUFBQSxJQUFJLFFBb0JmIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnO1xuY29uc3Qge1xuXHRTeW1ib2xVc2VkXG59ID0gY29uc3RhbnRzO1xuXG5pbXBvcnQgeyBFcnJvcnNUeXBlcyB9IGZyb20gJy4uLy4uL2Rlc2NyaXB0b3JzL2Vycm9ycyc7XG5jb25zdCB7XG5cdFBST1RPVFlQRV9VU0VEX1RXSUNFLFxufSA9IEVycm9yc1R5cGVzO1xuXG5leHBvcnQgY29uc3Qgb2JleSA9ICggZXhpc3RlbnRJbnN0YW5jZTogYW55LCBNb2RpZmljYXRvclR5cGU6IGFueSApID0+IHtcblx0bGV0IHByb3RvQ29uc3RydWN0b3I6IGFueSA9IE1vZGlmaWNhdG9yVHlwZTtcblx0d2hpbGUgKCBwcm90b0NvbnN0cnVjdG9yIGluc3RhbmNlb2YgRnVuY3Rpb24gKSB7XG5cdFx0aWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIHByb3RvQ29uc3RydWN0b3IsIFN5bWJvbFVzZWQgKSAmJiBwcm90b0NvbnN0cnVjdG9yWyBTeW1ib2xVc2VkIF0pIHtcblx0XHRcdGNvbnN0IGVycm9yID0gbmV3IFBST1RPVFlQRV9VU0VEX1RXSUNFKCBgJHtwcm90b0NvbnN0cnVjdG9yLm5hbWV9LnByb3RvdHlwZSA+ICR7TW9kaWZpY2F0b3JUeXBlLm5hbWV9YCApO1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fVxuXHRcdGNvbnN0IHNhbXBsZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YoIHByb3RvQ29uc3RydWN0b3IgKTtcblx0XHRpZiAoIHNhbXBsZSBpbnN0YW5jZW9mIEZ1bmN0aW9uICkge1xuXHRcdFx0cHJvdG9Db25zdHJ1Y3RvciA9IHNhbXBsZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBwcm90b0NvbnN0cnVjdG9yLCBTeW1ib2xVc2VkLCB7XG5cdFx0XHRcdGdldCAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRSZWZsZWN0LnNldFByb3RvdHlwZU9mKCBwcm90b0NvbnN0cnVjdG9yLCBleGlzdGVudEluc3RhbmNlLmNvbnN0cnVjdG9yICk7XG59O1xuIl19