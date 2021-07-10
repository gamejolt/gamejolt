<script lang="ts" src="./card"></script>

<template>
	<div v-if="post" class="post-card">
		<app-responsive-dimensions :ratio="aspectRatio" @change="calcData()">
			<app-scroll-inview
				:config="InviewConfig"
				:style="{
					width: cardWidth,
					height: cardHeight,
					'padding-top': GJ_IS_SSR ? (1 / aspectRatio) * 100 + '%' : null,
				}"
				@inview="inView"
				@outview="outView"
			>
				<div ref="card" class="-inner">
					<template v-if="!!mediaItem">
						<div class="-inner-media">
							<app-media-item-backdrop class="-backdrop" :media-item="mediaItem">
								<app-img-responsive
									class="-img"
									:src="mediaItem.mediaserver_url"
									alt=""
									:style="{
										width: imageWidth,
										height: imageHeight,
									}"
								/>
							</app-media-item-backdrop>

							<template v-if="videoController && isHydrated">
								<app-video
									class="-video"
									:player="videoController"
									allow-degraded-autoplay
									:style="{
										width: videoWidth,
										height: videoHeight,
									}"
								/>

								<div v-if="videoController.isLoading" class="-overlay">
									<app-loading no-color hide-label stationary />
								</div>
							</template>
						</div>
						<div class="-inner-gradient" />
					</template>

					<app-content-viewer v-else class="-inner-message" :source="post.lead_content" />

					<router-link class="-link" tag="div" :to="post.routeLocation" />

					<div class="-details" :class="{ '-light': !!mediaItem }">
						<template v-if="withUser">
							<app-user-avatar class="-details-user-avatar" :user="post.user" />
							<a class="-details-user-name" :href="userLink">
								@{{ post.user.username }}
							</a>
						</template>

						<span class="-details-spacer" />

						<template v-if="post.scheduled_for">
							<app-jolticon icon="calendar" />
						</template>

						<template v-if="post.hasPoll">
							<app-jolticon
								icon="pedestals-numbers"
								:style="{ color: pollIconColor }"
							/>
						</template>

						<template v-if="post.is_pinned">
							<app-jolticon icon="thumbtack" />
						</template>

						<app-jolticon icon="heart-filled" :style="{ color: heartIconColor }" />
						<span class="-details-likes">
							{{ fuzzynumber(post.like_count) }}
						</span>
					</div>
				</div>
			</app-scroll-inview>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'

$-base-width = 200px
$-padding = 8px

.-inner
	&
	&-media
		position: absolute
		left: 0
		top: 0
		right: 0
		bottom: 0

	&-media
		display: grid
		justify-content: center

	&-gradient
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		background: linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))

	&-message
		position: absolute
		left: $-padding
		top: $-padding
		right: $-padding
		bottom: $-padding
		font-size: 30

.-light
	&
	> *
		color: var(--theme-white) !important
		text-shadow: black 1px 1px 4px

.-link
	rounded-corners-lg()
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	border: solid $border-width-base transparent

.-details
	position: absolute
	left: $-padding
	bottom: $-padding
	right: $-padding
	display: flex
	font-size: 13px
	font-weight: bold

	> *
		color: var(--theme-fg)

		&:not(&:last-child)
			margin-right: $-padding * 0.5

	> .jolticon
		justify-self: flex-end

	> .jolticon
	&-user-avatar
		flex: none
		width: 20px
		height: 20px

	&-user-name
		overflow: hidden
		text-overflow: ellipsis
		padding-right: $-padding * 0.5m
		margin-right: 0 !important
		white-space: nowrap

	&-spacer
		flex: auto

.-backdrop
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	display: flex
	align-items: center
	justify-content: center

.-img
	max-width: unset
	object-fit: cover

.-video
	display: flex
	justify-content: center
	align-items: center

	>>> > video
		height: 100% !important
		width: 100% !important

.-overlay
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	background-color: rgba(0, 0, 0, 0.45)
	display: flex
	justify-content: center
	align-items: center
</style>
