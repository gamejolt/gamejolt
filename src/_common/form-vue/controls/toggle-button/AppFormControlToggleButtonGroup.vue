<script lang="ts">
import { inject, InjectionKey, PropType, provide, Ref, shallowReadonly, toRef } from 'vue';

type Controller = ReturnType<typeof createController>;
type Direction = 'row' | 'column';

const key: InjectionKey<Controller> = Symbol();

export function useFormControlToggleButtonGroup() {
	return inject(key);
}

function createController(options: { multi: boolean; direction: Ref<Direction> }) {
	return shallowReadonly(options);
}
</script>

<script lang="ts" setup>
const props = defineProps({
	/**
	 * If you want to be able to select multiple options. Note: this is not
	 * reactive and can not be changed during runtime.
	 */
	multi: {
		type: Boolean,
	},
	/**
	 * Which flex direction do you want the items to be layed out in.
	 */
	direction: {
		type: String as PropType<Direction>,
		default: 'row',
	},
});

provide(
	key,
	createController({
		// not reactive
		multi: props.multi,
		direction: toRef(props, 'direction'),
	})
);
</script>

<template>
	<div
		class="-toggle-button-group"
		:class="multi ? '-multi' : '-single'"
		:style="{ 'flex-direction': direction }"
	>
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-toggle-button-group
	display: flex
	grid-gap: 8px

.-single
	grid-gap: 0
</style>
