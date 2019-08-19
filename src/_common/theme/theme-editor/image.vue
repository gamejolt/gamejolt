<template>
	<div class="theme-editor-image">
		<a class="theme-editor-image-clear" v-if="value" @click="clear()">
			<translate>clear</translate>
		</a>

		<div class="theme-editor-image-content">
			<img class="theme-editor-image-img" v-if="value" :src="value.img_url" alt="" />

			<form-theme-editor-image :type="type" :parent-id="parentId" @submit="onImageAdded" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.theme-editor-image
	padding: 8px 15px

	&-clear
		theme-prop('color', 'fg-muted', true)
		float: right

		&:hover
			theme-prop('color', 'link-hover', true)

	&-content
		clear: both

	&-img
		img-responsive()
		max-height: 200px
		margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./image"></script>
