import { Ref, computed, ref, watch } from 'vue';

export function useOnHover({
	disable,
	stateKey,
}: {
	disable?: Ref<boolean>;
	/**
	 * Resets our hover state when it changes. This can help fix some issues
	 * with the item rebuilding before it's able to reset the hover state.
	 */
	stateKey?: Ref<number | string | undefined>;
} = {}) {
	const hovered = ref(false);

	// Skip if they didn't define a stateKey at all.
	if (stateKey) {
		watch(
			() => stateKey?.value,
			() => {
				hovered.value = false;
			}
		);
	}

	const hoverBinding = {
		onMouseenter() {
			hovered.value = true;
		},
		onMouseleave() {
			hovered.value = false;
		},
	};

	return {
		/**
		 * This should be bound to the slot components that want to affect the hover
		 * state.
		 */
		hoverBinding,
		hovered: computed(() => !disable?.value && hovered.value),
	};
}
