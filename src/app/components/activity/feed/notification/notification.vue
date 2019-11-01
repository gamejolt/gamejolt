<template>
	<div>
		<div class="notification-item">
			<div @click.stop="go" class="notification-container">
				<router-link :to="notification.routeLocation">
					<app-timeline-list-item :is-new="isNew">
						<div slot="bubble" v-if="notification.from_model">
							<app-user-card-hover
								:user="notification.from_model"
								:disabled="!feed.shouldShowUserCards"
							>
								<app-user-avatar :user="notification.from_model" />
							</app-user-card-hover>
						</div>
						<div
							slot="bubble"
							v-else-if="notification.type === Notification.TYPE_POST_FEATURED_IN_COMMUNITY"
						>
							<div class="-community-thumb">
								<app-community-thumbnail-img
									class="img-circle"
									:community="notification.action_model.community"
								/>
							</div>
						</div>
						<div
							slot="bubble"
							v-else-if="
								notification.type === Notification.TYPE_GAME_TROPHY_ACHIEVED ||
									notification.type === Notification.TYPE_SITE_TROPHY_ACHIEVED
							"
						>
							<img class="img-circle -trophy-img" :src="trophyImg" />
						</div>

						<div class="-container">
							<div class="-main">
								<div
									class="timeline-list-item-title timeline-list-item-title-small"
									v-html="titleText"
								/>

								<div class="timeline-list-item-meta">
									<app-time-ago :date="notification.added_on" />
								</div>

								<div class="timeline-list-item-details" v-if="hasDetails">
									<div class="timeline-list-item-content">
										<app-fade-collapse
											:collapse-height="160"
											:is-open="false"
											@require-change="canToggleContent = $event"
										>
											<app-content-viewer
												v-if="
													notification.type === 'comment-add' ||
														notification.type === 'comment-add-object-owner'
												"
												:source="notification.action_model.comment_content"
											/>
											<app-content-viewer
												v-else-if="notification.type === 'mention'"
												:source="notification.action_model.comment.comment_content"
											/>
											<span
												v-else-if="
													notification.type === Notification.TYPE_POST_FEATURED_IN_COMMUNITY
												"
											>
												{{ notification.action_model.fireside_post.lead_snippet }}
											</span>
											<span
												v-else-if="
													notification.type === Notification.TYPE_GAME_TROPHY_ACHIEVED ||
														notification.type === Notification.TYPE_SITE_TROPHY_ACHIEVED
												"
											>
												{{ notification.action_model.trophy.description }}
											</span>
										</app-fade-collapse>
									</div>
								</div>
							</div>
						</div>

						<div class="-overlay"></div>
					</app-timeline-list-item>
				</router-link>
			</div>
			<div class="-actions" v-if="isNew">
				<a @click.stop.prevent="onMarkRead">
					<app-jolticon icon="radio-circle" v-app-tooltip="$gettext(`Mark as Read`)" />
				</a>
			</div>
		</div>

		<div class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
.notification-item
	display: flex

.notification-container
	flex-grow: 1
	position: relative
	max-width: 100%

.-container
	display: flex

.-main
	flex: auto
	max-width: 100%
	padding-right: 10px

.-actions
	margin-left: 10px

// This overlay will capture all clicks.
// This prevents other links within the element to activate, and also prevents opening hover targets, like poppers.
// Due to the @click.stop on the main container, the clicks to this will navigate.
.-overlay
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-community-thumb
	position: absolute
	width: 100%
	height: 100%
	top: 0
	left: 0

	> img
		width: 100%
		height: 100%

.-trophy-img
	display: block
	width: 100%
	height: 100%

</style>

<script lang="ts" src="./notification"></script>
