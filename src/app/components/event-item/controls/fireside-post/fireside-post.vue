<template>
	<span>
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
						<small class="text-muted">
							{{ post.like_count }}
						</small>
					</span>

					<div class="-inline-button" v-if="shouldShowCommentsButton">
						<app-button
							icon="comment"
							circle
							trans
							inset
							@click="openComments()"
							v-app-tooltip="$gettext('View Comments')"
						/>
						<small class="text-muted">
							{{ commentsCount | number }}
						</small>
					</div>

					<template v-if="shouldShowStickersButton">
						<app-button
							icon="sticker"
							circle
							trans
							inset
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

						<span class="-stickers-count text-muted">
							{{ post.stickers.length | number }}
						</span>

						&nbsp;
					</div>
				</div>
				<div class="-row -details text-muted">
					<a
						class="link-unstyled"
						@click="showLikers()"
						v-app-tooltip="$gettext(`View all people that liked this post`)"
					>
						<span>show likes</span>
					</a>

					<app-event-item-controls-fireside-post-stats :key="'stats'" class="-row" :post="post" />
				</div>
			</div>

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
		</div>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$-blip-margin = -4px

.-controls
	display: flex
	justify-content: flex-end
	// align-items: center

.-user-controls
	display: flex
	flex-direction: column
	flex-grow: 1

.-inline-button
	margin-right: 20px

.-stickers-container
	display: inline-flex

.-stickers
	cursor: pointer
	display: inline-flex
	align-items: center
	flex-direction: row
	padding: 0 8px
	margin-left: $-blip-margin

	&-count
		margin-left: 18px
		font-size: 11px
		font-weight: normal
		font-style: italic
		line-height: normal

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

.-row
	display: flex
	align-items: center
</style>

<script lang="ts" src="./fireside-post"></script>
