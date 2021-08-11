<script lang="ts" src="./image"></script>

<template>
	<div class="theme-editor-image">
		<a v-if="modelValue" class="theme-editor-image-clear" @click="clear()">
			<translate>clear</translate>
		</a>

		<div class="theme-editor-image-content">
			<img
				v-if="modelValue"
				class="theme-editor-image-img"
				:src="modelValue.img_url"
				alt=""
			/>

			<form-theme-editor-image :type="type" :parent-id="parentId" @submit="onImageAdded" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
