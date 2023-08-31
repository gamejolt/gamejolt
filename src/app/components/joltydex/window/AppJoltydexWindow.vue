<script lang="ts" setup>
import { nextTick, onUnmounted, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppJoltydexBrowser from '../../../../_common/joltydex/AppJoltydexBrowser.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserModel } from '../../../../_common/user/user.model';
import { useAppStore } from '../../../store/index';
import { useJoltydexStore } from '../../../store/joltydex';
import AppShellWindow from '../../shell/AppShellWindow.vue';

const props = defineProps({
	selectedUser: {
		type: UserModel,
		required: true,
	},
});

const { selectedUser } = toRefs(props);
const { selectedJoltydexUser } = useJoltydexStore();
const { toggleLeftPane } = useAppStore();

onUnmounted(async () => {
	// Wait a tick in case a different quest window was opened and changed the activeQuestId.
	await nextTick();

	if (selectedUser.value === selectedJoltydexUser.value) {
		selectedJoltydexUser.value = undefined;
	}
});

function close() {
	// Causes the shell to v-if this away.
	selectedJoltydexUser.value = undefined;

	// Close the sidebar only for breakpoints that always show it. Mobile
	// breakpoints have the quest window overlay everything, so we should keep
	// the sidebar open.
	if (Screen.isDesktop) {
		toggleLeftPane('');
	}
}
</script>

<template>
	<AppShellWindow :close-callback="close" avoid-sidebar="md-up">
		<div
			class="modal-controls"
			:style="{
				position: `absolute`,
				left: 0,
				top: 0,
				right: 0,
				height: 0,
				zIndex: 2,
			}"
		>
			<AppButton overlay @click="close">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div
			:style="{
				position: `relative`,
				zIndex: 1,
				width: `100%`,
				height: `100%`,
			}"
		>
			<AppScrollScroller
				:style="{
					height: `100%`,
					padding: `16px`,
				}"
			>
				<AppJoltydexBrowser :user="selectedUser" />
			</AppScrollScroller>
		</div>
	</AppShellWindow>
</template>
