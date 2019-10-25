<template>
	<app-pill
		v-if="!community"
		class="-pill"
		:to="{
			name: 'communities.view.overview',
			params: {
				path: path,
			},
		}"
	>
		<app-img-responsive class="-img" :src="placeholderThumbnailImg" alt="" />

		{{ path }}
	</app-pill>
	<app-community-pill v-else class="-pill" :community="community" />
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-pill
	display: inline-flex
	margin: 0

	>>> .-img
		display: inline-block

	>>> .-content
		align-self: baseline

.-img
	img-circle()
	overflow: hidden
	margin-right: 5px
	width: 18px
	height: 18px
</style>

<script lang="ts" src="./community"></script>
