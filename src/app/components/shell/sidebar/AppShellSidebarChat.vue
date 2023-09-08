<script lang="ts" setup>
import { useEscapeStack } from '../../../../_common/escape-stack/escape-stack.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illMaintenance } from '../../../../_common/illustration/illustrations';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleChangeBg } from '../../../../_styles/mixins';
import { useAppStore } from '../../../store';
import { useGridStore } from '../../grid/grid-store';
import AppShellSidebarChatConnected from './_chat/AppShellSidebarChatConnected.vue';

const { closeChatPane } = useAppStore();
const { chat } = useGridStore();

useEscapeStack(() => closeChatPane());
</script>

<template>
	<div id="shell-chat-pane" :style="[styleChangeBg('bg'), { height: '100%' }]">
		<div
			:style="{
				display: `flex`,
				flexDirection: `column`,
				height: `100%`,
			}"
		>
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
