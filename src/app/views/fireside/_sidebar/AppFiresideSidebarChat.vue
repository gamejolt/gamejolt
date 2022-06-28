<script lang="ts" setup>
import { computed } from 'vue';
import { createFiresideChatContextCapabilities } from '../../../../_common/fireside/chat-settings/chat-settings.model';
import { useChatStore } from '../../../components/chat/chat-store';
import AppChatWindowOutput from '../../../components/chat/window/output/AppChatWindowOutput.vue';
import AppChatWindowSend from '../../../components/chat/window/send/AppChatWindowSend.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const emit = defineEmits({
	members: () => true,
});

const c = useFiresideController()!;
const { chatRoom, chatSettings, fireside } = c;

const chatStore = useChatStore()!;
const chat = computed(() => chatStore.chat);

const contextCapabilities = computed(() => ({
	capabilities: createFiresideChatContextCapabilities(
		chatSettings.value,
		fireside.role?.role || 'audience'
	),
	// We return a key anytime that we generate a new context capability so that
	// it can reload the chat input with the new capabilities.
	key: Math.random(),
}));
</script>

<template>
	<AppFiresideSidebar :opacity="0.3">
		<template #header>
			<AppFiresideSidebarHeading @members="emit('members')" />
		</template>

		<template #body>
			<AppChatWindowOutput
				v-if="chatRoom"
				:key="chatRoom.id"
				:room="chatRoom"
				:overlay="!!chatRoom.background"
			/>
		</template>

		<template #footer>
			<AppChatWindowSend
				v-if="chat?.currentUser && chatRoom"
				:key="contextCapabilities.key"
				:room="chatRoom"
				:context-capabilities="contextCapabilities.capabilities"
			/>
		</template>
	</AppFiresideSidebar>
</template>
