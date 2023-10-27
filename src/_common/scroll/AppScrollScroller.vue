<script lang="ts">
import { useOverlayScrollbars } from 'overlayscrollbars-vue';
import { darken, lighten } from 'polished';
import {
	InjectionKey,
	PropType,
	computed,
	inject,
	onMounted,
	provide,
	ref,
	toRefs,
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

	function scrollTo(
		offset: number,
		{ edge, behavior }: ScrollOptions & { edge: 'top' | 'left' } = { edge: 'top' }
	) {
		element.value?.scrollTo({ [`${edge}`]: offset, behavior });
	}

	return {
		element,
		scrollTo,
	};
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
	modalScroller: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
});

const { controller, horizontal, overlay } = toRefs(props);

provide(Key, controller.value);

const { element } = controller.value;
const { theme } = useThemeStore();
const isMounted = ref(import.meta.env.SSR);

const [initOverlayScrollbar, getOverlayScrollbarInstance] = useOverlayScrollbars(
	computed(() => {
		return {
			options: {
				overflow: {
					x: horizontal.value ? 'scroll' : 'hidden',
					y: horizontal.value ? 'hidden' : 'scroll',
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

watchPostEffect(onCleanup => {
	if (element.value && overlay.value) {
		initOverlayScrollbar({
			target: element.value,
		});
	} else {
		getOverlayScrollbarInstance()?.destroy();
	}
	onCleanup(() => getOverlayScrollbarInstance()?.destroy());
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
		data-overlayscrollbars-initialize
		class="scroll-scroller"
		:class="{
			'_default-scroller': !overlay,
			'_overlay-scroller': overlay,
			'_model-scroller': modalScroller,
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
