<script lang="ts" setup>
import { computed, PropType, useSlots } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

const props = defineProps({
	leftTo: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	rightTo: {
		type: Object as PropType<RouteLocationRaw>,
		default: undefined,
	},
	noHover: {
		type: Boolean,
		default: false,
	},
});

const slots = useSlots();

const leftComponent = computed(() => (props.leftTo ? RouterLink : 'span'));
const rightComponent = computed(() => (props.rightTo ? RouterLink : 'span'));

const hasImg = computed(() => !!slots.img);
</script>

<template>
	<span class="pill-bi">
		<component :is="leftComponent" class="-left" :class="{ '-no-hover': noHover }" :to="leftTo">
			<span class="-content">
				<span v-if="hasImg" class="-img">
					<slot name="img" />
				</span>
				<slot name="left" />
			</span>

			<span class="-sep">
				<span class="-container">
					<svg
						class="-svg"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<polygon points="0,0 100,0 0,100" />
					</svg>
				</span>
			</span>
		</component>

		<component
			:is="rightComponent"
			class="-right"
			:class="{ '-no-hover': noHover }"
			:to="rightTo"
		>
			<slot name="right" />
		</component>
	</span>
</template>

<style lang="stylus" scoped>
$-separator-width = 20px
// It looks a bit better if the right bit slightly overlaps
// with the separator.
$-separator-overlap = 2px

.pill-bi
	display: inline-flex
	align-items: stretch
	font-size: $font-size-small
	user-select: none
	// Margin to next element
	margin-right: 4px
	margin-bottom: 4px
	border: $border-width-base solid
	border-color: var(--theme-bg-subtle)
	border-radius: $border-radius-base
	overflow: hidden

.-content
	display: inline-flex
	align-items: center

.-left
	change-bg('bg-offset')
	fill: var(--theme-bg-offset)
	// Needed to make sure -sep takes the full height of the left side.
	// padding for the content itself is done in the nested -container
	display: inline-flex
	align-items: stretch
	// The separator element inside -left needs to overlay -right.
	z-index: 2

	// We need to apply the padding only the content and not the entire
	// -left because we need the -sep element to be stretched to the full
	// height of the parent properly.
	.-content
		padding: 4px 0 4px 8px

.-right
	@extend .-content
	change-bg('bg')
	// The separator overlays the -right element.
	// We need to extend the padding to get the right side background
	// color below the transparent -sep svg.
	padding: 4px 8px 4px ($-separator-width - $-separator-overlap)
	z-index: 1

.-sep
	// This makes is possible to overlay the separator without extending
	// the area of the parent -left element.
	width: 0

	// This container is needed purely to prevent the svg from extending the
	// parent height.
	.-container
		position: relative
		display: inline-block
		width: $-separator-width
		height: 100%

		// Apparently it's slow applying css to svg elements directly, but on class names its fine?
		// Thank you css, very cool.
		.-svg
			position: absolute
			width: 100%
			height: 100%

// Basic button stuff common to both left and right sides.
.-left
.-right
	color: var(--theme-fg)

	&:not(.-no-hover)
		pressy()
		cursor: pointer

		&:hover
			change-bg('bi-bg')
			fill: var(--theme-bi-bg)
			color: var(--theme-bi-fg)

.-img
	margin-right: 6px
	width: 16px
	height: 16px
</style>
