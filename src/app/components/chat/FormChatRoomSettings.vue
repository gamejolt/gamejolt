<script lang="ts" setup>
import { computed, ref, toRef, watch } from 'vue';

import {
	editChatRoomBackground,
	editChatRoomTitle,
	leaveGroupRoom,
} from '~app/components/chat/client';
import FormChatRoomSettingsMemberPreview from '~app/components/chat/FormChatRoomSettingsMemberPreview.vue';
import { ChatRoomModel } from '~app/components/chat/room';
import { useGridStore } from '~app/components/grid/grid-store';
import { Api } from '~common/api/api.service';
import { BackgroundModel } from '~common/background/background.model';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '~common/form-vue/AppFormStickySubmit.vue';
import AppFormControlBackground from '~common/form-vue/controls/AppFormControlBackground.vue';
import AppFormControlToggleButton from '~common/form-vue/controls/toggle-button/AppFormControlToggleButton.vue';
import AppFormControlToggleButtonGroup from '~common/form-vue/controls/toggle-button/AppFormControlToggleButtonGroup.vue';
import { validateMaxLength, validateMinLength } from '~common/form-vue/validators';
import AppLoading from '~common/loading/AppLoading.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { storeModelList } from '~common/model/model-store.service';
import { Screen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	room: ChatRoomModel;
	showMembersPreview?: boolean;
};
const { room } = defineProps<Props>();

const emit = defineEmits<{
	submit: [model: ChatRoomModel];
	viewMembers: [];
}>();
const { chatUnsafe: chat } = useGridStore();

const titleMinLength = ref<number>();
const titleMaxLength = ref<number>();

const isLoadingBackgrounds = ref(false);
const isSettingBackground = ref(false);

const notificationLevel = ref('');
const backgrounds = ref<BackgroundModel[]>([]);
const roomBackgroundId = ref(room.background?.id || null);

// When a user selects a background in this form, it sends a grid message to
// everyone notifying them the room changed and updating the model. This also
// happens when you change the background yourself.
//
// If the background changes, we need to fetch new backgrounds so that our
// background list is never displaying old content, like backgrounds we don't
// own and can't set.
watch(
	() => room.background,
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

type RoomTitleFormModel = ChatRoomModel;

const form: FormController<RoomTitleFormModel> = createForm<RoomTitleFormModel>({
	model: toRef(() => room),
	loadUrl: `/web/chat/rooms/room-edit`,
	onLoad(payload) {
		titleMinLength.value = payload.titleMinLength;
		titleMaxLength.value = payload.titleMaxLength;
	},
	onSubmit: () => editChatRoomTitle(chat.value, room, form.formModel.title),
});

type BackgroundFormModel = {
	background_id: number | null;
};

const backgroundForm: FormController<BackgroundFormModel> = createForm({
	loadUrl: `/web/chat/rooms/backgrounds/${room.id}`,
	onLoad(payload) {
		backgrounds.value = storeModelList(BackgroundModel, payload.backgrounds);
		roomBackgroundId.value = payload.roomBackgroundId || null;
		backgroundForm.formModel.background_id = roomBackgroundId.value;
	},
	onSubmit: () =>
		editChatRoomBackground(chat.value, room, backgroundForm.formModel.background_id || null),
});

type NotificationLevelFormModel = {
	level: string;
};

const notificationLevelForm: FormController<NotificationLevelFormModel> = createForm({
	loadUrl: `/web/chat/rooms/get-notification-settings/${room.id}`,
	onLoad(payload) {
		notificationLevel.value = payload.level;
		notificationLevelForm.formModel.level = payload.level;
	},
	async onSubmit() {
		const payload = await Api.sendRequest(
			`/web/chat/rooms/set-notification-settings/${room.id}`,
			{ level: notificationLevelForm.formModel.level },
			{ detach: true }
		);
		notificationLevelForm.formModel.level = payload.level;
	},
});

const isOwner = toRef(
	() => room && !!chat.value.currentUser && room.owner_id === chat.value.currentUser.id
);

const canEditTitle = toRef(() => !room.isPmRoom && isOwner.value);
const canEditBackground = toRef(() => backgrounds.value.length > 0);
const shouldShowLeave = toRef(() => !room.isPmRoom);
const hasLoadedBackgrounds = toRef(() => backgroundForm.isLoadedBootstrapped);

const notificationSettings = computed(() => {
	const settings = [];

	settings.push({
		label: $gettext(`All Messages`),
		value: 'all',
	});
	if (!room.isPmRoom) {
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
		const currentBgId = room.background?.id || null;
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

			room.background = background;
			isLoadingBackgrounds.value = false;
		}
	}
}

async function leaveRoom() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to leave the group chat?`)
	);

	if (!result) {
		return;
	}

	leaveGroupRoom(chat.value, room);
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
							:validators="[
								validateMinLength(titleMinLength!),
								validateMaxLength(titleMaxLength!),
							]"
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

			<FormChatRoomSettingsMemberPreview
				v-if="showMembersPreview"
				:room="room"
				@view-members="emit('viewMembers')"
			/>

			<template v-if="shouldShowLeave">
				<AppSpacer vertical :scale="6" />
				<hr />
				<AppSpacer vertical :scale="2" />

				<a @click="leaveRoom">
					<div class="-pad -action">
						{{ $gettext(`Leave group`) }}
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
$-action-padding-v = 12px

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

.-action
	padding: $-action-padding-v $-padding
	font-size: $font-size-base

.-header
	padding: 0 $-padding
	margin-bottom: 8px
	font-weight: 400
	font-size: 13px
</style>
