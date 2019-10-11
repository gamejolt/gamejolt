<template>
	<!--
		We don't want it clicking into the post when clicking a control.
	-->
	<span @click.stop>
		<div class="-controls">
			<div class="-user-controls" v-if="showUserControls">
				<app-fireside-post-like-widget :post="post" :show-user-follow="showUserFollow" trans />

				&nbsp;

				<template v-if="shouldShowCommentsButton">
					<app-button
						icon="comment"
						circle
						trans
						@click="openComments()"
						v-app-tooltip="$gettext('View Comments')"
					/>

					<span class="blip" v-if="commentsCount > 0">
						<span class="blip-caret"></span>
						<span class="blip-count">
							{{ commentsCount | number }}
						</span>
					</span>

					&nbsp;
				</template>

				<app-popper @show="isShowingShare = true" @hide="isShowingShare = false">
					<app-button icon="share-airplane" circle trans v-app-tooltip="$gettext('Share')" />

					<div slot="popover" class="well fill-darkest sans-margin" v-if="isShowingShare">
						<div class="social-widgets" v-if="!GJ_IS_CLIENT">
							<app-social-twitter-share :url="shareUrl" :content="post.leadStr" />

							<span class="dot-separator"></span>

							<app-social-facebook-like :url="shareUrl" />
						</div>

						<app-button block @click="copyShareUrl">
							<translate>Copy Permalink</translate>
						</app-button>
					</div>
				</app-popper>
			</div>

			<div class="-stats" v-if="shouldShowStats">
				<translate
					:translate-n="post.view_count || 0"
					:translate-params="{ count: number(post.view_count || 0) }"
					translate-plural="%{ count } views"
				>
					%{ count } view
				</translate>

				<span class="dot-separator" />

				<translate
					:translate-n="post.expand_count || 0"
					:translate-params="{ count: number(post.expand_count || 0) }"
					translate-plural="%{ count } expands"
				>
					%{ count } expand
				</translate>

				<span
					class="hidden-xs"
					v-app-tooltip="
						$gettext(
							'An expand is some sort of interaction with your post. For example, playing a video post, or clicking into your post.'
						)
					"
				>
					<app-jolticon icon="help-circle" />
				</span>
			</div>

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
				/>
			</span>
		</div>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-controls
	display: flex
	justify-content: flex-end
	align-items: center

.-user-controls
	flex-grow: 1

.-stats
	color: var(--theme-fg-muted)
	font-size: $font-size-small
	flex: auto

.-inline-button
	margin-right: 10px
</style>

<script lang="ts" src="./fireside-post"></script>
