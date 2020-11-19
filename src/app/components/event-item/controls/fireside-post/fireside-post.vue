<script lang="ts" src="./fireside-post"></script>

<template>
	<div class="event-item-controls-fireside-post">
		<div class="-row">
			<div v-if="showUserControls" class="-row">
				<app-fireside-post-like-widget :post="post" trans @change="emitLikeChange" />

				<div v-if="shouldShowCommentsButton" class="-inline-button">
					<app-button
						v-app-tooltip="$gettext('View Comments')"
						icon="comment"
						circle
						trans
						@click="openComments()"
					/>

					<a
						v-if="commentsCount > 0"
						class="blip"
						:class="{ mobile: Screen.isXs }"
						@click="openComments()"
					>
						{{ fuzzynumber(commentsCount) }}
					</a>
					<span v-else class="blip-missing" />
				</div>

				<app-button
					v-if="shouldShowStickersButton"
					v-app-tooltip="$gettext('Place Sticker')"
					v-app-auth-required
					icon="sticker"
					circle
					trans
					@click="placeSticker()"
				/>
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
			<app-event-item-controls-fireside-post-stats
				:key="'stats'"
				class="text-muted"
				:post="post"
			/>

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
@import '~styles/variables'
@import '~styles-lib/mixins'

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
