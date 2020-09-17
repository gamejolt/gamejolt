<script lang="ts" src="./text"></script>

<template>
	<div
		class="devlog-post-text"
		:class="{
			'-hydrated': isHydrated,
		}"
	>
		<template v-if="isOpen">
			<div class="page-cut">
				<div class="page-cut-content-placeholder" />
			</div>

			<app-content-viewer :source="post.article_content" />
		</template>

		<div class="page-cut page-cut-bottom">
			<div class="page-cut-content">
				<app-loading
					v-if="isLoading"
					class="-loading"
					centered
					hide-label
					stationary
					@click.native.stop
				/>
				<app-button v-else trans @click.stop="toggleFull()">
					<translate v-if="!isOpen">read article</translate>
					<translate v-else>less</translate>
				</app-button>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'
@import '~styles-lib/mixins'

.page-cut
	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

	&-bottom
		margin-bottom: ($line-height-computed / 2)

.page-cut-content
	display: inline-block
	overflow: hidden

	&
	&-placeholder
		height: $button-md-line-height

.-loading
	margin: 0
	padding: 0 ($grid-gutter-width-xs / 2)

.devlog-post-text
	// Hide images and widgets until we are hydrated.
	>>> img
	>>> iframe
		visibility: hidden

	&.-hydrated
		>>> img
		>>> iframe
			visibility: visible
</style>
