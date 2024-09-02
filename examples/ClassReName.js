const name = 'ClassName';

const pointer = class {
	constructor () {
		this.name = this.constructor.name;
	}
};

console.log( ( new pointer ).name );


const reNamer = {};

reNamer[ name ] = pointer;
Object.defineProperty( reNamer[ name ].prototype.constructor, 'name', {
	get () {
		return name;
	}
} );

console.log( ( new reNamer[ name ] ).name );

console.log( ( new pointer ).name );
