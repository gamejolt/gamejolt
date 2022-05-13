<script lang="ts">
import { computed } from '@vue/reactivity';
import { onMounted } from '@vue/runtime-core';
import { inject, onBeforeUnmount, PropType, ref, toRefs } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { Background } from '../../../_common/background/background.model';
import AppButton from '../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../_common/form-vue/AppFormStickySubmit.vue';
import { validateMaxLength, validateMinLength } from '../../../_common/form-vue/validators';
import AppLoadingFade from '../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../_common/modal/confirm/confirm-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import AppFormBackground from '../forms/background/AppFormBackground.vue';
import { ChatStoreKey } from './chat-store';
import { leaveGroupRoom } from './client';
import AppChatMemberListItem from './member-list/AppChatMemberListItem.vue';
import { ChatRoom } from './room';
import { ChatUser } from './user';

type FormModel = ChatRoom;
</script>

<script lang="ts" setup>
const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	showMembersPreview: {
		type: Boolean,
	},
	members: {
		type: Array as PropType<ChatUser[]>,
		default: () => [] as ChatUser[],
	},
});

const emit = defineEmits({
	submit: (_model: ChatRoom) => true,
	viewMembers: () => true,
});

const { room, showMembersPreview, members } = toRefs(props);

let initialBackground = room.value.background;

const chatStore = inject(ChatStoreKey)!;

const titleMinLength = ref<number>();
const titleMaxLength = ref<number>();

const backgrounds = ref<Background[]>([]);

const isLoadingNotificationSettings = ref(false);
const notificationLevel = ref('');

const form: FormController<FormModel> = createForm<ChatRoom>({
	modelClass: ChatRoom,
	model: room,
	loadUrl: `/web/chat/rooms/room-edit`,
	onLoad(payload) {
		titleMinLength.value = payload.titleMinLength;
		titleMaxLength.value = payload.titleMaxLength;

		if (payload.backgrounds) {
			backgrounds.value = Background.populate(payload.backgrounds);
		}
	},
	onSubmitSuccess() {
		initialBackground = room.value.background;
	},
});

const chat = computed(() => {
	return chatStore.chat!;
});

const isOwner = computed(() => {
	return (
		room.value && !!chat.value.currentUser && room.value.owner_id === chat.value.currentUser.id
	);
});

const canEditTitle = computed(() => {
	return !room.value.isPmRoom && isOwner.value;
});

const canEditBackground = computed(() => backgrounds.value.length > 0);

const shouldShowLeave = computed(() => {
	return !room.value.isPmRoom;
});

const membersPreview = computed(() => {
	if (showMembersPreview.value) {
		return members.value.slice(0, 5);
	}
	return [];
});

onMounted(async () => {
	isLoadingNotificationSettings.value = true;

	const payload = await Api.sendRequest(
		`/web/chat/rooms/get-notification-settings/${room.value.id}`,
		undefined,
		{ detach: true }
	);
	notificationLevel.value = payload.level;

	isLoadingNotificationSettings.value = false;
});

onBeforeUnmount(() => {
	// We've been updating the background on the actual model itself in addition
	// to the formModel so that we can see the backgrounds before submitting the
	// form. Reset to our actual background model if it doesn't match.
	if (room.value.background !== initialBackground) {
		room.value.background = initialBackground;
	}
});

async function leaveRoom() {
	const result = await ModalConfirm.show(
		$gettext(`Are you sure you want to leave the group chat?`)
	);

	if (!result) {
		return;
	}

	leaveGroupRoom(chat.value, room.value);
}

const notificationSettings = computed<{ text: string; level: string }[]>(() => {
	const settings = [];

	settings.push({
		text: $gettext(`All Messages`),
		level: 'all',
	});
	if (!room.value.isPmRoom) {
		settings.push({
			text: $gettext(`Only @mentions`),
			level: 'mentions',
		});
	}
	settings.push({
		text: $gettext(`Nothing`),
		level: 'off',
	});

	return settings;
});

