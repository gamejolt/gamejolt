<script lang="ts">
import { inject, InjectionKey, provide, Ref, shallowReadonly, toRef } from 'vue';

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
type Props = {
	/**
	 * If you want to be able to select multiple options. Note: this is not
	 * reactive and can not be changed during runtime.
	 */
	multi?: boolean;
	/**
	 * Which flex direction do you want the items to be layed out in.
	 */
	direction?: Direction;
};
const { multi, direction = 'row' } = defineProps<Props>();

provide(
	key,
	createController({
		// not reactive
		multi,
		direction: toRef(() => direction),
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
