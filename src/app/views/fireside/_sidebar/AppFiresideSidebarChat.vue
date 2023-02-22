<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Environment } from '../../../../_common/environment/environment.service';
import { createFiresideChatContextCapabilities } from '../../../../_common/fireside/chat/chat-settings.model';
import AppChatWindowOutput from '../../../components/chat/window/output/AppChatWindowOutput.vue';
import AppChatWindowSend from '../../../components/chat/window/send/AppChatWindowSend.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const { chatRoom, chatSettings, chat, fireside, background } = useFiresideController()!;
const route = useRoute();

const contextCapabilities = computed(() =>
	createFiresideChatContextCapabilities(chatSettings.value, fireside.role?.role || 'audience')
);

const loginUrl = computed(
	() => Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(route.fullPath)
);
</script>

<template>
	<AppFiresideSidebar :opacity="0.3">
		<template #header>
			<AppFiresideSidebarHeading has-members />
		</template>

		<template #body>
			<AppChatWindowOutput
				v-if="chatRoom"
				:key="chatRoom.id"
				:room="chatRoom"
				:overlay="!!background"
				avatar-popper-placement="left"
				:avatar-popper-placement-fallbacks="['left', 'right']"
			/>
		</template>

		<template #footer>
			<AppChatWindowSend
				v-if="chat?.currentUser && chatRoom"
				:room="chatRoom"
				:capabilities="contextCapabilities"
				:slowmode-duration="
					chatSettings.slow_mode_enabled ? chatSettings.slow_mode_seconds * 1_000 : 0
				"
				:max-content-length="chatSettings.max_message_length"
			/>
			<div v-if="chat && !chat.currentUser" class="-login fill-backdrop">
				<div class="alert">
					<p>
						You must be
						<a v-app-auth-required :href="loginUrl">logged in</a>
						to Game Jolt to chat.
					</p>
				</div>
			</div>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-login
	padding: ($grid-gutter-width-xs / 2)

	> *
		margin: 0

	@media $media-sm-up
		padding: ($grid-gutter-width / 2)
</style>
