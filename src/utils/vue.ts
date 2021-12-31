import { ComponentPublicInstance, PropType, Ref } from 'vue';
import { PropOptions } from 'vue-class-component';

export type MaybeRef<T> = Ref<T> | T;

type Constructor<T> = { new (): T };

/**
 * @deprecated This no longer works with Vue 3.
 */
export function findVueParent<T extends ComponentPublicInstance>(
	component: ComponentPublicInstance,
	parentType: Constructor<T>
) {
	let parent = component.$parent;
	while (parent) {
		if (parent instanceof parentType) {
			return parent as T;
		}
		parent = parent.$parent;
	}

	return undefined;
}

/**
 * @deprecated This no longer works with Vue 3.
 */
export function findRequiredVueParent<T extends ComponentPublicInstance>(
	component: ComponentPublicInstance,
	parentType: Constructor<T>
) {
	const parent = findVueParent(component, parentType);
	if (!parent) {
		throw new Error(
			`Couldn't find parent component (${parentType.name}) from child component (${component.$options.name}).`
		);
	}

	return parent;
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
