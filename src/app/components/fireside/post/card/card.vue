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
									:should-play="shouldPlayVideo"
									allow-degraded-autoplay
									:style="{
										width: videoWidth,
										height: videoHeight,
									}"
								/>
							</template>
						</div>
						<div class="-inner-gradient" />
					</template>

					<template v-else>
						<app-fade-collapse
							class="-inner-message"
							:collapse-height="leadHeight"
							ignore-threshold
							size="sm"
						>
							<app-content-viewer :source="post.lead_content" />
						</app-fade-collapse>
					</template>

					<router-link
						class="-link"
						:to="post.routeLocation"
						@click.native="trackPostOpen()"
					/>

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
								:class="{ '-voted': votedOnPoll }"
								icon="pedestals-numbers"
							/>
						</template>

						<template v-if="post.is_pinned">
							<app-jolticon icon="thumbtack" />
						</template>

						<app-jolticon icon="heart-filled" :class="{ '-liked': likedPost }" />
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

		>>> .fireside-post-lead-content
			font-size: ceil($font-size-base * 1.1)

.-light
	&
	> *
		color: var(--theme-white) !important
		text-shadow: black 1px 1px 4px

.-voted
.-liked
	color: $gj-overlay-notice !important

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
</style>
