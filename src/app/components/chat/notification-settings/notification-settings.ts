import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';

@Component({
	components: {
		AppLoadingFade,
	},
})
export default class AppChatNotificationSettings extends Vue {
	@Prop(propRequired(Number)) roomId!: number;
	@Prop(propRequired(Boolean)) isPmRoom!: boolean;

	isLoadingNotificationSettings = false;
	notificationLevel = '';

	get notificationSettings() {
		const settings = [] as any[];

		settings.push({
			text: this.$gettext(`All Messages`),
			level: 'all',
		});
		if (!this.isPmRoom) {
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

	async mounted() {
		this.isLoadingNotificationSettings = true;

		const payload = await Api.sendRequest(
			`/web/chat/rooms/get-notification-settings/${this.roomId}`,
			undefined,
			{ detach: true }
		);
		this.notificationLevel = payload.level;

		this.isLoadingNotificationSettings = false;
	}

	async onClickSetNotificationLevel(level: string) {
		// Set it right away for immediate feedback.
		this.notificationLevel = level;

		const payload = await Api.sendRequest(
			`/web/chat/rooms/set-notification-settings/${this.roomId}`,
			{ level },
			{ detach: true }
		);
		// Just make sure we assign the level that was actually returned.
		this.notificationLevel = payload.level;
	}
}
