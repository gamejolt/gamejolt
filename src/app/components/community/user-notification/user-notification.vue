<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	CommunityUserNotification,
	NotificationType,
} from '../../../../_common/community/user-notification/user-notification.model';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import {
	getCommunityEjectPostReasons,
	getCommunityMovePostReasons,
} from '../../../../_common/user/action-reasons';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppAlertDismissable,
		AppTimeAgo,
	},
})
export default class AppCommunityUserNotification extends Vue {
	@Prop({ type: Object, required: true }) notification!: CommunityUserNotification;

	@Emit('dismiss')
	emitDismiss() {}

	readonly NotificationType = NotificationType;

	get notificationReasons() {
		switch (this.notification.type) {
			case NotificationType.POSTS_MOVE:
				return getCommunityMovePostReasons();
			case NotificationType.POSTS_EJECT:
				return getCommunityEjectPostReasons();
		}

		throw new Error('No reasons defined.');
	}

	get hasReason() {
		return this.notification.reason !== null;
	}

	get reasonText() {
		const reason = this.notification.reason;
		if (reason === null) {
			return null;
		}

		const reasons = this.notificationReasons;
		if (reasons[reason]) {
			return reasons[reason];
		}
		return reason;
	}

	onDismiss() {
		// Hope it succeeds, but don't wait on it.
		this.notification.$remove();
		this.emitDismiss();
	}
}
</script>

<template>
	<AppAlertDismissable
		class="-notification"
		no-margin
		:dismiss-tooltip="$gettext(`Dismiss`)"
		@dismiss="onDismiss"
	>
		<div class="-community">
			<div class="-community-img">
				<AppCommunityThumbnailImg :community="notification.community" />
			</div>
			<span class="-community-title">{{ notification.community.name }}</span>
			<span class="dot-separator" />
			<AppTimeAgo :date="notification.added_on" class="-community-date" />
		</div>

		<div class="-message">
			<div>
				<template v-if="notification.type === NotificationType.POSTS_MOVE">
					<span
						v-translate="{
							fromChannel: notification.extra_data['from-channel'],
							toChannel: notification.extra_data['to-channel'],
						}"
					>
						Your post has been <b>moved</b> from the <i>%{ fromChannel }</i> channel to
						the <i>%{ toChannel }</i> channel.
					</span>
				</template>
				<template v-else-if="notification.type === NotificationType.POSTS_EJECT">
					<span v-translate>Your post has been <b>ejected</b> from the community.</span>
				</template>
			</div>

			<template v-if="hasReason">
				<div><AppTranslate>The reason for this action is as follows:</AppTranslate></div>
				<div class="-reason">
					<em>
						<strong>
							{{ reasonText }}
						</strong>
					</em>
				</div>
			</template>
		</div>
	</AppAlertDismissable>
</template>

<style lang="stylus" scoped>
.-notification
	margin-top: 8px
	full-bleed-xs()

.-dismiss
	position: absolute
	right: 16px
	top: 16px

.-community
	&-img
		width: 20px
		display: inline-block
		vertical-align: middle
		margin-right: 8px

	&-title
		font-size: $font-size-base
		vertical-align: middle

	&-date
		vertical-align: middle

.-message
	margin-top: 8px

.-reason
	margin-top: 8px
	padding-left: 12px
	padding-top: 4px
	padding-bottom: 4px
	border-color: var(--theme-bg-subtle)
	border-width: 4px
	border-left-style: solid
</style>
