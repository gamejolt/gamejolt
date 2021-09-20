<script lang="ts" src="./notification"></script>

<template>
	<div>
		<template v-if="shouldShow">
			<div class="notification-item">
				<div class="notification-container" @click.stop="go">
					<router-link :to="notification.routeLocation">
						<app-timeline-list-item :is-new="isNew">
							<div
								v-if="
									notification.type ===
									Notification.TYPE_COMMUNITY_USER_NOTIFICATION
								"
								slot="bubble"
							>
								<div class="-community-thumb">
									<app-community-thumbnail-img
										class="img-circle"
										:community="notification.from_model"
									/>
								</div>
							</div>
							<div v-else-if="fromIsUser" slot="bubble">
								<app-user-card-hover
									:user="notification.from_model"
									:disabled="!feed.shouldShowUserCards"
								>
									<app-user-avatar :user="notification.from_model" />
								</app-user-card-hover>
							</div>
							<div
								v-else-if="
									notification.type ===
										Notification.TYPE_POST_FEATURED_IN_COMMUNITY ||
									notification.type ===
										Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY
								"
								slot="bubble"
							>
								<div class="-community-thumb">
									<app-community-thumbnail-img
										class="img-circle"
										:community="notification.action_model.community"
									/>
								</div>
							</div>
							<div
								v-else-if="
									notification.type === Notification.TYPE_GAME_TROPHY_ACHIEVED ||
									notification.type === Notification.TYPE_SITE_TROPHY_ACHIEVED
								"
								slot="bubble"
							>
								<img class="img-circle -trophy-img" :src="trophyImg" />
							</div>

							<div class="-container">
								<div class="-main">
									<div
										class="
											timeline-list-item-title timeline-list-item-title-small
										"
										v-html="titleText"
									/>

									<div class="timeline-list-item-meta">
										<app-time-ago :date="notification.added_on" />
									</div>

									<div v-if="hasDetails" class="timeline-list-item-details">
										<div class="timeline-list-item-content">
											<app-fade-collapse
												:collapse-height="160"
												:is-open="false"
												@require-change="canToggleContent = $event"
											>
												<app-content-viewer
													v-if="
														notification.type ===
															Notification.TYPE_COMMENT_ADD ||
														notification.type ===
															Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
													"
													:source="
														notification.action_model.comment_content
													"
												/>
												<app-content-viewer
													v-else-if="
														notification.type ===
														Notification.TYPE_MENTION
													"
													:source="
														notification.action_model.comment
															.comment_content
													"
												/>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_POST_FEATURED_IN_COMMUNITY
													"
												>
													{{
														notification.action_model.fireside_post.getShortLead()
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY
													"
												>
													{{ notification.to_model.title }}
												</span>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_COMMUNITY_USER_NOTIFICATION
													"
												>
													{{ notification.to_model.getShortLead() }}
												</span>
												<span
													v-else-if="
														notification.type ===
															Notification.TYPE_GAME_TROPHY_ACHIEVED ||
														notification.type ===
															Notification.TYPE_SITE_TROPHY_ACHIEVED
													"
												>
													{{
														notification.action_model.trophy.description
													}}
												</span>
											</app-fade-collapse>
										</div>
									</div>
								</div>
							</div>

							<div class="-overlay" />
						</app-timeline-list-item>
					</router-link>
				</div>
				<div v-if="isNew" class="-actions">
					<a @click.stop.prevent="onMarkRead">
						<app-jolticon
							v-app-tooltip="$gettext(`Mark as Read`)"
							icon="radio-circle"
						/>
					</a>
				</div>
			</div>

			<div class="timeline-list-item-split" />
		</template>
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
