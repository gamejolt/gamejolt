<template>
	<div class="event-item-controls-fireside-post">
		<app-fireside-post-controls-overlay end>
			<div class="-row">
				<div v-if="showUserControls" class="-row">
					<app-fireside-post-like-widget :post="post" trans @change="emitLikeChange" />

					<div v-if="shouldShowCommentsButton" class="-inline-button">
						<app-button
							icon="comment"
							circle
							trans
							@click="openComments()"
							v-app-tooltip="$gettext('View Comments')"
						/>

						<a
							v-if="commentsCount > 0"
							class="blip"
							:class="{ mobile: Screen.isXs }"
							@click="openComments()"
						>
							{{ commentsCount | fuzzynumber }}
						</a>
						<span v-else class="blip-missing" />
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
						:class="{ '-showing': showStickers }"
						@click.stop="onClickShowStickers"
						v-app-tooltip="$gettext(`Toggle Stickers`)"
					>
						<span class="-caret"></span>

						<span v-for="sticker of previewStickers" :key="sticker.id" class="-sticker">
							<img :src="sticker.img_url" />
						</span>

						<small class="-stickers-count text-muted">
							{{ post.stickers.length | number }}
						</small>
					</div>
				</div>
				<span v-if="shouldShowExtra" class="-extra">
					<span v-if="shouldShowEdit && !showUserControls" class="-extra">
						<app-button v-if="canPublish" class="-inline-button" primary @click="publish()">
							<translate>Publish</translate>
						</app-button>
						<app-button class="-inline-button" @click="openEdit()">
							<translate>Edit</translate>
						</app-button>

						<span class="-spacing-right" />
					</span>

					<app-event-item-controls-fireside-post-extra
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
		</app-fireside-post-controls-overlay>

		<div class="-row small" :class="{ '-spacing-top': shouldShowEdit, tiny: Screen.isXs }">
			<app-event-item-controls-fireside-post-stats :key="'stats'" class="text-muted" :post="post" />

			<span v-if="shouldShowEdit && showUserControls" class="-extra">
				<app-button v-if="canPublish" class="-inline-button" primary @click="publish()">
					<translate>Publish</translate>
				</app-button>
				<app-button class="-inline-button" @click="openEdit()">
					<translate>Edit</translate>
				</app-button>
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.event-item-controls-fireside-post
	display: flex
	flex-direction: column
	flex-grow: 1

	.-row
		display: flex
		align-items: center

	.-inline-button
		display: inline-flex
		align-items: center

	.-stickers
		pressy()
		cursor: pointer
		position: relative
		display: inline-flex
		align-items: center
		flex-direction: row
		padding: 2px 4px 2px 6px
		border-radius: 20px
		will-change: transform

		&:hover
			change-bg('bg-offset')

			.-caret
				border-right-color: var(--theme-bg-offset)

		&-count
			margin-left: 18px
			font-weight: 700

		&.-showing
			change-bg('bi-bg')

			&:hover
				.-caret
					border-right-color: var(--theme-bi-bg)

			.-caret
				border-right-color: var(--theme-bi-bg)

			small
				color: var(--theme-bi-fg)


		.-caret
			caret(direction: left, color: $trans, size: 5px)
			left: -3px

	.-sticker
		width: 20px
		height: 20px
		position: relative
		margin-right: -10px
		display: inline-block

		& > img
			display: block
			width: 100%
			height: 100%
			filter: drop-shadow(1px 1px 0 white) drop-shadow(-1px 1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px -1px 0 white)

	.-extra
		margin-left: auto

		.-inline-button
			margin-left: 12px

	.-spacing
		&-top
			margin-top: 12px
		&-right
			margin-right: 8px

</style>

<script lang="ts" src="./fireside-post"></script>
