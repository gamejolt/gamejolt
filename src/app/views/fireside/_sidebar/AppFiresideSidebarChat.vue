<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
import { Environment } from '../../../../_common/environment/environment.service';
import { createFiresideChatContextCapabilities } from '../../../../_common/fireside/chat/chat-settings.model';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppChatWindowOutput from '../../../components/chat/window/output/AppChatWindowOutput.vue';
import AppChatWindowSend from '../../../components/chat/window/send/AppChatWindowSend.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import { illMaintenance } from '../../../img/ill/illustrations';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const { chatRoom, chatSettings, chat, fireside, background, hasChatConnectionError, user } =
	useFiresideController()!;
const route = useRoute();

const contextCapabilities = computed(() => ({
	capabilities: createFiresideChatContextCapabilities(
		chatSettings.value,
		fireside.role?.role || 'audience'
	),
	// We return a key anytime that we generate a new context capability so that
	// it can reload the chat input with the new capabilities.
	key: Math.random(),
}));

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
			<div v-if="hasChatConnectionError" class="-chat-error">
				<AppIllustration :asset="illMaintenance">
					<p><AppTranslate>You lost connection to the chat.</AppTranslate></p>
					<p><AppTranslate>We're actively reconnecting you.</AppTranslate></p>
				</AppIllustration>
			</div>
			<AppChatWindowOutput
				v-else-if="chatRoom"
				:key="chatRoom.id"
				:room="chatRoom"
				:overlay="!!background"
				avatar-popper-placement="left"
				:avatar-popper-placement-fallbacks="['left', 'right']"
			/>
		</template>

		<template #footer>
			<AppChatWindowSend
				v-if="user && chatRoom"
				:key="contextCapabilities.key"
				:room="chatRoom"
				:context-capabilities="contextCapabilities.capabilities"
				:slowmode-duration="
					chatSettings.slow_mode_enabled ? chatSettings.slow_mode_seconds * 1_000 : 0
				"
				:max-content-length="chatSettings.max_message_length"
			/>
			<div v-else-if="chat && !user" class="-login fill-backdrop">
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
.-chat-error
	display: flex
	align-items: center
	justify-content: center
	padding: 16px

.-login
	padding: ($grid-gutter-width-xs / 2)

	> *
		margin: 0

	@media $media-sm-up
		padding: ($grid-gutter-width / 2)
</style>
