import {
	AllowedComponentProps,
	PropType,
	VNodeProps,
	computed,
	toValue,
	type Component,
} from 'vue';
import { RefOrGetter } from '../utils/vue';

/**
 * Allows us to get prop typing for a component while excluding internal Vue
 * props.
 *
 * https://stackoverflow.com/a/73784241
 */
export type ComponentProps<C extends Component> = C extends new (...args: any) => any
	? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
	: never;

export type DynamicSlots<T extends string> = T[] | Record<T, boolean> | boolean;
type DynamicSlotArray<T extends string> = T[] | Readonly<T[]>;

/**
 * Adds a `dynamicSlots` prop that a parent component can use to determine what
 * slot content, or components wrapping the slot, should be shown at any point.
 *
 * For use with {@link useDynamicSlots}.
 */
export function defineDynamicSlotProps<T extends string>(
	validValues: DynamicSlotArray<T>,
	defaultValue: (() => DynamicSlotArray<T> | Record<T, boolean>) | boolean
) {
	return {
		dynamicSlots: {
			type: [Array, Object, Boolean] as PropType<DynamicSlots<T>>,
			default: defaultValue,
			validator: (value: unknown) => {
				if (typeof value === 'boolean') {
					return true;
				} else if (Array.isArray(value)) {
					return value.length === 0 || value.every(i => validValues.includes(i));
				} else if (value && typeof value === 'object') {
					return Object.keys(value).every((i: T) => validValues.includes(i));
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
export function useDynamicSlots<T extends string>(dynamicSlots: RefOrGetter<DynamicSlots<T>>) {
	return {
		hasSlot(slot: T) {
			const value = toValue(dynamicSlots);

			// Booleans should be returned directly.
			if (typeof value === 'boolean') {
				return value;
			} else if (Array.isArray(value)) {
				return value.includes(slot);
			} else if (typeof value === 'object') {
				return value[slot];
			}
		},
		hasAnySlot: computed(() => {
			const value = toValue(dynamicSlots);

			// Booleans should be returned directly.
			if (typeof value === 'boolean') {
				return value;
			} else if (Array.isArray(value)) {
				return value.length > 0;
			} else if (typeof value === 'object') {
				return Object.values(value).some(i => i);
			}
		}),
	};
}
