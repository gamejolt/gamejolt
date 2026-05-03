<script lang="ts" setup>
import { computed, toRef } from 'vue';

import AppAlertDismissable from '~common/alert/dismissable/AppAlertDismissable.vue';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	$removeCommunityUserNotification,
	CommunityUserNotificationModel,
	CommunityUserNotificationTypePOSTS_EJECT,
	CommunityUserNotificationTypePOSTS_MOVE,
} from '~common/community/user-notification/user-notification.model';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import {
	getCommunityEjectPostReasons,
	getCommunityMovePostReasons,
} from '~common/user/action-reasons';

type Props = {
	notification: CommunityUserNotificationModel;
};
const { notification } = defineProps<Props>();

const emit = defineEmits<{
	dismiss: [];
}>();

const notificationReasons = computed(() => {
	switch (notification.type) {
		case CommunityUserNotificationTypePOSTS_MOVE:
			return getCommunityMovePostReasons();
		case CommunityUserNotificationTypePOSTS_EJECT:
			return getCommunityEjectPostReasons();
	}

	throw new Error('No reasons defined.');
});

const hasReason = toRef(() => notification.reason !== null);

const reasonText = computed(() => {
	const reason = notification.reason;
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
	$removeCommunityUserNotification(notification);
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
				<template v-if="notification.type === CommunityUserNotificationTypePOSTS_MOVE">
					<AppTranslate
						:translate-params="{
							fromChannel: notification.extra_data['from-channel'],
							toChannel: notification.extra_data['to-channel'],
						}"
					>
						Your post has been moved from the %{ fromChannel } channel to the %{
						toChannel } channel.
					</AppTranslate>
				</template>
				<template
					v-else-if="notification.type === CommunityUserNotificationTypePOSTS_EJECT"
				>
					<AppTranslate>Your post has been ejected from the community.</AppTranslate>
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
