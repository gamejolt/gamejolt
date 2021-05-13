import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey } from '../../client';
import { ChatRoom } from '../../room';
import { ChatRoomDetailsModal } from '../../room-details-modal/room-details-modal.service';

@Component({
	components: {
		AppPopper,
		AppLoadingFade,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindowMenu extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	isLoadingNotificationSettings = false;
	notificationLevel = '';

	get isOwner() {
		return (
			this.room && this.chat.currentUser && this.room.owner_id === this.chat.currentUser.id
		);
	}

	get shouldShowEdit() {
		return !this.room.isPmRoom && this.isOwner;
	}

	get notificationSettings() {
		const settings = [] as any[];

		settings.push({
			text: this.$gettext(`All Messages`),
			level: 'all',
		});
		if (!this.room.isPmRoom) {
			settings.push({
				text: this.$gettext(`Only @mentions`),
				level: 'mentions',
			});
		}
		settings.push({
			text: this.$gettext(`Nothing`),
			level: 'off',
		});

		return settings;
	}

	async onShowPopper() {
		this.isLoadingNotificationSettings = true;

		const payload = await Api.sendRequest(
			`/web/chat/rooms/get-notification-settings/${this.room.id}`,
			undefined,
			{ detach: true }
		);
		this.notificationLevel = payload.level;

		this.isLoadingNotificationSettings = false;
	}

	onClickEditTitle() {
		if (!this.isOwner) {
			return;
		}

		ChatRoomDetailsModal.show(this.room);
	}

	async onClickSetNotificationLevel(level: string) {
		// Set it right away for immediate feedback.
		this.notificationLevel = level;

		const payload = await Api.sendRequest(
			`/web/chat/rooms/set-notification-settings/${this.room.id}`,
			{ level },
			{ detach: true }
		);
		// Just make sure we assign the level that was actually returned.
		this.notificationLevel = payload.level;
	}
}
