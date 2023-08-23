import { AllowedComponentProps, PropType, Ref, VNodeProps, computed, type Component } from 'vue';

/**
 * Allows us to get prop typing for a component while excluding internal Vue
 * props.
 *
 * https://stackoverflow.com/a/73784241
 */
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
	? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
	: never;

type DynamicSlots<T extends string> = T[] | boolean;

/**
 * Adds a `dynamicSlots` prop that a parent component can use to determine what
 * slot content, or components wrapping the slot, should be shown at any point.
 *
 * For use with {@link useDynamicSlots}.
 */
export function defineDynamicSlotProps<T extends string>(
	validValues: T[],
	defaultValue: (() => T[]) | boolean
) {
	return {
		dynamicSlots: {
			type: [Array, Boolean] as PropType<DynamicSlots<T>>,
			default: defaultValue,
			validator: (value: unknown) => {
				if (typeof value === 'boolean') {
					return true;
				} else if (Array.isArray(value)) {
					return value.length === 0 || value.every(i => validValues.includes(i));
				}
				return false;
			},
		},
	};
}

/**
 * Has some helpers for checking if a slot should be built.
 *
 * NOTE: Nothing in this actually checks if a slot has content being passed into
 * it.
 *
 * For use with {@link defineDynamicSlotProps}.
 */
export function useDynamicSlots<T extends string>(dynamicSlots: Ref<DynamicSlots<T>>) {
	return {
		hasSlot(slot: T) {
			// Booleans should be returned directly.
			if (typeof dynamicSlots.value === 'boolean') {
				return dynamicSlots.value;
			}
			return dynamicSlots.value.includes(slot);
		},
		hasAnySlot: computed(() => {
			// Booleans should be returned directly.
			if (typeof dynamicSlots.value === 'boolean') {
				return dynamicSlots.value;
			}
			return dynamicSlots.value.length > 0;
		}),
	};
}
