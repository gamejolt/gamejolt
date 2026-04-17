<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

type Props = {
	to?: RouteLocationRaw;
	// In order to check if this event is bound, we need to specify it as a prop
	// as well.
	// https://github.com/vuejs/core/issues/5220
	onClick?: (e: MouseEvent) => void;
	bleedImg?: boolean;
};
const { to, onClick: onClickProp, bleedImg } = defineProps<Props>();

const emit = defineEmits<{
	click: [e: MouseEvent];
}>();

const slots = useSlots();

const hasImg = computed(() => !!slots.img);
const hasClickListener = computed(() => !!onClickProp);

const component = computed(() => {
	if (to) {
		return RouterLink;
	}

	if (hasClickListener.value) {
		return 'a';
	}

	return 'div';
});

function handleClick(e: MouseEvent) {
	if (component.value === 'div') {
		return;
	}

	emit('click', e);
}
</script>

<template>
	<component
		:is="component"
		class="pill"
		:class="{ '-bleed-img': bleedImg }"
		:to="to"
		@click="handleClick"
	>
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

	&.-bleed-img
		padding: 0
		overflow: hidden

		.-content
			padding: 5px 10px 5px 0

		.-img
			width: unset
			height: unset
			margin-right: 12px

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
