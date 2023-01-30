<script lang="ts" setup>
import { PropType } from 'vue';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { styleTextOverflow } from '../../../../_styles/mixins';
import { ChatClient } from '../client';
import { ChatMessage } from '../message';

defineProps({
	chat: {
		type: Object as PropType<ChatClient>,
		required: true,
	},
	message: {
		type: Object as PropType<ChatMessage>,
		required: true,
	},
});
</script>

<template>
	<div
		:style="{
			display: `flex`,
		}"
	>
		<AppUserAvatar
			:style="{
				width: `44px`,
				marginRight: `16px`,
				flexShrink: 0,
			}"
			:user="message.user"
		/>
		<div
			:style="{
				position: `relative`,
				// Used to make text-overflow work with this flex item.
				minWidth: 0,
				width: `100%`,
			}"
		>
			<h4
				:style="{
					...styleTextOverflow,
					marginBottom: `8px`,
				}"
			>
				<AppJolticon icon="user-messages" />
				{{ message.user.display_name }}
			</h4>

			<AppFadeCollapse :collapse-height="100">
				<AppContentViewer :source="message.content" />
			</AppFadeCollapse>

			<!-- Block any interaction with the content inside the viewer. -->
			<div
				:style="{
					position: `absolute`,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				}"
			/>
		</div>
	</div>
</template>
