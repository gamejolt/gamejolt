<template>
	<app-pill v-if="!channel" :to="toCommunity">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
	</app-pill>
	<span class="-pill-bi" v-else>
		<router-link class="-left" :to="toCommunity">
			<span class="-img">
				<app-community-thumbnail-img :community="community" />
			</span>
			{{ community.name }}
		</router-link>

		<svg
			class="-sep"
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<polygon points="0,0 100,0 0,100" />
		</svg>

		<router-link class="-right" :to="toChannel">
			{{ channel.title }}
		</router-link>
	</span>
	<!-- <app-pill-bi v-else :toLeft="toCommunity" :toRight="toChannel">
		<app-community-thumbnail-img slot="left-img" :community="community" />
		<template slot="left">
			{{ community.name }}
		</template>

		<template slot="right">
			{{ channel.title }}
		</template>
	</app-pill-bi> -->
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-separator-width = 20px
$-separator-overlap = 5px

.-pill-bi
	display: inline-flex
	align-items: center
	font-size: $font-size-small
	user-select: none

	// Margin to next element
	margin-right: 5px
	margin-bottom: 5px

.-left
	change-bg('bg-offset')
	theme-prop('fill', 'bg-offset')

	// keeps the community image sized and lined up with the text
	display: inline-flex
	align-items: center

	// shape of the left side of the pill
	padding: 5px 0px 5px 10px
	border-radius: $border-radius-base 0 0 $border-radius-base

.-right
	change-bg('bg')

	// shape of the right side of the pill
	padding: 5px 10px 5px ($-separator-width - $-separator-overlap)
	border-radius: 0 $border-radius-base $border-radius-base 0
	border: 1px solid
	theme-prop('border-color', 'bg-subtle')

	position: relative
	left: -($-separator-overlap)
	margin-left: -($-separator-width - $-separator-overlap)

	z-index: 1

.-sep
	width: $-separator-width
	align-self: stretch

	z-index: 2

.-left, .-right
	theme-prop('color', 'fg')

	a&
		pressy()
		cursor: pointer

		&:hover
			change-bg('bi-bg')
			theme-prop('fill', 'bi-bg')
			theme-prop('color', 'bi-fg')
.-img
	img-circle()
	overflow: hidden
	margin-right: 5px
	width: 18px
	height: 18px

</style>

<script lang="ts" src="./pill"></script>
