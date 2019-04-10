<template>
	<div
		class="devlog-post-text"
		:class="{
			'-hydrated': isHydrated,
		}"
	>
		<template v-if="isOpen">
			<div class="page-cut" />

			<div class="fireside-post-body">
				<app-widget-compiler :content="post.content_compiled" />
			</div>
		</template>

		<div class="page-cut">
			<app-button
				:trans="!isToggling"
				:solid="isToggling"
				:primary="isToggling"
				@click.stop="toggleFull()"
			>
				<translate v-if="!isOpen">read article</translate>
				<translate v-else>less</translate>
			</app-button>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../../variables'
@require '~styles-lib/mixins'

.page-cut
	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.devlog-post-text
	// Hide images and widgets until we are hydrated.
	>>> img, >>> iframe
		visibility: hidden

	&.-hydrated
		>>> img, >>> iframe
			visibility: visible
</style>

<script lang="ts" src="./text"></script>
