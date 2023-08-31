<script lang="ts" setup>
import { nextTick, onUnmounted, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppJoltydexBrowser from '../../../../_common/joltydex/AppJoltydexBrowser.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { kThemeFgMuted } from '../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../_common/user/user.model';
import { styleTextOverflow } from '../../../../_styles/mixins';
import { kFontSizeLarge, kFontSizeSmall } from '../../../../_styles/variables';
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
			:style="{
				flex: `auto`,
				display: `flex`,
				flexDirection: `column`,
				zIndex: 1,
				// Needed for AppHeaderBar to collapse.
				minWidth: 0,
			}"
		>
			<AppHeaderBar
				title-size="lg"
				:automatically-imply-leading="false"
				:elevation="2"
				:title-spacing="16"
			>
				<template #leading>
					<AppUserAvatarBubble
						:style="{
							width: `36px`,
							height: `36px`,
						}"
						:user="selectedUser"
						show-frame
						show-verified
					/>
				</template>

				<template #title>
					<div
						:style="[
							styleTextOverflow,
							{
								fontSize: kFontSizeLarge.px,
								fontWeight: `bold`,
							},
						]"
					>
						{{ selectedUser.name }}'s
					</div>

					<div
						:style="{
							fontSize: kFontSizeSmall.px,
							lineHeight: 1,
							color: kThemeFgMuted,
						}"
					>
						@{{ selectedUser.username }}
					</div>
				</template>

				<template #actions>
					<AppButton circle trans sparse icon="remove" @click="close()" />
				</template>
			</AppHeaderBar>

			<div
				:style="{
					position: `relative`,
					overflow: `hidden`,
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
		</div>
	</AppShellWindow>
</template>
