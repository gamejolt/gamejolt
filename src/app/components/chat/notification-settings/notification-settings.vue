<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';

@Options({
	components: {
		AppLoadingFade,
	},
})
export default class AppChatNotificationSettings extends Vue {
	@Prop({ type: Number, required: true }) roomId!: number;
	@Prop({ type: Boolean, required: true }) isPmRoom!: boolean;

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
</script>

<template>
	<AppLoadingFade class="chat-notification-settings" :is-loading="isLoadingNotificationSettings">
		<h5 class="-header list-group-item">
			<AppTranslate>Notifications</AppTranslate>
		</h5>

		<a
			v-for="setting of notificationSettings"
			:key="setting.level"
			class="list-group-item has-icon"
			@click="onClickSetNotificationLevel(setting.level)"
		>
			<AppJolticon
				:icon="setting.level === notificationLevel ? 'radio-circle-filled' : 'radio-circle'"
			/>
			{{ setting.text }}
		</a>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
.chat-notification-settings
	.-header
		font-family: $font-family-base
		font-size: $font-size-tiny
		font-weight: normal
		letter-spacing: 0.1em
		line-height: 1
		text-transform: uppercase
		margin-top: 0
		margin-bottom: 0
</style>
