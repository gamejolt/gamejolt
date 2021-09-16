<script lang="ts" src="./teaser"></script>

<template>
	<div class="fireside-teaser">
		<router-link
			v-app-tooltip="`${fireside.user.display_name} (@${fireside.user.username})`"
			class="-link"
			:to="fireside.location"
		/>

		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<div v-if="isLive" class="-avatar-anim" />

					<app-media-item-backdrop
						class="-avatar-img"
						:media-item="fireside.user.avatar_media_item"
					>
						<app-user-avatar-img :user="fireside.user" />
					</app-media-item-backdrop>

					<app-popper v-if="canModerate" class="-extras" popover-class="fill-darkest">
						<template #default>
							<app-jolticon icon="cog" />
						</template>

						<template #popover>
							<div class="list-group list-group-dark">
								<div v-for="(i, index) in manageableCommunities" :key="i.id">
									<hr v-if="index !== 0" />

									<h5 class="-extras-header list-group-item has-icon">
										<app-community-thumbnail-img :community="i.community" />
										{{ i.community.name }}
									</h5>

									<a class="list-group-item has-icon" @click="toggleFeatured(i)">
										<app-jolticon icon="star" />

										<translate v-if="i.isFeatured">
											Unfeature fireside
										</translate>
										<translate v-else>Feature fireside</translate>
									</a>

									<a class="list-group-item has-icon" @click="ejectFireside(i)">
										<app-jolticon icon="eject" />

										<translate>Eject fireside</translate>
									</a>
								</div>
							</div>
						</template>
					</app-popper>
				</div>
			</div>

			<div class="-tag" :class="{ '-live': isLive }">
				<app-jolticon v-if="isFeaturedInCommunity" icon="star" />

				<translate v-if="isLive">LIVE</translate>
				<translate v-else>CHAT</translate>
			</div>
		</div>

		<div class="-title">
			{{ title }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-avatar-size = 80px
$-tag-font-size = $font-size-tiny
$-tag-padding-vertical = 2px
$-tag-padding-horizontal = 6px
$-tag-offset = ($-tag-font-size * 0.5) + ($-tag-padding-vertical * 2)
$-anim-size = 8px
$-border-color = var(--theme-fg)

.fireside-teaser
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	color: var(--theme-fg)

	&:hover
		.-extras
			visibility: visible
			opacity: 1

.-link
	position: absolute
	inset: 0
	z-index: 1

.-header
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	margin-bottom: $-tag-offset + 4px
	width: 100%

.-avatar
	width: 100%
	flex: none

	&
	&-inner
	&-img
		img-circle()

	&-inner
		padding-top: 100%
		position: relative

	&-img
		background-color: var(--theme-bg)
		border: $border-width-large solid $-border-color
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0

.-avatar-anim
	img-circle()
	position: absolute
	animation-name: live-splash
	animation-duration: 1s
	animation-iteration-count: infinite
	animation-timing-function: $weak-ease-out
	will-change: inset, background-color, opacity

.-extras
	img-circle()
	elevate-1()
	background-color: var(--theme-bg-subtle)
	position: absolute
	top: 0
	right: 0
	display: flex
	padding: 4px
	visibility: hidden
	opacity: 0
	will-change: visibility, opacity
	z-index: 2
	cursor: pointer

	&:hover
		background-color: var(--theme-link)
		color: var(--theme-link-hover)

	&-header
		font-family: $font-family-heading
		font-size: $font-size-tiny
		font-weight: normal
		letter-spacing: 0.1em
		line-height: 1
		text-transform: uppercase
		margin-top: 0
		margin-bottom: 0

		img
			width: $list-group-icon-width * 0.8
			height: $list-group-icon-width * 0.8
			border-radius: 50%
			display: inline-block
			position: relative
			left: -($list-group-icon-width - 1px)
			top: -2px
			margin-right: -($list-group-icon-width - 5px)

	.jolticon
		margin: 0

.-tag
	rounded-corners()
	elevate-1()
	padding: $-tag-padding-vertical $-tag-padding-horizontal
	font-weight: 700
	letter-spacing: 1px
	background-color: var(--theme-bg-offset)
	font-size: $-tag-font-size
	position: absolute
	bottom: -($-tag-offset)

	&.-live
		background-color: $gj-overlay-notice
		color: $white

	.jolticon
		font-size: $-tag-font-size
		margin: 0

.-title
	line-clamp(2)
	width: 100%
	font-weight: 700
	font-size: $font-size-small
	text-align: center
	color: var(--theme-fg)

@keyframes live-splash
	0%
		animation-timing-function: $strong-ease-out
		background-color: $-border-color
		inset: 0
		opacity: 1

	10%
		animation-timing-function: $strong-ease-out
		background-color: $-border-color

	20%
		animation-timing-function: $strong-ease-out
		background-color: $-border-color
		inset: -($-anim-size * 0.2)
		opacity: 1

	25%
		background-color: var(--theme-link)

	100%
		background-color: var(--theme-link)
		opacity: 0
		inset: -($-anim-size)
</style>
