'use strict';

export const hop = (o: object, p: string|symbol) => Object.prototype.hasOwnProperty.call(o, p);
