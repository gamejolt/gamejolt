<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { Background } from '../../../_common/background/background.model';
import AppButton from '../../../_common/button/AppButton.vue';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlBackground from '../../../_common/form-vue/controls/AppFormControlBackground.vue';
import AppFormControlToggleButton from '../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButton.vue';
import AppFormControlToggleButtonGroup from '../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButtonGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../_common/form-vue/validators';
import AppLoading from '../../../_common/loading/AppLoading.vue';
import { ModalConfirm } from '../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { useGridStore } from '../grid/grid-store';
import { editChatRoomBackground, editChatRoomTitle, leaveGroupRoom } from './client';
import AppChatMemberListItem from './member-list/AppChatMemberListItem.vue';
import { ChatRoom } from './room';
import { ChatUser } from './user';

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
const { chatUnsafe: chat } = useGridStore();

const titleMinLength = ref<number>();
const titleMaxLength = ref<number>();

const isLoadingBackgrounds = ref(false);
const isSettingBackground = ref(false);

const notificationLevel = ref('');
const backgrounds = ref<Background[]>([]);
const roomBackgroundId = ref(room.value.background?.id || null);

// When a user selects a background in this form, it sends a grid message to
// everyone notifying them the room changed and updating the model. This also
// happens when you change the background yourself.
//
// If the background changes, we need to fetch new backgrounds so that our
// background list is never displaying old content, like backgrounds we don't
// own and can't set.
watch(
	() => room.value.background,
	() => {
		// If we don't have any backgrounds available to us (none unlocked or no
		// permissions to set a background), don't bother fetching new
		// backgrounds.
		if (backgrounds.value.length === 0) {
			return;
		}

		if (isLoadingBackgrounds.value) {
			return;
		}

		reloadBackgroundForm(true);
	}
);

const form: FormController<ChatRoom> = createForm({
	model: room,
	loadUrl: `/web/chat/rooms/room-edit`,
	onLoad(payload) {
		titleMinLength.value = payload.titleMinLength;
		titleMaxLength.value = payload.titleMaxLength;
	},
	onSubmit: () => editChatRoomTitle(chat.value, room.value, form.formModel.title),
});

type FormBackground = {
	background_id: number | null;
};

const backgroundForm: FormController<FormBackground> = createForm({
	loadUrl: `/web/chat/rooms/backgrounds/${room.value.id}`,
	onLoad(payload) {
		backgrounds.value = Background.populate(payload.backgrounds);
		roomBackgroundId.value = payload.roomBackgroundId || null;
		backgroundForm.formModel.background_id = roomBackgroundId.value;
	},
	onSubmit: () =>
		editChatRoomBackground(
			chat.value,
			room.value,
			backgroundForm.formModel.background_id || null
		),
});

type FormNotificationLevel = {
	level: string;
};

const notificationLevelForm: FormController<FormNotificationLevel> = createForm({
	loadUrl: `/web/chat/rooms/get-notification-settings/${room.value.id}`,
	onLoad(payload) {
		notificationLevel.value = payload.level;
		notificationLevelForm.formModel.level = payload.level;
	},
	async onSubmit() {
		const payload = await Api.sendRequest(
			`/web/chat/rooms/set-notification-settings/${room.value.id}`,
			{ level: notificationLevelForm.formModel.level },
			{ detach: true }
		);
		notificationLevelForm.formModel.level = payload.level;
	},
});

const isOwner = computed(
	() =>
		room.value && !!chat.value.currentUser && room.value.owner_id === chat.value.currentUser.id
);

const canEditTitle = computed(() => !room.value.isPmRoom && isOwner.value);
const canEditBackground = computed(() => backgrounds.value.length > 0);
const shouldShowLeave = computed(() => !room.value.isPmRoom);
const hasLoadedBackgrounds = computed(() => backgroundForm.isLoadedBootstrapped);

const membersPreview = computed(() => {
	if (showMembersPreview.value) {
		return members.value.slice(0, 5);
	}
	return [];
});

