<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import AppTimelineListItem from '../../timeline-list/item/item.vue';
import AppUserCardHover from '../../user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue';
import { User } from '../../user/user.model';
import AppUserVerifiedTick from '../../user/verified-tick/verified-tick.vue';

@Options({
	components: {
		AppTimelineListItem,
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
})
export default class AppMessageThreadItem extends Vue {
	@Prop({ type: Object, required: true }) user!: User;
	@Prop(Object) repliedTo?: User;
	@Prop({ type: Number, required: true }) date!: number;
	@Prop(String) id?: string;
	@Prop({ type: Boolean, default: false }) isActive!: boolean;
	@Prop({ type: Boolean, default: false }) isNew!: boolean;
	@Prop({ type: Boolean, default: false }) isReply!: boolean;
	@Prop({ type: Boolean, default: false }) isLast!: boolean;
	@Prop({ type: Boolean, default: false }) isShowingReplies!: boolean;
	@Prop({ type: Boolean, default: false }) isBlocked!: boolean;

	readonly formatDate = formatDate;
}
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
					<AppUserAvatar :user="user" />
				</AppUserCardHover>
			</template>

			<slot v-if="isBlocked" name="blocked" />
			<template v-else>
				<div class="timeline-list-item-details">
					<div v-if="user" class="-meta clearfix">
						<div class="-byline">
							<span class="-author">
								<router-link
									:to="{
										name: 'profile.overview',
										params: { username: user.username },
									}"
									class="link-unstyled"
								>
									{{ user.display_name }}
									<AppUserVerifiedTick :user="user" />
								</router-link>

								<small class="text-muted">@{{ user.username }}</small>
							</span>

							<template v-if="repliedTo">
								<AppJolticon icon="arrow-forward" />

								<span class="-author tiny">
									<router-link
										:to="{
											name: 'profile.overview',
											params: { username: repliedTo.username },
										}"
										class="link-unstyled"
									>
										{{ repliedTo.display_name }}
									</router-link>

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
