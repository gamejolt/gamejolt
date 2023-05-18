import { AllowedComponentProps, Component, computed, PropType, Ref, VNodeProps } from 'vue';

/**
 * Allows us to get prop typing for a component while excluding internal Vue
 * props.
 *
 * https://stackoverflow.com/a/73784241
 */
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
	? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
	: never;

type DefinedSlots<T extends string> = T[] | boolean;

/**
 * Adds a `definedSlots` prop that a parent component can use to determine what
 * slot content, or components wrapping the slot, should be shown at any point.
 *
 * For use with {@link getSlotHelpers}.
 */
export function defineSlotHelperProps<T extends string>(
	validValues: T[],
	defaultValue: (() => T[]) | boolean
) {
	return {
		definedSlots: {
			type: [Array, Boolean] as PropType<DefinedSlots<T>>,
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
 * For use with {@link defineSlotHelperProps}.
 */
export function getSlotHelpers<T extends string>(definedSlots: Ref<DefinedSlots<T>>) {
	return {
		hasSlot(slot: T) {
			// Booleans should be returned directly.
			if (typeof definedSlots.value === 'boolean') {
				return definedSlots.value;
			}
			return definedSlots.value.includes(slot);
		},
		hasAnySlot: computed(() => {
			// Booleans should be returned directly.
			if (typeof definedSlots.value === 'boolean') {
				return definedSlots.value;
			}
			return definedSlots.value.length > 0;
		}),
	};
}
