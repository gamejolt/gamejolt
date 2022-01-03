<script lang="ts" src="./controls"></script>

<template>
	<div>
		<app-sticker-controls-overlay end>
			<div class="post-controls">
				<div class="-row">
					<div v-if="showUserControls" class="-row">
						<app-fireside-post-like-widget
							v-if="shouldShowLike"
							:post="post"
							:location="location"
							trans
							@change="setUserFollow"
						/>

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
								{{ formatFuzzynumber(commentsCount) }}
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
					<div v-else-if="post.is_processing" class="-row fill-offset -processing">
						<app-post-controls-save-progress :post="post" />
					</div>
					<span v-if="shouldShowExtra" class="-extra">
						<span v-if="shouldShowEdit && !showUserControls" class="-extra">
							<app-button
								v-if="canPublish"
								class="-inline-button"
								primary
								@click="publish()"
							>
								<translate>Publish</translate>
							</app-button>
							<app-button class="-inline-button" @click="openEdit()">
								<translate>Edit</translate>
							</app-button>

							<span class="-spacing-right" />
						</span>

						<app-post-controls-more
							:post="post"
							@remove="emitPostRemove"
							@feature="emitPostFeature"
							@unfeature="emitPostUnfeature"
							@move-channel="emitPostMoveChannel"
							@reject="emitPostReject"
							@pin="emitPostPin"
							@unpin="emitPostUnpin"
						/>
					</span>
				</div>

				<div
					class="-row small"
					:class="{ '-spacing-top': shouldShowEdit, tiny: Screen.isXs }"
				>
					<app-post-controls-stats :key="'stats'" class="text-muted" :post="post" />

					<span v-if="shouldShowEdit && showUserControls" class="-extra">
						<app-button
							v-if="canPublish"
							class="-inline-button"
							primary
							@click="publish()"
						>
							<translate>Publish</translate>
						</app-button>
						<app-button class="-inline-button" @click="openEdit()">
							<translate>Edit</translate>
						</app-button>
					</span>
				</div>
			</div>
		</app-sticker-controls-overlay>

		<app-post-controls-user-follow
			:post="post"
			:should-show="isShowingFollow"
			@close="onUserFollowDismissal"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.post-controls
	display: flex
	flex-direction: column
	flex-grow: 1

	.-row
		display: flex
		align-items: center

	.-processing
		padding: 8px
		rounded-corners()

	.-inline-button
		display: inline-flex
		align-items: center

	.-extra
		margin-left: auto
		flex-shrink: 0

		.-inline-button
			margin-left: 12px

	.-spacing
		&-top
			margin-top: 12px

		&-right
			margin-right: 8px
</style>
