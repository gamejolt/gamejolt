<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';

type Props = {
	isHeader?: boolean;
	hasHeaderBack?: boolean;
	noImg?: boolean;
	imgWidth?: number;
	imgHeight?: number;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const {
	isHeader = false,
	hasHeaderBack = false,
	noImg = false,
	imgWidth = 32,
	imgHeight = 32,
} = defineProps<Props>();
</script>

<template>
	<a
		class="-item list-group-item"
		:class="{ '-item-static': isHeader && !hasHeaderBack, '-selected': isHeader }"
		:style="`--img-width: ${imgWidth}px; --img-height: ${imgHeight}px`"
	>
		<div v-if="!noImg || hasHeaderBack" class="-thumbnail">
			<slot name="img" />
		</div>

		<AppJolticon v-if="hasHeaderBack" class="-back" icon="arrow-left" />

		<span class="-text">
			<slot />
		</span>

		<div class="-tag">
			<slot name="tag" />
		</div>
	</a>
</template>

<style lang="stylus" scoped>
.-item
	display: flex
	align-items: center

.-text
	text-overflow()

.-selected
	change-bg('bg-offset')

	&.-item-static
		cursor: default

	&:hover
		.-back
			opacity: 1

.-back
.-thumbnail
	width: var(--img-width)
	height: var(--img-height)

.-back
	img-circle()
	display: flex
	align-items: center
	flex-shrink: 0

.-thumbnail
	margin-right: 8px

.-back
	position: absolute
	justify-content: center
	margin: 0
	background-color: var(--theme-bi-bg)
	color: var(--theme-bi-fg)
	opacity: 0
	transition: opacity 300ms $strong-ease-out

.-tick
	margin-left: 4px
</style>
