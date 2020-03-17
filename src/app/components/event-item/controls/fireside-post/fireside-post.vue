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
</style>

<script lang="ts" src="./fireside-post"></script>
