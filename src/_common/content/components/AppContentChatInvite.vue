<script lang="ts" setup>
import { computed, ref } from 'vue';
import { openChatRoom } from '../../../app/components/chat/client';
import { useGridStore } from '../../../app/components/grid/grid-store';
import { Api } from '../../api/api.service';
import ChatInvite from '../../chat/invite/invite.model';
import { useCommonStore } from '../../store/common-store';
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

const { user } = useCommonStore();
const { chatUnsafe: chat } = useGridStore();

owner?.hydrator.useData('chat-invite', props.inviteId.toString(), data => {
	if (data) {
		invite.value = new ChatInvite(data);
	} else {
		hasError.value = true;
	}
});

const sentInvite = computed(
	() => user.value && invite.value && user.value?.id == invite.value?.by_user.id
);

async function onClickAccept() {
	if (!invite.value || invite.value.status !== ChatInvite.STATUS_OPEN) {
		return;
	}

	const payload = await Api.sendRequest(`/web/chat/invite/accept/${invite.value.id}`, {});
	if (payload && payload.success) {
		if (payload.invite) {
			invite.value = new ChatInvite(payload.invite);
		}

		// Immediately open new room.
		// TODO: this doesn't work yet, it will be able to open the chat window,
		// but the room channel won't be connected and the side panel, while having the room
		// in it won't have it focused.
		// The openChatRoom function needs to be able to handle not having been connected to the room
		// before and try to do so before opening the chat window.
		// Sending messages in this "fake" room does not work, however if a different user sends a message
		// in that channel, the chat client properly connects to the room channel and receives messages.
		// Any future messages can then also be sent.
		openChatRoom(chat.value, payload.roomId);
	}
}

async function onClickDecline() {
	if (!invite.value || invite.value.status !== ChatInvite.STATUS_OPEN) {
		return;
	}

	const payload = await Api.sendRequest(`/web/chat/invite/decline/${invite.value.id}`, {});
	if (payload && payload.success && payload.invite) {
		invite.value = new ChatInvite(payload.invite);
	}
}

async function onClickCancel() {
	if (!invite.value || invite.value.status !== ChatInvite.STATUS_OPEN) {
		return;
	}

	const payload = await Api.sendRequest(`/web/chat/invite/cancel/${invite.value.id}`, {});
	if (payload && payload.success && payload.invite) {
		invite.value = new ChatInvite(payload.invite);
	}
}
</script>

<template>
	<div class="-invite">
		<template v-if="hasError || !invite">
			<div class="-invite-header">
				{{ $gettext(`Invalid Invite`) }}
			</div>
			<div class="-invite-content">
				<AppJolticon icon="offline" big />
			</div>
		</template>
		<template v-else>
			<div class="-invite-header">
				<template v-if="sentInvite">
					{{ $gettext(`You sent an invite`) }}
				</template>
				<template v-else>
					{{ $gettext(`You were invited to join a chat room`) }}
				</template>
			</div>
			<div class="-invite-content">
				<div class="-room">
					<AppJolticon icon="users" big />
					<span>{{ invite?.room_title || 'Group Chat' }}</span>
				</div>

				<div class="-controls">
					<template v-if="invite.status === ChatInvite.STATUS_CANCELED">
						<template v-if="sentInvite">
							{{ $gettext(`You canceled this invite.`) }}
						</template>
						<template v-else>
							{{ $gettext(`This invite was canceled.`) }}
						</template>
					</template>
					<template
						v-else-if="
							invite.status === ChatInvite.STATUS_ACCEPTED ||
							invite.status === ChatInvite.STATUS_DECLINED
						"
					>
						<template v-if="sentInvite">
							<!-- {{ $gettext(``) }} -->
						</template>
						<template v-else>
							<template v-if="invite.status === ChatInvite.STATUS_ACCEPTED">
								{{ $gettext(`You accepted this invite.`) }}
							</template>
							<template v-else-if="invite.status === ChatInvite.STATUS_DECLINED">
								{{ $gettext(`You declined this invite`) }}
							</template>
						</template>
					</template>
					<template v-else-if="invite.status === ChatInvite.STATUS_OPEN">
						<template v-if="sentInvite">
							<AppButton @click="onClickCancel">
								{{ $gettext(`Cancel`) }}
							</AppButton>
						</template>
						<template v-else>
							<AppButton primary solid @click="onClickAccept">
								{{ $gettext(`Accept`) }}
							</AppButton>
							<AppButton @click="onClickDecline">
								{{ $gettext(`Decline`) }}
							</AppButton>
						</template>
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
