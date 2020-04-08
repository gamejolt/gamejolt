<template>
	<div class="-user-controls">
		<div class="-row">
			<div v-if="showUserControls" class="-row">
				<span class="-inline-button">
					<app-fireside-post-like-widget :post="post" trans hide-blip @change="emitLikeChange" />
					<a
						class="blip-alt"
						:class="{ liked: post.user_like }"
						@click="showLikers()"
						v-app-tooltip="$gettext(`View all people that liked this post`)"
					>
						{{ post.like_count | number | fuzzynumber }}
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

					<span v-if="commentsCount > 0" class="blip-alt">
						{{ commentsCount | number | fuzzynumber }}
					</span>
					<span v-else class="-spacing-right" />
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

.-user-controls
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
	padding-right: 4px
	padding-left: 6px
	border-radius: 20px

	&:hover
		change-bg('bg-offset')

		.-caret
			theme-prop('border-right-color', 'bg-offset')

	&.-showing
		change-bg('bi-bg')

		&:hover
			.-caret
				theme-prop('border-right-color', 'bi-bg')

		.-caret
			theme-prop('border-right-color', 'bi-bg')

		small
			theme-prop('color', 'bg-offset')

	&-count
		margin-left: 18px
		font-weight: 700

	.-caret
			caret(direction: left, color: $trans, size: 5px)
			left: -3px

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

.-spacing
	&-top
		margin-top: 12px
	&-right
		margin-right: 8px

.-extra
	margin-left: auto

	.-inline-button
		margin-left: 12px
</style>

<script lang="ts" src="./fireside-post"></script>
