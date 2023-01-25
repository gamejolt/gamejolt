export function objectEquals(a: object, b: object) {
	const aProps = Object.getOwnPropertyNames(a).filter(i => a.propertyIsEnumerable(i));
	const bProps = Object.getOwnPropertyNames(b).filter(i => b.propertyIsEnumerable(i));

	if (aProps.length !== bProps.length) {
		return false;
	}

	for (const propName of aProps) {
		if ((a as any)[propName] !== (b as any)[propName]) {
			return false;
		}
	}

	return true;
}

export function objectPick<T>(source: T, fields: (keyof T)[]) {
	const obj: any = {};
	for (const field of fields) {
		obj[field] = source[field];
	}

	return obj;
}

export function objectOmit<T>(source: T, excludedFields: (keyof T)[]) {
	const obj: any = {};
	for (const field in source) {
		if (excludedFields.includes(field)) {
			continue;
		}
		obj[field] = source[field];
	}

	return obj;
}
