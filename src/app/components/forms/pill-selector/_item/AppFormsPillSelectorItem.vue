<script lang="ts" setup>
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';

defineProps({
	isHeader: {
		type: Boolean,
	},
	hasHeaderBack: {
		type: Boolean,
	},
	noImg: {
		type: Boolean,
	},
});
</script>

<template>
	<a
		class="-item list-group-item"
		:class="{ '-item-static': isHeader && !hasHeaderBack, '-selected': isHeader }"
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
	width: 32px
	height: 32px

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
