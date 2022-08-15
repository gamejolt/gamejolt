<script lang="ts" setup>
import { computed, PropType, useSlots } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

const props = defineProps({
	to: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	// In order to check if this event is bound, we need to specify it as a prop
	// as well.
	// https://github.com/vuejs/core/issues/5220
	onClick: {
		type: Function,
		default: undefined,
	},
});

const emit = defineEmits({
	click: (_e: MouseEvent) => true,
});

const slots = useSlots();

const hasImg = computed(() => !!slots.img);
const hasClickListener = computed(() => !!props.onClick);

const component = computed(() => {
	if (props.to) {
		return RouterLink;
	}

	if (hasClickListener.value) {
		return 'a';
	}

	return 'div';
});

function onClick(e: MouseEvent) {
	if (component.value === 'div') {
		return;
	}

	emit('click', e);
}
</script>

<template>
	<component :is="component" class="pill" :to="to" @click="onClick">
		<span v-if="hasImg" class="-img">
			<slot name="img" />
		</span>
		<span class="-content">
			<slot />
		</span>
	</component>
</template>

<style lang="stylus" scoped>
.pill
	rounded-corners()
	change-bg('bg-offset')
	theme-prop('color', 'fg')
	display: inline-flex
	align-items: center
	padding: 5px 10px
	font-size: $font-size-small
	user-select: none
	margin-right: 5px
	margin-bottom: 5px

	&.active
		change-bg('bi-bg')
		theme-prop('color', 'bi-fg')

	a&
		pressy()
		cursor: pointer

		&:hover
			change-bg('bi-bg')
			theme-prop('color', 'bi-fg')

.-img
	margin-right: 5px
	width: 18px
	height: 18px
</style>
