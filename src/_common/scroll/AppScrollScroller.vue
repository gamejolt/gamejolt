<script lang="ts">
import type { UseOverlayScrollbarsInstance } from 'overlayscrollbars-vue';
import { useOverlayScrollbars } from 'overlayscrollbars-vue';
import { darken, lighten } from 'polished';
import {
	HTMLAttributes,
	InjectionKey,
	computed,
	inject,
	onMounted,
	provide,
	ref,
	shallowReadonly,
	watchPostEffect,
} from 'vue';
import { Screen } from '../screen/screen-service';
import { DefaultTheme, GrayLight, GraySubtle } from '../theme/theme.model';
import { useThemeStore } from '../theme/theme.store';
import AppScrollInviewParent from './inview/AppScrollInviewParent.vue';

export type ScrollController = ReturnType<typeof createScroller>;

const Key: InjectionKey<ScrollController> = Symbol('scroller');

export function useScroller() {
	return inject(Key, null);
}

export function createScroller() {
	const element = ref<HTMLElement>();
	const getOverlayInstance = ref<UseOverlayScrollbarsInstance>();

	function scrollTo(
		offset: number,
		{ edge, behavior }: ScrollOptions & { edge: 'top' | 'left' } = { edge: 'top' }
	) {
		let target = getOverlayInstance.value?.()?.elements().scrollOffsetElement;
		if (!(target instanceof HTMLElement)) {
			target = element.value;
		}
		target?.scrollTo({ [`${edge}`]: offset, behavior });
	}

	return shallowReadonly({
		element,
		getOverlayInstance,
		scrollTo,
	});
}
</script>

<script lang="ts" setup>
type Props = {
	controller?: ScrollController;
	disabled?: boolean;
	thin?: boolean;
	horizontal?: boolean;
	hideScrollbar?: boolean;
	modalScroller?: boolean;
	overlay?: boolean;
};

const {
	controller = createScroller(),
	disabled,
	horizontal,
	overlay,
	thin,
	hideScrollbar,
	modalScroller,
} = defineProps<Props & HTMLAttributes>();

// Create a local reference to avoid mutating the prop
const localController = controller;

provide(Key, localController);

const { element } = localController;
const { theme } = useThemeStore();
const isMounted = ref(import.meta.env.SSR);
const shouldDisable = ref(false);

// There can be some jank when this changes during a scroll event if this
// isn't set to `post`, causing the page to jump unexpectedly.
watchPostEffect(() => {
	shouldDisable.value = disabled;
});

const [initOverlayScrollbar, getOverlayScrollbarInstance] = useOverlayScrollbars(
	computed(() => {
		return {
			options: {
				overflow: {
					// Unfortunately, disabling like this doesn't allow us to
					// complete a smooth scroll (or any scroll) once it's
					// disabled. Any smooth scroll will just stop at some point
					// during the transition.
					x: shouldDisable.value ? 'hidden' : horizontal ? 'scroll' : 'hidden',
					y: shouldDisable.value ? 'hidden' : horizontal ? 'hidden' : 'scroll',
				},
				scrollbars: {
					autoHide: 'move',
					autoHideDelay: 1_000,
					clickScroll: false,
					dragScroll: true,
					visibility: 'auto',
				},
				showNativeOverlaidScrollbars: false,
				paddingAbsolute: false,
			},
		};
	})
);

function setupOverlayScroller(target: HTMLElement) {
	initOverlayScrollbar({ target });
	localController.getOverlayInstance.value = getOverlayScrollbarInstance;
}

function cleanupOverlayScroller() {
	getOverlayScrollbarInstance()?.destroy();
	localController.getOverlayInstance.value = undefined;
}

watchPostEffect(onCleanup => {
	if (element.value && overlay) {
		setupOverlayScroller(element.value);
	} else {
		cleanupOverlayScroller();
	}
	onCleanup(() => cleanupOverlayScroller());
});

const actualTheme = computed(() => {
	// Use the form/page/user theme, or the default theme if none exist.
	return theme.value ?? DefaultTheme;
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
		ref="element"
		v-bind="overlay ? { 'data-overlayscrollbars-initialize': true } : {}"
		class="scroll-scroller"
		:class="{
			'_default-scroller': !overlay,
			'_overlay-scroller': overlay,
			'_modal-scroller': modalScroller,
			_mouse: Screen.isPointerMouse,
			_thin: thin,
			_horizontal: horizontal,
			'_hide-scrollbar': hideScrollbar,
		}"
		:style="hoverColors"
	>
		<AppScrollInviewParent v-if="isMounted" :scroll-element="element">
			<slot />
		</AppScrollInviewParent>
	</div>
</template>

<style lang="css" src="overlayscrollbars/overlayscrollbars.css"></style>
<style lang="stylus" scoped>
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
	&._default-scroller
		scrollable()

		&._horizontal
			scrollable-x()

		&._hide-scrollbar
			// Firefox
			scrollbar-width: none

			// Other browsers, overlay scrollers
			&::-webkit-scrollbar
			::v-deep(.os-scrollbar)
			::v-deep(.os-scrollbar-handle)
				display: none

	&._mouse
	&._overlay-scroller
		scrollbar-color: $-thumb-default $-track-default

		&::-webkit-scrollbar
		::v-deep(.os-scrollbar)
			background-color: $-track-default
			width: $-size-default

		&::-webkit-scrollbar
			height: $-size-default

		&::-webkit-scrollbar-thumb
		::v-deep(.os-scrollbar-handle)
			background-color: $-thumb-default
			border-radius: $-size-default

			&:hover
				background-color: $-thumb-default-hover

		&._thin
			scrollbar-width: thin

			&::-webkit-scrollbar
			::v-deep(.os-scrollbar)
				width: $-size-thin

			&::-webkit-scrollbar
				height: $-size-thin

			&::-webkit-scrollbar-thumb
			::v-deep(.os-scrollbar-handle)
				border-radius: $-size-thin

		// Override colors so transparency doesn't look weird
		// with body background or others in full-screen modals.
		&._modal-scroller
			scrollbar-color: $-thumb-modal $-track-modal

			&::-webkit-scrollbar
			::v-deep(.os-scrollbar)
				background-color: $-track-modal

			&::-webkit-scrollbar-thumb
			::v-deep(.os-scrollbar-handle)
				background-color: $-thumb-modal

				&:hover
					background-color: $-thumb-modal-hover
</style>
