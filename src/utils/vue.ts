import { ComponentPublicInstance, Ref } from 'vue';

export type MaybeRef<T> = Ref<T> | T;

type Constructor<T> = { new (): T };

/**
 * @deprecated This no longer works with Vue 3.
 */
function findVueParent<T extends ComponentPublicInstance>(
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
