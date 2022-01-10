<script lang="ts" src="./text"></script>

<template>
	<div
		class="post-text"
		:class="{
			'-hydrated': isHydrated,
		}"
	>
		<template v-if="isOpen">
			<div class="page-cut">
				<div class="-page-cut-content-placeholder" />
			</div>

			<app-content-viewer :source="post.article_content" disable-lightbox />
		</template>

		<div class="-page-cut-bottom page-cut">
			<div class="page-cut-content">
				<app-loading
					v-if="isLoading"
					class="-loading"
					centered
					hide-label
					stationary
					@click.stop
				/>
				<app-button v-else trans @click.stop="toggleFull()">
					<translate v-if="!isOpen">Read article</translate>
					<translate v-else>Less</translate>
				</app-button>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

.page-cut
	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-page-cut-bottom
	margin-bottom: ($line-height-computed / 2)

.page-cut-content
	display: inline-block
	overflow: hidden

.page-cut-content
.-page-cut-content-placeholder
	height: $button-md-line-height

.-loading
	margin: 0
	padding: 0 ($grid-gutter-width-xs / 2)

.post-text
	// Hide images and widgets until we are hydrated.
	::v-deep(img)
	::v-deep(iframe)
		visibility: hidden

	&.-hydrated
		::v-deep(img)
		::v-deep(iframe)
			visibility: visible
</style>
