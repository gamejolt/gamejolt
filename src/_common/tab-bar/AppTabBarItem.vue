<script lang="ts" setup>
defineProps({
	active: {
		type: Boolean,
	},
});
</script>

<template>
	<a class="tab-bar-item" :class="{ '-active': active }">
		<div class="-tab-container">
			<slot />
		</div>

		<div class="-tab-line" />
	</a>
</template>

<style lang="stylus" scoped>
.tab-bar-item
	--text-color: var(--theme-fg-muted)
	padding: 24px 12px 16px
	color: var(--text-color)
	font-size: $font-size-base
	font-weight: 700
	letter-spacing: -0.02em;

	&.-active
	&:hover
		--text-color: var(--theme-primary)

		.-tab-line
			background-color: var(--text-color)

.-tab-container
	display: inline-flex
	gap: 4px
	align-items: center

.-tab-line
	height: 2px
	width: 100%
	margin-top: 6px
</style>
