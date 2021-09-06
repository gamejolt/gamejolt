<script lang="ts">
import { darken, lighten } from 'polished';
import { computed, inject, onMounted, PropType, provide, reactive, ref } from 'vue';
import { GrayLight, GraySubtle, Theme } from '../../theme/theme.model';
import { useThemeStore } from '../../theme/theme.store';
import AppScrollInviewParent from '../inview/parent.vue';

export type ScrollController = ReturnType<typeof createScroller>;

const Key = Symbol();
const defaultTheme = new Theme(null);

export function createScroller() {
	const element = ref<HTMLElement>();

	return reactive({
		element,
		scrollTo(offsetY: number) {
			element.value?.scrollTo({ top: offsetY });
		},
	});
}

export function useScroller() {
	return inject(Key) as ScrollController | undefined;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	controller: {
		type: Object as PropType<ScrollController>,
		default: () => createScroller(),
	},
	thin: {
		type: Boolean,
	},
	horizontal: {
		type: Boolean,
	},
	hideScrollbar: {
		type: Boolean,
	},
});

const themeStore = useThemeStore();

// TODO(vue3): can we make this reactive so that it updates what is provided
// down if the controller given changes somehow?
provide(Key, props.controller);

const isMounted = ref(GJ_IS_SSR);

const actualTheme = computed(() => {
	// Use the form/page/user theme, or the default theme if none exist.
	return themeStore.theme ?? defaultTheme;
});

const hoverColors = computed<any>(() => ({
	'--default-hover': `#${actualTheme.value.tintColor(darken(0.2, GrayLight), 0.04)}`,
	'--modal-hover': `#${actualTheme.value.tintColor(lighten(0.15, GraySubtle), 0.04)}`,
}));

onMounted(() => {
	isMounted.value = true;
});
</script>

<template>
	<div
		ref="controller.element"
		class="scroll-scroller"
		:class="{
			'-thin': thin,
			'-horizontal': horizontal,
			'-hide-scrollbar': hideScrollbar,
		}"
		:style="hoverColors"
	>
		<AppScrollInviewParent v-if="isMounted" :scroller="controller.element">
			<slot />
		</AppScrollInviewParent>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// 6px appears to be the width for the 'thin' scrollbar on Firefox
$-size-default = 9px
$-size-thin = 7px
$-thumb-default-hover = var(--default-hover)
$-thumb-default = var(--theme-light)
$-track-default = transparent
$-thumb-modal-hover = var(--modal-hover)
$-thumb-modal = var(--theme-gray-subtle)
$-track-modal = var(--theme-bg)

.scroll-scroller
	scrollable()

	&.-horizontal
		scrollable-x()

	&.-hide-scrollbar
		// Firefox
		scrollbar-width: none

		// Other browsers
		&::-webkit-scrollbar
			display: none

	/* mouse, touch pad, and stylus-based screens */
	@media not screen and (pointer: coarse)
		scrollbar-color: $-thumb-default $-track-default

		&::-webkit-scrollbar
			background-color: $-track-default
			width: $-size-default
			height: $-size-default

			&-thumb
				background-color: $-thumb-default
				border-radius: $-size-default

				&:hover
					background-color: $-thumb-default-hover

		&.-thin
			scrollbar-width: thin

			&::-webkit-scrollbar
				width: $-size-thin
				height: $-size-thin

				&-thumb
					border-radius: $-size-thin

		// Override colors so transparency doesn't look weird
		// with body background or others in full-screen modals.
		&.modal
			scrollbar-color: $-thumb-modal $-track-modal

			&::-webkit-scrollbar
				background-color: $-track-modal

				&-thumb
					background-color: $-thumb-modal

					&:hover
						background-color: $-thumb-modal-hover
</style>
