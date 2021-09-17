<script lang="ts" src="./badge"></script>

<template>
	<app-theme v-if="shouldDisplay" :theme="theme">
		<component :is="fireside && !fireside.is_expired ? 'router-link' : 'div'" :to="location">
			<div class="-fireside-badge fill-darkest">
				<div
					ref="badge"
					v-app-observe-dimensions="onBadgeDimensionsChanged"
					class="-fireside-badge-padding"
				>
					<app-media-item-backdrop
						v-if="headerMediaItem"
						class="-backdrop"
						:media-item="headerMediaItem"
						radius="lg"
					>
						<div
							class="-header"
							:style="{
								'background-image': 'url(' + headerMediaItem.mediaserver_url + ')',
							}"
						>
							<div class="-header-overlay" />
						</div>
					</app-media-item-backdrop>
					<div v-else class="-backdrop">
						<div class="-header -header-fill">
							<div class="-header-overlay" />
						</div>
					</div>

					<div class="-content">
						<div v-app-tooltip.left="avatarTooltip" class="-avatar">
							<app-user-avatar-img v-if="fireside" :user="fireside.user" />
						</div>
						<div>
							<div v-if="fireside && !fireside.is_expired">
								<span class="tag">
									<span class="-new-tag" />
									<translate
										:translate-n="fireside.member_count || 0"
										:translate-params="{
											count: number(fireside.member_count || 0),
										}"
										translate-plural="%{ count } Members"
									>
										%{ count } Member
									</translate>
								</span>

								<span v-if="fireside.is_draft" class="tag">
									<translate> Draft </translate>
								</span>

								<span
									v-if="
										fireside.primaryCommunityLink &&
										fireside.primaryCommunityLink.isFeatured
									"
									class="tag"
								>
									<translate> Featured </translate>
								</span>
							</div>
							<div class="-title">
								<template v-if="fireside && !fireside.is_expired">
									{{ fireside.title }}
								</template>
								<translate v-else>
									This fireside has expired. See you next time!
								</translate>
							</div>
						</div>
						<div v-if="fireside && isStreaming" class="-live">
							<translate>LIVE</translate>
						</div>
					</div>
				</div>

				<div v-if="canExpandPreview" class="-preview">
					<app-expand :when="showPreview">
						<div
							class="-preview-placeholder"
							:style="{ 'margin-top': -containerHeight + 'px' }"
						/>
					</app-expand>

					<app-fireside-stream-preview
						v-if="fireside && !fireside.is_expired"
						class="-preview-inner"
						:class="{ '-hidden': !showPreview }"
						:style="{ 'margin-top': -containerHeight + 'px' }"
						:fireside="fireside"
						:show-live="false"
						@changed="onFiresidePreviewChanged"
					/>
				</div>
			</div>
		</component>
	</app-theme>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-zindex-backdrop = 1
$-zindex-preview = 2
$-zindex-content = 3

.-backdrop
	// For some reason we need position static
	// so the backdrop can get the height.
	position: static
	z-index: $-zindex-backdrop

.-hidden
	display: none

.-preview
	position: relative
	z-index: $-zindex-preview

	.-preview-placeholder
		width: 100%
		padding-top: 56.25%

	.-preview-inner
		position: absolute
		top: 0
		right: 0
		left: 0

.-fireside-badge
	clearfix()
	full-bleed-xs()
	rounded-corners-lg()
	position: relative
	margin-bottom: $line-height-computed
	overflow: hidden
	elevate-hover-2()
	-webkit-transform: translateZ(0)

	&-padding
		padding: 10px 15px

	&:hover
		.-header
			background-size: 105% auto
			filter: blur(1px)

.-header
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	transition: background-size 250ms, filter 250ms

	&-overlay
		width: 100%
		height: 100%
		background: rgba(0, 0, 0, 0.6)

	&-fill
		change-bg('backlight')

.-content
	position: relative
	z-index: $-zindex-content
	display: flex
	align-items: center

.-title
	line-clamp(2)
	font-weight: bolder
	font-size: $font-size-h4
	text-shadow: 1px 1px 3px $black

.-avatar
	width: 50px
	height: 50px
	background-color: var(--theme-white)
	border-radius: 50%
	padding: 2px
	margin-right: ($grid-gutter-width / 4)
	flex-shrink: 0

	img
		display: block
		width: 100%
		height: 100%
		img-circle()

.-new-tag
	display: inline-block
	width: 8px
	height: 8px
	border-radius: 50%
	border-color: var(--theme-dark)
	border-width: 1px
	border-style: solid
	change-bg('highlight')

.-live
	rounded-corners-lg()
	margin: 0 0 0 auto
	padding: 4px 8px
	font-size: $font-size-h2
	font-weight: 700
	font-family: $font-family-heading
	text-shadow: none
	box-shadow: 1px 1px 3px $black
	letter-spacing: 2px
	color: $white
	background-color: $gj-overlay-notice
</style>
