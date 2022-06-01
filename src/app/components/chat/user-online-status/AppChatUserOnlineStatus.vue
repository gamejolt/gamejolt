<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	isOnline: {
		type: Boolean,
		required: true,
	},
	size: {
		type: Number,
		default: undefined,
	},
	absolute: {
		type: Boolean,
		default: true,
	},
	/**
	 * The color to be displayed behind the layers of the bubble. Useful when
	 * `--theme-bg-actual` is set to something with transparency.
	 */
	backgroundColorBase: {
		type: String as PropType<'bg' | 'bg-offset'>,
		default: undefined,
	},
});

const { size } = toRefs(props);

const outerSize = computed(() => {
	const inset = 2;
	if (!size?.value || typeof size.value !== 'number') {
		return 12 - inset + 'px';
	}

	return size.value - inset + 'px';
});

const innerSize = computed(() => {
	if (!size?.value || typeof size.value !== 'number') {
		return '4px';
	}

	return Math.ceil(size.value / 3) + 'px';
});
</script>

<template>
	<div
		class="user-online-status"
		:class="{
			[`-change-${backgroundColorBase}`]: !!backgroundColorBase,
			'-absolute': absolute,
		}"
	>
		<div class="-bg-transparency-helper" />

		<slot />

		<div
			class="-status-container"
			:class="{ '-online': isOnline, '-offline': !isOnline }"
			:style="{
				width: outerSize,
				height: outerSize,
				borderWidth:
					'calc(' +
					(isOnline ? `${outerSize} / 2` : `(${outerSize} - ${innerSize}) / 2`) +
					')',
			}"
		>
			<div v-if="!isOnline" class="-inner" :style="{ width: innerSize, height: innerSize }" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.user-online-status
	position: relative
	padding: $border-width-large
	overflow: hidden

	&.-absolute
		position: absolute
		right: -2px
		bottom: @right

.-bg-transparency-helper
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	background-color: var(--theme-bg-actual)

.user-online-status
.-status-container
	img-circle()

.-status-container
	position: relative
	display: flex
	justify-content: center
	align-items: center
	border-style: solid

	&.-online
		border-color: var(--theme-link)

	&.-offline
		border-color: var(--theme-fg-muted)

for color in bg bg-offset
	.-change-{color}
		background-color: unquote('var(--theme-' + color + ')') !important
</style>
