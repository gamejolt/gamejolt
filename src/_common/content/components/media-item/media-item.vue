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
			:style="{
				'align-items': itemAlignment,
			}"
		>
			<div
				class="media-item-container"
				:class="{
					'media-item-container-placeholder': shouldShowPlaceholder,
				}"
				ref="container"
				:style="{
					width: containerWidth,
					height: containerHeight,
				}"
			>
				<template v-if="isHydrated">
					<component
						:is="hasLink && !isEditing ? 'a' : 'span'"
						:href="hasLink && !isEditing ? href : undefined"
						rel="nofollow noopener"
						target="_blank"
					>
						<img
							class="img-responsive content-image"
							:src="mediaItem.img_url"
							:alt="title"
							:title="title"
							@load="onImageLoad"
						/>
					</component>
				</template>
				<template v-else-if="hasError">
					<translate>Error loading media item.</translate>
				</template>
				<template v-else>
					<app-loading />
				</template>
			</div>
			<div v-if="isHydrated && hasLink && isEditing" class="link-overlay">
				<small>
					<external-link
						:href="href"
						class="link-overlay-display"
						v-app-tooltip="$gettext('This image is linked, click to open')"
					>
						<app-jolticon icon="link" />
						<span>{{ displayHref }}</span>
					</external-link>
				</small>
			</div>
			<span v-if="isHydrated && hasCaption" class="text-muted">
				<em>{{ caption }}</em>
			</span>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.media-item
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	cursor: default
	min-height: 44px // make sure the X button fits properly, usually not a problem unless the image is super wide

.media-item-container
	display: flex
	justify-content: center
	align-items: center
	rounded-corners-lg()
	overflow: hidden
	max-width: 100%
	position: relative
	transition: background-color 0.1s ease

// While the image is still loading, we show a dimmed background to better indicate the size of the placeholder
.media-item-container-placeholder
	change-bg('bg-offset')

.link-overlay
	position: absolute
	top: 8px
	left: 8px
	rounded-corners()
	change-bg('bg-offset')
	padding-left: 6px
	padding-right: 6px
	padding-top: 2px
	padding-bottom: 2px
	cursor: pointer
	opacity: 0.7
	transition: opacity 0.1 ease

	&:hover
		opacity: 1

	& a
		theme-prop('color', 'fg-offset')

.link-overlay-display
	vertical-align: middle

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

<script lang="ts" src="./media-item"></script>
