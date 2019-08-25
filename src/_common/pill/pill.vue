<template>
	<component :is="component" class="pill" :to="to">
		<span class="-img" v-if="hasImg">
			<slot name="img" />
		</span>
		<span class="-content">
			<slot />
		</span>
	</component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

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
	img-circle()
	overflow: hidden
	margin-right: 5px
	width: 18px
	height: 18px
</style>

<script lang="ts" src="./pill"></script>
