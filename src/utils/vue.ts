import Vue, { PropOptions, PropType } from 'vue';

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

export function propRequired<T>(type?: PropType<T>) {
	return {
		type,
		required: true,
	} as PropOptions<T>;
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
	type: PropType<T> | undefined,
	defaultValue: DefaultValue<T> | null | undefined | (() => T | null | undefined) = undefined
) {
	return {
		type,
		required: false,
		default: defaultValue,
	} as PropOptions<T>;
}

declare module 'vue/types/options' {
	interface ComponentOptions<V extends Vue> {
		gjIsRoot?: boolean;
	}
}

type VuePluginLifecycleHook<T> = (this: T, vm: Vue) => void;

export function installVuePlugin<T>(
	key: string,
	constructor: Constructor<T>,
	pluginOptions?: {
		beforeCreate?: VuePluginLifecycleHook<T>;
		created?: VuePluginLifecycleHook<T>;
		beforeMount?: VuePluginLifecycleHook<T>;
		mounted?: VuePluginLifecycleHook<T>;
	}
) {
	Vue.mixin({
		// For debugging purposes in development.
		data(this: Vue) {
			if (GJ_BUILD_TYPE === 'development' && this.$options.gjIsRoot) {
				const self = this as any;
				return {
					[key]: self[key],
				};
			}
			return {};
		},
		beforeCreate() {
			const self = this as any;
			const parent = this.$options.parent as Record<string, any> | undefined;

			// Somehow already installed?
			if (self[key]) {
				return;
			}

			// We pass the service down from the main parent component into
			// every child. For the intial service object, we have to make sure
			// to make it observable so that vue can track it within its
			// dependency system.
			if (this.$options.gjIsRoot) {
				self[key] = Vue.observable(new constructor());
				runHook(this, pluginOptions?.beforeCreate);
			} else if (parent?.[key]) {
				self[key] = parent[key];
			}
		},
		// For some reason Vue doesn't have "this" typed for these...
		created(this: Vue) {
			runHook(this, pluginOptions?.created);
		},
		beforeMount(this: Vue) {
			runHook(this, pluginOptions?.beforeMount);
		},
		mounted(this: Vue) {
			runHook(this, pluginOptions?.mounted);
		},
	});

	function runHook(instance: Vue, cb?: VuePluginLifecycleHook<T>) {
		// We only run hooks in the root component of the hierarchy.
		if (!instance.$options.gjIsRoot || !cb) {
			return;
		}

		cb.call((instance as any)[key], instance);
	}
}
