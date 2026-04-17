<script lang="ts" setup>
import { useGridStore } from '~app/components/grid/grid-store';
import AppShellSidebarChatConnected from '~app/components/shell/sidebar/_chat/AppShellSidebarChatConnected.vue';
import { useAppStore } from '~app/store';
import { useEscapeStack } from '~common/escape-stack/escape-stack.service';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illMaintenance } from '~common/illustration/illustrations';
import AppLoading from '~common/loading/AppLoading.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { $gettext } from '~common/translate/translate.service';

const { closeChatPane } = useAppStore();
const { chat } = useGridStore();

useEscapeStack(() => closeChatPane());
</script>

<template>
	<div id="shell-chat-pane" class="change-bg-bg h-full">
		<div class="flex h-full flex-col">
			<template v-if="!chat?.connected && chat?.populated">
				<AppIllustration
					:asset="illMaintenance"
					:style="{
						marginLeft: `12px`,
						marginRight: `12px`,
					}"
				>
					<p>{{ $gettext(`The chat server went away...`) }}</p>
					<p>{{ $gettext(`It should be back shortly.`) }}</p>
				</AppIllustration>
			</template>
			<template v-else-if="chat?.populated">
				<AppShellSidebarChatConnected />
			</template>
			<template v-else>
				<AppSpacer vertical :scale="10" />
				<AppLoading centered :label="$gettext(`Loading your chats...`)" />
			</template>
		</div>
	</div>
</template>
