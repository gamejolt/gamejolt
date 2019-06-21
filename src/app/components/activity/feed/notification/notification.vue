<template>
	<div @click.stop="go">
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
									:collapse-height="80"
									:is-open="showFullContent"
									@require-change="canToggleContent = $event"
									@expand="toggleFull"
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
								</app-fade-collapse>

								<template v-if="canToggleContent">
									<br />
									<span class="hidden-text-expander" @click.stop.prevent="toggleFull" />
								</template>
							</div>
						</div>
					</div>
					<div class="-actions" v-if="isNew">
						<a @click.stop.prevent="onMarkRead">
							<app-jolticon icon="radio-circle" v-app-tooltip="$gettext(`Mark as Read`)" />
						</a>
					</div>
				</div>
			</app-timeline-list-item>
		</router-link>

		<div class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
.-container
	display: flex

.-main
	flex: auto

.-actions
	flex: none
	margin-left: 10px
</style>

<script lang="ts" src="./notification"></script>
