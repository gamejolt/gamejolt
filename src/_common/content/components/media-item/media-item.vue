<script lang="ts" src="./media-item"></script>

<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		show-edit
		@removed="onRemoved"
		@edit="onEdit"
	>
		<div
			class="media-item"
			:class="{
				'-editing': isEditing,
				'-link': hasLink && !isEditing,
			}"
			:style="{
				'align-items': itemAlignment,
			}"
		>
			<div
				ref="container"
				v-app-observe-dimensions="computeSize"
				class="media-item-container"
				:class="{ '-zoomable': canFullscreenItem }"
				:style="{
					width: containerWidth,
					height: containerHeight,
				}"
			>
				<app-media-item-backdrop
					:class="{ '-backdrop': shouldShowPlaceholder }"
					:media-item="mediaItem"
					radius="lg"
				>
					<template v-if="mediaItem">
						<component
							:is="hasLink && !isEditing ? 'a' : 'span'"
							:href="hasLink && !isEditing ? href : undefined"
							rel="nofollow noopener"
							target="_blank"
						>
							<app-img-responsive
								v-if="shouldUseMediaserver"
								class="content-image"
								:src="mediaItem.mediaserver_url"
								:alt="title"
								:title="title"
								@load.native="onImageLoad"
								@click.native="onItemFullscreen()"
							/>
							<img
								v-else
								class="img-responsive content-image"
								:src="mediaItem.img_url"
								:alt="title"
								:title="title"
								@load="onImageLoad"
								@click="onItemFullscreen()"
							/>
						</component>
					</template>
					<template v-else-if="hasError">
						<translate>Error loading media item.</translate>
					</template>
					<template v-else>
						<app-loading />
					</template>
				</app-media-item-backdrop>
				<div v-if="mediaItem && hasLink" class="-link-overlay">
					<small>
						<app-link-external class="-link-overlay-display" :href="href">
							<app-jolticon class="-icon" icon="link" />
							&nbsp;
							<span>{{ displayHref }}</span>
						</app-link-external>
					</small>
				</div>
			</div>
			<span v-if="mediaItem && hasCaption" class="text-muted">
				<em>{{ caption }}</em>
			</span>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-editing
	// Make sure the X button fits properly, usually not a problem unless the image is super wide.
	min-height: 44px

	.-link-overlay
		change-bg('bg-offset')
		opacity: 0.7
		padding: 2px
		bottom: 4px
		left: 4px

.-link
	// Mobile - styling for coarse pointers
	@media screen and (pointer: coarse)
		margin-bottom: $line-height-computed + 20px

.-zoomable
	cursor: zoom-in

// While the image is still loading, we show a dimmed background as a fallback for app-media-item-backdrop
.-backdrop
	change-bg('bg-offset')

.media-item
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	cursor: default

.media-item-container
	display: flex
	justify-content: center
	align-items: center
	max-width: 100%
	position: relative

	&:hover
		.-link-overlay
			opacity: 1

.-link-overlay
	rounded-corners()
	cursor: pointer
	position: absolute
	padding: 2px
	bottom: -22px
	left: 2px

	&-display
		display: flex

	// Desktop - styling for non-coarse pointers
	@media not screen and (pointer: coarse)
		change-bg('bg-offset')
		transition: opacity 300ms ease
		opacity: 0
		padding: 4px
		bottom: 8px
		left: 8px

.caption-placeholder
	cursor: pointer
	pressy()

.content-image
	display: block
	margin-bottom: 0
	max-width: 100%

// Within lists align media items to the left
li .media-item
	align-items: flex-start !important
</style>