async function onClickSetNotificationLevel(level: string) {
	// Set it right away for immediate feedback.
	notificationLevel.value = level;

	const payload = await Api.sendRequest(
		`/web/chat/rooms/set-notification-settings/${room.value.id}`,
		{ level },
		{ detach: true }
	);
	// Just make sure we assign the level that was actually returned.
	notificationLevel.value = payload.level;
}

function onBackgroundChanged(bg?: Background) {
	room.value.background = bg;
	form.formModel.background = bg;
}
</script>

<template>
	<AppForm :controller="form" class="form-chat-edit-room">
		<template v-if="canEditTitle">
			<AppFormGroup
				name="title"
				class="-pad sans-margin-bottom"
				:label="$gettext('Group Name')"
				optional
			>
				<AppFormControl
					type="text"
					:validators="[validateMinLength(titleMinLength!), validateMaxLength(titleMaxLength!)]"
					validate-on-blur
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<AppSpacer vertical :scale="6" />
		</template>

		<template v-if="canEditBackground">
			<div class="-header">
				<AppTranslate> Background </AppTranslate>
			</div>
			<AppFormGroup
				name="background"
				class="-pad sans-margin-bottom"
				hide-label
				optional
				:label="$gettext(`Background`)"
			>
				<AppFormBackground
					:backgrounds="backgrounds"
					:background="room.background"
					:tile-size="40"
					@background-change="onBackgroundChanged"
				/>
			</AppFormGroup>

			<AppSpacer vertical :scale="6" />
		</template>

		<AppFormStickySubmit class="-pad">
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
		</AppFormStickySubmit>

		<template v-if="canEditTitle || canEditBackground">
			<AppSpacer vertical :scale="2" />
			<hr />
			<AppSpacer vertical :scale="6" />
		</template>

		<AppLoadingFade :is-loading="isLoadingNotificationSettings">
			<div class="-header">
				<AppTranslate> Notifications </AppTranslate>
			</div>
			<div class="-pad -button-stack">
				<!-- TODO(chat-backgrounds) make into an actual form control -->
				<AppButton
					v-for="({ text, level }, index) of notificationSettings"
					:key="level"
					:class="
						notificationSettings.length > 0
							? {
									'-button-first': index === 0,
									'-button-middle':
										0 < index && index < notificationSettings.length - 1,
									'-button-last': index === notificationSettings.length - 1,
							  }
							: undefined
					"
					:primary="level === notificationLevel"
					:solid="level === notificationLevel"
					block
					@click="onClickSetNotificationLevel(level)"
				>
					{{ text }}
				</AppButton>
			</div>
		</AppLoadingFade>

		<template v-if="showMembersPreview && membersPreview.length > 0">
			<AppSpacer vertical :scale="6" />
			<hr />
			<AppSpacer vertical :scale="6" />

			<ul class="shell-nav">
				<AppChatMemberListItem
					v-for="user of membersPreview"
					:key="user.id"
					:user="user"
					:room="room"
				/>

				<div class="-pad">
					<AppSpacer vertical :scale="4" />
					<AppButton block @click="emit('viewMembers')">
						<AppTranslate>View all members</AppTranslate>
					</AppButton>
				</div>
			</ul>
		</template>

		<template v-if="shouldShowLeave">
			<AppSpacer vertical :scale="6" />
			<hr />

			<a @click="leaveRoom">
				<div class="-pad -leave">
					<AppTranslate> Leave group </AppTranslate>
				</div>
			</a>
		</template>
	</AppForm>
</template>

<style lang="stylus" scoped>
$-padding = 16px
$-padding-v = 24px

.form-chat-edit-room
	padding: $-padding-v 0

.-pad
	padding: 0 $-padding

hr
	margin: 0 $-padding

.-leave
	padding: $-padding-v $-padding
	font-size: 15px

.-header
	padding: 0 $-padding
	margin-bottom: 8px
	font-weight: 400
	font-size: 13px

.-button-stack
	> *
		margin: 0

	> .-button-first
		border-bottom-left-radius: 0
		border-bottom-right-radius: 0

	> .-button-middle
		border-radius: 0

	> .-button-last
		border-top-left-radius: 0
		border-top-right-radius: 0

	> .-button-middle
	> .-button-last
		margin-top: -($border-width-base)
</style>
