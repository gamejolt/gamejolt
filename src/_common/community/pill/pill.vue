<template>
	<app-pill v-if="!channel" :to="toCommunity">
		<app-community-thumbnail-img slot="img" :community="community" />

		{{ community.name }}
	</app-pill>
	<app-pill-bi v-else :toLeft="toCommunity" :toRight="toChannel">
		<app-community-thumbnail-img slot="left-img" :community="community" />
		<template slot="left">
			{{ community.name }}
		</template>

		<template slot="right">
			{{ channel.title }}
		</template>
	</app-pill-bi>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

>>> .pill-bi-right
	change-bg('bg')
	border: 1px solid
	theme-prop('border-color', 'bg-subtle')
</style>

<script lang="ts" src="./pill"></script>
