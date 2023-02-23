<script lang="ts" setup>
import { computed, ref } from 'vue';
import AppAlertBox from '../../../../_common/alert/AppAlertBox.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	ChatInvite,
	ChatInviteStatusAccepted,
	ChatInviteStatusCanceled,
	ChatInviteStatusDeclined,
	ChatInviteStatusOpen,
} from '../../../../_common/chat/invite/invite.model';
import { useContentOwnerController } from '../../../../_common/content/content-owner';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext, $gettextInterpolate } from '../../../../_common/translate/translate.service';
import { styleBorderRadiusBase, styleChangeBg } from '../../../../_styles/mixins';
import { kFontSizeLarge } from '../../../../_styles/variables';
import { openChatRoom } from '../../chat/client';
import { useGridStore } from '../../grid/grid-store';

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
const isLoading = ref(false);

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
	() => user.value && invite.value && user.value?.id == invite.value?.inviter_user.id
);

const statusText = computed(() => {
	if (!invite.value) {
		return;
	}

	if (invite.value.status === ChatInviteStatusCanceled) {
		return sentInvite.value
			? $gettext(`You canceled this invite.`)
			: $gettext(`This invite was canceled.`);
	} else if (invite.value.status === ChatInviteStatusAccepted) {
		return sentInvite.value
			? $gettextInterpolate(`@%{ user } accepted this invite.`, {
					user: invite.value?.invited_user.username,
			  })
			: $gettext(`You accepted this invite.`);
	} else if (invite.value.status === ChatInviteStatusDeclined) {
		return sentInvite.value
			? $gettextInterpolate(`@%{ user } declined this invite.`, {
					user: invite.value?.invited_user.username,
			  })
			: $gettext(`You declined this invite.`);
	}
});

async function onClickAccept() {
	if (!invite.value || invite.value.status !== ChatInviteStatusOpen) {
		return;
	}

	isLoading.value = true;

	// TODO: error handling
	const payload = await chat.value.userChannel?.pushInviteAccept(invite.value.id);

	// Immediately open new room.
	openChatRoom(chat.value, payload!.room_id);
	isLoading.value = false;
}

async function onClickDecline() {
	if (!invite.value || invite.value.status !== ChatInviteStatusOpen) {
		return;
	}

	isLoading.value = true;

	// TODO: error handling
	await chat.value.userChannel?.pushInviteDecline(invite.value.id);

	// Set status to "declined" after a successful request.
	invite.value.status = ChatInviteStatusDeclined;
	isLoading.value = false;
}

async function onClickCancel() {
	if (!invite.value || invite.value.status !== ChatInviteStatusOpen) {
		return;
	}

	isLoading.value = true;

	// TODO: error handling
	await chat.value.userChannel?.pushInviteDecline(invite.value.id);

	// Set status to "canceled" after a successful request.
	invite.value.status = ChatInviteStatusCanceled;
	isLoading.value = false;
}
</script>

<template>
	<!-- AppContentChatInvite -->
	<div
		:style="{
			...styleChangeBg('bg-offset'),
			...styleBorderRadiusBase,
			padding: `8px`,
			width: `300px`,
			maxWidth: `100%`,
		}"
	>
		<template v-if="hasError || !invite">
			<div>
				{{ $gettext(`Invalid Invite`) }}
			</div>
			<div>
				<AppJolticon icon="offline" big />
			</div>
		</template>
		<template v-else>
			<AppLoadingFade :is-loading="isLoading">
				<div>
					<template v-if="sentInvite">
						{{
							$gettextInterpolate(`You invited @%{ user } to a group chat`, {
								user: invite.invited_user.username,
							})
						}}
					</template>
					<template v-else>
						{{
							$gettextInterpolate(`@%{ user } invited you to a group chat`, {
								user: invite.inviter_user.username,
							})
						}}
					</template>
				</div>

				<div v-if="invite.room_title" :style="{ fontSize: kFontSizeLarge.px }">
					{{ invite.room_title }}
				</div>

				<AppSpacer vertical :scale="4" />

				<AppAlertBox v-if="statusText">
					{{ statusText }}
				</AppAlertBox>

				<div
					v-if="!sentInvite && invite.status === ChatInviteStatusOpen"
					:style="{ display: `flex`, gap: `12px` }"
				>
					<AppButton primary solid block @click="onClickAccept">
						{{ $gettext(`Accept`) }}
					</AppButton>
					<AppButton trans block @click="onClickDecline">
						{{ $gettext(`Decline`) }}
					</AppButton>
				</div>
			</AppLoadingFade>
		</template>
	</div>
</template>
