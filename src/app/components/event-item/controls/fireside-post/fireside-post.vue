<template>
	<div class="-controls">
		<div class="-user-controls" v-if="showUserControls">
			<div class="-row">
				<span class="-inline-button">
					<app-fireside-post-like-widget
						class="-like"
						:post="post"
						trans
						inset
						hide-blip
						@change="emitLikeChange"
					/>
					<a
						class="link-muted"
						@click="showLikers()"
						v-app-tooltip="$gettext(`View all people that liked this post`)"
					>
						<div class="-button-info" :class="{ '-liked': post.user_like }">
							<small>
								{{ post.like_count }}
							</small>
						</div>
					</a>
				</span>

				<div class="-inline-button" v-if="shouldShowCommentsButton">
					<app-button
						icon="comment"
						circle
						trans
						@click="openComments()"
						v-app-tooltip="$gettext('View Comments')"
					/>

					<div v-if="commentsCount > 0" class="-button-info">
						<small class="text-muted">
							{{ commentsCount }}
						</small>
					</div>
					<template v-else>
						&nbsp;
					</template>
				</div>

				<template v-if="shouldShowStickersButton">
					<app-button
						icon="sticker"
						circle
						trans
						@click="placeSticker()"
						v-app-tooltip="$gettext('Place Sticker')"
						v-app-auth-required
					/>

					&nbsp;
				</template>

				<div
					v-if="shouldShowStickersBar"
					class="-stickers"
					:class="{ blip: showStickers }"
					@click.stop="onClickShowStickers"
					v-app-tooltip="$gettext(`Toggle Stickers`)"
				>
					<span v-if="showStickers" class="blip-caret"></span>

					<span v-for="sticker of previewStickers" :key="sticker.id" class="-sticker">
						<img :src="sticker.img_url" />
					</span>

					<small class="-stickers-count text-muted">
						{{ post.stickers.length | number }}
					</small>
				</div>
			</div>
			<app-event-item-controls-fireside-post-stats
				:key="'stats'"
				class="-row -details text-muted"
				:post="post"
			/>
		</div>
		<span class="-extra">
			<app-event-item-controls-fireside-post-extra
				v-if="shouldShowExtra"
				:post="post"
				@remove="emitRemove"
				@feature="emitFeature"
				@unfeature="emitUnfeature"
				@move-channel="emitMoveChannel"
				@reject="emitReject"
				@pin="emitPin"
				@unpin="emitUnpin"
			/>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-controls
	display: flex

.-row
	display: flex
	align-items: center

.-user-controls
	display: flex
	flex-direction: column
	flex-grow: 1

.-inline-button
	display: inline-flex
	align-items: center

	.-like >>> .button
		width: 36px
		height: 36px

	.-button-info
		display: flex
		align-items: center
		min-width: 32px
		height: 36px
		padding-left: 4px
		padding-right: 8px
		font-weight: 700

		&.-liked
			theme-prop('color', 'bi-bg', true)

.-stickers-container
	display: inline-flex

.-stickers
	cursor: pointer
	display: inline-flex
	align-items: center
	flex-direction: row
	padding: 0 8px
	margin: 0
	top: 0
	border-radius: 20px

	&:hover
		change-bg('bg-offset')

	&.blip
		change-bg('bi-bg')

		.blip-caret
			theme-prop('border-right-color', 'bi-bg')

		small
			theme-prop('color', 'bg-offset')

	&-count
		margin-left: 18px
		font-weight: normal

	small
		font-weight: 700

.-sticker
	width: 24px
	height: 24px
	position: relative
	margin-right: -14px
	display: inline-block

	& > img
		display: block
		width: 100%
		height: 100%
		filter: drop-shadow(1px 0 #fff) drop-shadow(-1px 0 #fff)

.-details
	font-size: 11px
	margin-top: 8px

.-extra
	margin-left: auto
</style>

<script lang="ts" src="./fireside-post"></script>
