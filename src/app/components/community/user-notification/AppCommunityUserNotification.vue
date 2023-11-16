<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import AppAlertDismissable from '../../../../_common/alert/dismissable/AppAlertDismissable.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	$removeCommunityUserNotification,
	CommunityUserNotificationModel,
	CommunityUserNotificationType,
} from '../../../../_common/community/user-notification/user-notification.model';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	getCommunityEjectPostReasons,
	getCommunityMovePostReasons,
} from '../../../../_common/user/action-reasons';

const props = defineProps({
	notification: {
		type: Object as PropType<CommunityUserNotificationModel>,
		required: true,
	},
});

const emit = defineEmits({
	dismiss: () => true,
});

const { notification } = toRefs(props);

const notificationReasons = computed(() => {
	switch (notification.value.type) {
		case CommunityUserNotificationType.POSTS_MOVE:
			return getCommunityMovePostReasons();
		case CommunityUserNotificationType.POSTS_EJECT:
			return getCommunityEjectPostReasons();
	}

	throw new Error('No reasons defined.');
});

const hasReason = toRef(() => notification.value.reason !== null);

const reasonText = computed(() => {
	const reason = notification.value.reason;
	if (reason === null) {
		return null;
	}

	const reasons = notificationReasons.value;
	if (reasons[reason]) {
		return reasons[reason];
	}
	return reason;
});

function onDismiss() {
	// Hope it succeeds, but don't wait on it.
	$removeCommunityUserNotification(notification.value);
	emit('dismiss');
}
</script>

<template>
	<AppAlertDismissable
		alert-type="info"
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
				<template v-if="notification.type === CommunityUserNotificationType.POSTS_MOVE">
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
				<template
					v-else-if="notification.type === CommunityUserNotificationType.POSTS_EJECT"
				>
					<span v-translate>Your post has been <b>ejected</b> from the community.</span>
				</template>
			</div>

			<template v-if="hasReason">
				<div>
					{{ $gettext(`The reason for this action is as follows:`) }}
				</div>
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
