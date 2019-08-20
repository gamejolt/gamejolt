import Vue from 'vue';

export function findVueParent<T extends Vue>(component: Vue, parentType: { new (): T }) {
	let parent = component.$parent;
	while (parent) {
		if (parent instanceof parentType) {
			return parent as T;
		}
		parent = parent.$parent;
	}

	return undefined;
}

export function findRequiredVueParent<T extends Vue>(component: Vue, parentType: { new (): T }) {
	const parent = findVueParent(component, parentType);
	if (!parent) {
		throw new Error(
			`Couldn't find parent component (${parentType.name}) from child component (${component
				.$options.name}).`
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
