import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppAlertDismissable from '../../../../_common/alert/dismissable/dismissable.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import {
	CommunityUserNotification,
	NotificationType,
} from '../../../../_common/community/user-notification/user-notification.model';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
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
	@Prop(propRequired(CommunityUserNotification)) notification!: CommunityUserNotification;

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
