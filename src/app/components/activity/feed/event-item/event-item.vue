<script lang="ts" src="./event-item"></script>

<template>
	<div v-app-observe-dimensions="onResize" class="-container">
		<app-activity-feed-event-item-blocked
			v-if="shouldBlock"
			:username="user.username"
			@show="onUnhideBlock"
		/>
		<div
			v-else
			class="-item"
			:class="{
				'-new': isNew,
			}"
			@click.capture="onClickCapture"
			@click="onClick"
		>
			<div v-if="user" class="-header">
				<div class="-header-content">
					<app-user-card-hover :user="user" :disabled="!feed.shouldShowUserCards">
						<div class="-header-avatar">
							<div class="-header-avatar-inner">
								<app-user-avatar :user="user" />
							</div>
						</div>
					</app-user-card-hover>

					<div class="-header-byline">
						<div class="-header-byline-name">
							<strong>
								<router-link
									class="link-unstyled"
									:to="{
										name: 'profile.overview',
										params: { username: user.username },
									}"
								>
									{{ user.display_name }}
									<app-user-verified-tick :user="user" />
								</router-link>
							</strong>

							<small class="text-muted">
								<router-link
									class="link-unstyled"
									:to="{
										name: 'profile.overview',
										params: { username: user.username },
									}"
								>
									@{{ user.username }}
								</router-link>
							</small>
						</div>

						<div v-if="game && !feed.hideGameInfo" class="-header-byline-game">
							<strong class="text-muted">
								<router-link :to="gameUrl" class="link-unstyled">
									{{ game.title }}
								</router-link>
							</strong>
						</div>
					</div>
				</div>
				<div class="-header-meta small text-muted">
					<app-user-follow-widget
						v-if="shouldShowFollow"
						class="-header-meta-follow"
						:user="user"
						:sm="Screen.isXs"
						hide-count
						event-label="feed"
					/>

					<span>
						<span v-if="shouldShowIsPinned" class="tag">
							<app-jolticon icon="thumbtack" />
							<translate>Pinned</translate>
						</span>
						<app-activity-feed-event-item-time
							v-if="shouldShowDate"
							:event-item="eventItem"
							:post="post"
							:link="linkResolved"
						/>
					</span>
				</div>
			</div>

			<template v-if="post">
				<app-activity-feed-devlog-post-video
					v-if="post.hasVideo"
					:item="item"
					:post="post"
					@query-param="onQueryParam"
				/>

				<app-activity-feed-devlog-post-sketchfab
					v-if="post.hasSketchfab"
					:item="item"
					:post="post"
					@click.native.stop
				/>

				<app-activity-feed-devlog-post-media
					v-if="post.hasMedia"
					:item="item"
					:post="post"
					:can-place-sticker="canPlaceSticker"
				/>

				<div ref="sticker-scroll" />

				<app-sticker-target
					:controller="stickerTargetController"
					:disabled="!canPlaceSticker"
				>
					<!--
					This shouldn't ever really show a collapser. It's for the jokers that think it would
					be fun to make a post with a bunch of new lines.
					-->
					<app-fade-collapse
						:collapse-height="400"
						:is-open="isLeadOpen"
						:animate="false"
						@require-change="canToggleLeadChanged"
					>
						<app-content-viewer
							class="fireside-post-lead"
							:source="post.lead_content"
						/>
					</app-fade-collapse>
				</app-sticker-target>

				<a v-if="canToggleLead" class="hidden-text-expander" @click="toggleLead()" />

				<app-sticker-controls-overlay>
					<app-fireside-post-embed
						v-for="embed of post.embeds"
						:key="embed.id"
						:embed="embed"
					/>

					<app-activity-feed-devlog-post-text
						v-if="post.has_article"
						:item="item"
						:post="post"
					/>

					<div v-if="post.hasPoll" class="-poll" @click.stop>
						<app-poll-voting :poll="post.poll" :game="post.game" :user="post.user" />
					</div>

					<div
						v-if="post.sticker_counts.length"
						class="-reactions-container -controls-buffer"
						@click.stop
					>
						<app-sticker-reactions
							:controller="stickerTargetController"
							@show="scrollToStickers()"
						/>
					</div>

					<app-scroll-scroller
						v-if="shouldShowCommunities"
						class="-communities -controls-buffer"
						horizontal
					>
						<app-community-pill
							v-for="postCommunity of communities"
							:key="postCommunity.id"
							:community-link="postCommunity"
						/>
					</app-scroll-scroller>
				</app-sticker-controls-overlay>
			</template>

			<app-event-item-controls
				class="-controls"
				:post="post"
				:feed="feed"
				:item="item"
				show-comments
				event-label="feed"
				@post-edit="onPostEdited(eventItem)"
				@post-publish="onPostPublished(eventItem)"
				@post-remove="onPostRemoved(eventItem)"
				@post-feature="onPostFeatured(eventItem, $event)"
				@post-unfeature="onPostUnfeatured(eventItem, $event)"
				@post-move-channel="onPostMovedChannel(eventItem, $event)"
				@post-reject="onPostRejected(eventItem, $event)"
				@post-pin="onPostPinned(eventItem)"
				@post-unpin="onPostUnpinned(eventItem)"
				@sticker="scrollToStickers()"
			/>
		</div>
	</div>
</template>

<style lang="stylus" src="./event-item.styl" scoped></style>
