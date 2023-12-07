<script lang="ts" setup>
import { computed, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { $gettext } from '../../../../_common/translate/translate.service';

const props = defineProps({
	roomId: {
		type: Number,
		required: true,
	},
	isPmRoom: {
		type: Boolean,
		required: true,
	},
});

const { roomId, isPmRoom } = toRefs(props);

const isLoadingNotificationSettings = ref(false);
const notificationLevel = ref('');

const notificationSettings = computed(() => {
	const settings = [] as any[];

	settings.push({
		text: $gettext(`All Messages`),
		level: 'all',
	});
	if (!isPmRoom.value) {
		settings.push({
			text: $gettext(`Only @mentions`),
			level: 'mentions',
		});
	}
	settings.push({
		text: $gettext(`Nothing`),
		level: 'off',
	});

	return settings;
});

onMounted(async () => {
	isLoadingNotificationSettings.value = true;

	const payload = await Api.sendRequest(
		`/web/chat/rooms/get-notification-settings/${roomId.value}`,
		undefined,
		{ detach: true }
	);
	notificationLevel.value = payload.level;

	isLoadingNotificationSettings.value = false;
});

async function onClickSetNotificationLevel(level: string) {
	// Set it right away for immediate feedback.
	notificationLevel.value = level;

	const payload = await Api.sendRequest(
		`/web/chat/rooms/set-notification-settings/${roomId.value}`,
		{ level },
		{ detach: true }
	);
	// Just make sure we assign the level that was actually returned.
	notificationLevel.value = payload.level;
}
</script>

<template>
	<AppLoadingFade class="chat-notification-settings" :is-loading="isLoadingNotificationSettings">
		<h5 class="-header list-group-item">
			{{ $gettext(`Notifications`) }}
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
