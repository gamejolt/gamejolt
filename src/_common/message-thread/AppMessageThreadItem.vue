<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { formatDate } from '../filters/date';
import AppJolticon from '../jolticon/AppJolticon.vue';
import AppTimeAgo from '../time/AppTimeAgo.vue';
import AppTimelineListItem from '../timeline-list/item/item.vue';
import AppUserCardHover from '../user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '../user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../user/user.model';

defineProps({
	user: {
		type: [Object, null] as PropType<UserModel | null>,
		required: true,
	},
	repliedTo: {
		type: Object as PropType<UserModel>,
		default: undefined,
	},
	date: {
		type: Number,
		required: true,
	},
	id: {
		type: String,
		default: undefined,
	},
	isActive: {
		type: Boolean,
	},
	isNew: {
		type: Boolean,
	},
	isReply: {
		type: Boolean,
	},
	isLast: {
		type: Boolean,
	},
	isShowingReplies: {
		type: Boolean,
	},
	isBlocked: {
		type: Boolean,
	},
});
</script>

<template>
	<div :id="id" class="message-thread-item" :class="{ '-blocked': isBlocked }">
		<AppTimelineListItem
			:is-active="isActive"
			:is-new="isNew"
			:is-thread="isShowingReplies || isReply"
			:is-last="isLast"
		>
			<template v-if="!isBlocked && user" #bubble>
				<AppUserCardHover :user="user">
					<AppUserAvatarBubble :user="user" show-frame show-verified />
				</AppUserCardHover>
			</template>

			<slot v-if="isBlocked" name="blocked" />
			<template v-else>
				<div class="timeline-list-item-details">
					<div v-if="user" class="-meta clearfix">
						<div class="-byline">
							<span class="-author">
								<RouterLink
									:to="{
										name: 'profile.overview',
										params: { username: user.username },
									}"
									class="link-unstyled"
								>
									{{ user.display_name }}
									{{ ' ' }}
								</RouterLink>

								<small class="text-muted">@{{ user.username }}</small>
							</span>

							<template v-if="repliedTo">
								<AppJolticon icon="arrow-forward" />

								<span class="-author tiny">
									<RouterLink
										:to="{
											name: 'profile.overview',
											params: { username: repliedTo.username },
										}"
										class="link-unstyled"
									>
										{{ repliedTo.display_name }}
									</RouterLink>

									<span class="text-muted">@{{ repliedTo.username }}</span>
								</span>
							</template>

							<span class="-meta-slot">
								<slot name="tags" />
								<slot name="meta" />
							</span>

							<slot name="authors" />
						</div>

						<div class="-meta-sub">
							<small class="text-muted" :title="formatDate(date, 'medium')">
								<AppTimeAgo :date="date" />
							</small>
						</div>
					</div>

					<slot />

					<div class="timeline-list-item-controls">
						<slot name="controls" />
					</div>
				</div>
			</template>
		</AppTimelineListItem>

		<div v-if="isShowingReplies && !isBlocked" class="-replies">
			<slot name="replies" />
		</div>

		<div v-if="!isReply" class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
.-meta
	margin-bottom: 1em

.-byline
	display: flex
	justify-content: space-between

.-author
	text-overflow()
	margin-right: 2px

	a
		font-weight: bold

.-meta-sub
	a
		margin-right: 2px

	.tag
		margin-right: 5px

.-meta-slot
	display: inline-flex
	margin-left: 5px

	::v-deep(.tag)
		vertical-align: middle

.-blocked ::v-deep(.timeline-list-item-main)
	padding-left: 0
</style>
