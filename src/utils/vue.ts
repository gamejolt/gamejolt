import Vue, { PropType } from 'vue';

type Constructor<T> = { new (): T };

export function findVueParent<T extends Vue>(component: Vue, parentType: Constructor<T>) {
	let parent = component.$parent;
	while (parent) {
		if (parent instanceof parentType) {
			return parent as T;
		}
		parent = parent.$parent;
	}

	return undefined;
}

export function findRequiredVueParent<T extends Vue>(component: Vue, parentType: Constructor<T>) {
	const parent = findVueParent(component, parentType);
	if (!parent) {
		throw new Error(
			`Couldn't find parent component (${parentType.name}) from child component (${component.$options.name}).`
		);
	}

	return parent;
}

export function makeObservableService<T>(service: T): T {
	// We have to loop through all properties of the service and make them reactive.
	// We should only do it once.
	if (service && !(service as any).__gjObservable__) {
		for (const k in service) {
			(Vue as any).util.defineReactive(service, k, service[k]);
		}
		(service as any).__gjObservable__ = true;
	}

	return service;
}

export function propRequired<T>(type: PropType<T>) {
	return {
		type,
		required: true,
	};
}

// We do this so that you get a type error if you try to assign any non-scalar
// value as default. Vue requires you to make a function that returns the
// non-scalar value so that a new instance is returned.
type DefaultValue<T> = T extends boolean
	? boolean
	: T extends number
	? number
	: T extends string
	? string
	: never;

export function propOptional<T>(
	type: PropType<T>,
	defaultValue: DefaultValue<T> | null | undefined | (() => T | null | undefined) = undefined
) {
	return {
		type,
		required: false,
		default: defaultValue,
	};
}
