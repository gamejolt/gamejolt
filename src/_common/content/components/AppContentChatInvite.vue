<script lang="ts" setup>
import { ref } from 'vue';
import ChatInvite from '../../chat/invite/invite.model';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	inviteId: {
		type: Number,
		required: true,
	},
	isEditing: {
		type: Boolean,
	},
});

const owner = useContentOwnerController();

const invite = ref<ChatInvite>();
const hasError = ref(false);

owner?.hydrator.useData('chat-invite', props.inviteId.toString(), data => {
	if (data) {
		invite.value = new ChatInvite(data);
	} else {
		hasError.value = true;
	}
});
</script>

<template>
	<div class="-invite">
		<template v-if="hasError || !invite || invite.status === ChatInvite.STATUS_CANCELED">
			<div class="-invite-header">YOU WERE INVITED</div>
			<div class="-invite-content">
				<AppJolticon icon="offline" big />
				<span class="-invite-message-invalid">
					<AppTranslate>Invalid Invite</AppTranslate>
				</span>
			</div>
		</template>
		<template v-else>
			<div class="-invite-header">YOU WERE INVITED</div>
			<div class="-invite-content">
				<div class="-room">
					<AppJolticon icon="users" big />
					<span>{{ invite?.room_title || 'Group Chat' }}</span>
				</div>
				<div class="-controls">
					<template v-if="invite.status === ChatInvite.STATUS_OPEN">
						<AppButton primary solid>Accept</AppButton>
						<AppButton>Decline</AppButton>
					</template>
					<template v-else-if="invite.status === ChatInvite.STATUS_ACCEPTED">
						<span class="-invite-message-accepted">
							<AppTranslate>You accepted the invite!</AppTranslate>
						</span>
					</template>
					<template v-else-if="invite.status === ChatInvite.STATUS_DECLINED">
						<span class="-invite-message-declined">
							<AppTranslate>You declined the invite.</AppTranslate>
						</span>
					</template>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-invite
	padding: 8px
	change-bg('bg-offset')
	rounded-corners()

	&-content
		display: flex

	&-message
		&-invalid
			color: var(--theme-notice)

		&-accepted
			color: var(--theme-primary)

		&-declined
			color: var(--theme-fg-muted)
</style>