const notificationSettings = computed(() => {
	const settings = [];

	settings.push({
		label: $gettext(`All Messages`),
		value: 'all',
	});
	if (!room.value.isPmRoom) {
		settings.push({
			label: $gettext(`Only @mentions`),
			value: 'mentions',
		});
	}
	settings.push({
		label: $gettext(`Nothing`),
		value: 'off',
	});

	return settings;
});

async function reloadBackgroundForm(retryOnDesync: boolean) {
	try {
		isLoadingBackgrounds.value = true;
		await backgroundForm.reload();
	} finally {
		const currentBgId = room.value.background?.id || null;
		const expectedBgId = roomBackgroundId.value;

		if (currentBgId === expectedBgId) {
			// If our current background is set to whatever backend tells us is
			// correct, set our loading state to false.
			isLoadingBackgrounds.value = false;
		} else if (retryOnDesync) {
			// Call this function one more time if our expected id doesn't match
			// our current room background.
			await reloadBackgroundForm(false);
		} else {
			// If we're still out of sync after fetching a second time, find the
			// expected background in our list of backgrounds and manually
			// assign that to our room.
			const background = backgrounds.value.find(i => i.id === expectedBgId);
			room.value.background = background;
			isLoadingBackgrounds.value = false;
		}
	}
}

async function leaveRoom() {
	const result = await ModalConfirm.show(
		$gettext(`Are you sure you want to leave the group chat?`)
	);

	if (!result) {
		return;
	}

	leaveGroupRoom(chat.value, room.value);
}
</script>

<template>
	<div class="form-chat-room-settings">
		<div
			:style="{
				visibility: hasLoadedBackgrounds ? 'visible' : 'hidden',
				width: '100%',
			}"
		>
			<template v-if="canEditTitle">
				<AppForm :controller="form">
					<AppFormGroup
						name="title"
						class="-pad sans-margin-bottom"
						:label="$gettext('Group Name')"
						small
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

					<AppFormStickySubmit class="-pad">
						<AppFormButton>
							<AppTranslate>Save</AppTranslate>
						</AppFormButton>
					</AppFormStickySubmit>
				</AppForm>
			</template>

			<AppForm
				:controller="backgroundForm"
				:forced-is-loading="isSettingBackground || isLoadingBackgrounds"
				@changed="backgroundForm.submit"
			>
				<template v-if="canEditBackground">
					<AppFormGroup
						name="background_id"
						class="-pad sans-margin-bottom"
						:label="$gettext(`Background`)"
						optional
						small
					>
						<AppFormControlBackground :backgrounds="backgrounds" :tile-size="40" />
					</AppFormGroup>

					<AppSpacer vertical :scale="6" />
				</template>
			</AppForm>

			<template v-if="canEditTitle || canEditBackground">
				<hr />
				<AppSpacer vertical :scale="6" />
			</template>

			<AppForm
				:controller="notificationLevelForm"
				:forced-is-loading="notificationLevelForm.isProcessing ? true : undefined"
				@changed="notificationLevelForm.submit"
			>
				<AppFormGroup
					name="level"
					class="-pad sans-margin-bottom"
					:label="$gettext(`Notifications`)"
					small
				>
					<AppFormControlToggleButtonGroup
						:direction="Screen.isMobile ? 'row' : 'column'"
					>
						<AppFormControlToggleButton
							v-for="{ label, value } of notificationSettings"
							:key="label"
							:value="value"
						>
							{{ label }}
						</AppFormControlToggleButton>
					</AppFormControlToggleButtonGroup>
				</AppFormGroup>
			</AppForm>

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
		</div>

		<AppLoading
			v-if="!hasLoadedBackgrounds"
			centered
			hide-label
			stationary
			:style="{ position: 'absolute' }"
		/>
	</div>
</template>

<style lang="stylus" scoped>
$-padding = 16px
$-padding-v = 24px

.form-chat-room-settings
	padding: $-padding-v 0
	position: relative
	display: flex
	align-items: center
	justify-content: center

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
</style>
