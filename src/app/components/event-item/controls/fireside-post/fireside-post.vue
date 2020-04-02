<template>
	<span>
		<app-event-item-controls-fireside-post-stats
			v-if="shouldShowStatsInNewLine"
			:key="'stats'"
			class="-stats-newline well fill-offset full-bleed-xs"
			:post="post"
		/>

		<div class="-controls">
			<div class="-user-controls" v-if="showUserControls">
				<app-fireside-post-like-widget :post="post" trans @change="emitLikeChange" />

				&nbsp;

				<template v-if="shouldShowCommentsButton">
					<app-button
						icon="comment"
						circle
						trans
						@click="openComments()"
						v-app-tooltip="$gettext('View Comments')"
					/>

					<span class="blip" v-if="commentsCount > 0" @click.stop="openComments()">
						<span class="blip-caret"></span>
						<span class="blip-count">
							{{ commentsCount | number }}
						</span>
					</span>

					&nbsp;
				</template>

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
			</div>

			<app-event-item-controls-fireside-post-stats
				v-if="!shouldShowStatsInNewLine"
				:key="'stats'"
				class="-stats-inline"
				:post="post"
			/>

			<span>
				<template v-if="shouldShowEdit">
					<app-button v-if="canPublish" class="-inline-button" primary @click="publish()">
						<translate>Publish</translate>
					</app-button>
					<app-button class="-inline-button" @click="openEdit()">
						<translate>Edit</translate>
					</app-button>
				</template>

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

		<div
			v-if="shouldShowStickersBar"
			class="-stickers"
			@click.stop="onClickShowStickers"
			v-app-tooltip="$gettext(`Toggle Stickers`)"
		>
			<span class="-stickers-count blip">
				<span class="blip-caret"></span>
				<span class="blip-count">
					{{ post.stickers.length | number }}
				</span>
			</span>
			&nbsp;

			<span v-for="sticker of previewStickers" :key="sticker.id" class="-sticker">
				<img :src="sticker.img_url" />
			</span>
		</div>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-stats
	&-newline, &-inline
		color: var(--theme-fg-muted)
		font-size: $font-size-small

	&-newline
		text-align: center
		margin-bottom: 10px

	&-inline
		flex: auto

.-controls
	display: flex
	justify-content: flex-end
	align-items: center

.-user-controls
	flex-grow: 1

.-inline-button
	margin-right: 10px

.-stickers
	cursor: pointer
	margin-top: 16px
	display: inline-flex
	align-items: center
	flex-direction: row-reverse

	&-count
		margin-left: 16px

.-sticker
	width: 24px
	height: 24px
	position: relative
	margin-right: -10px
	display: inline-block

	& > img
		display: block
		width: 100%
		height: 100%

</style>

<script lang="ts" src="./fireside-post"></script>
