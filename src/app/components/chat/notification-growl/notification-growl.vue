<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { ChatClient } from '../client';
import { ChatMessage } from '../message';

@Options({
	components: {
		AppUserAvatar,
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppChatNotificationGrowl extends Vue {
	@Prop({ type: Object, required: true }) chat!: ChatClient;
	@Prop({ type: Object, required: true }) message!: ChatMessage;
}
</script>

<template>
	<div class="-container">
		<AppUserAvatar class="-avatar" :user="message.user" />
		<div class="-content">
			<h4 class="-header">
				<AppJolticon icon="user-messages" />
				{{ message.user.display_name }}
			</h4>

			<AppFadeCollapse :collapse-height="100">
				<AppContentViewer :source="message.content" />
			</AppFadeCollapse>

			<!-- Block any interaction with the content inside the viewer. -->
			<div class="-content-overlay"></div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	display: flex

.-avatar
	width: 44px
	margin-right: 16px
	flex-shrink: 0

.-content
	position: relative
	// Used to make text-overflow work with this flex item.
	min-width: 0
	width: 100%

	&-overlay
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0

.-header
	text-overflow()
	margin-bottom: 8px
</style>
