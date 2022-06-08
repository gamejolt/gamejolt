<script lang="ts" setup>
import { computed, inject, toRefs } from 'vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlStackedButtonGroup from '../../../../_common/form-vue/controls/stacked-button/AppFormControlStackedButtonGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../../_common/form-vue/validators';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { ChatStoreKey } from '../../chat/chat-store';
import { ChatRoom } from '../../chat/room';

const props = defineProps({
	fireside: {
		type: Fireside,
		required: true,
	},
	room: {
		type: ChatRoom,
		required: true,
	},
});

const emit = defineEmits({
	submit: (_model: Fireside) => true,
});

const { fireside, room } = toRefs(props);

const chatStore = inject(ChatStoreKey)!;
const chat = computed(() => chatStore.chat!);

const form: FormController<Fireside> = createForm({
	modelClass: Fireside,
	model: fireside,
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

// type FormModelBackground = {
// 	background_id: number | null;
// };

// const backgrounds = ref<Background[]>([]);
// const roomBackgroundId = ref(room.value.background?.id || null);
// const hasLoadedBackgrounds = computed(() => backgroundForm.isLoadedBootstrapped);

// const backgroundForm: FormController<FormModelBackground> = createForm({
// 	loadUrl: `/web/chat/rooms/backgrounds/${room.value.id}`,
// 	onLoad(payload) {
// 		backgrounds.value = Background.populate(payload.backgrounds);
// 		roomBackgroundId.value = payload.roomBackgroundId || null;
// 		backgroundForm.formModel.background_id = roomBackgroundId.value;
// 	},
// 	onSubmit: async () =>
// 		editChatRoomBackground(
// 			chat.value,
// 			room.value,
// 			backgroundForm.formModel.background_id || null
// 		),
// });

type FormModelSettings = {
	chat_allow_images: number;
	chat_allow_gifs: number;
};

const settingsForm: FormController<FormModelSettings> = createForm({
	onInit() {
		settingsForm.formModel.chat_allow_images = 2;
		settingsForm.formModel.chat_allow_gifs = 2;
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			name="title"
			class="sans-margin-bottom"
			:label="$gettext(`Fireside name`)"
			small
		>
			<AppFormControl
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(100)]"
				validate-on-blur
				focus
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<AppSpacer vertical :scale="4" />

		<AppFormStickySubmit>
			<AppFormButton>
				<AppTranslate>Save</AppTranslate>
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>

	<!-- <AppForm
		:controller="backgroundForm"
		:forced-is-loading="isSettingBackground || isLoadingBackgrounds"
		@changed="backgroundForm.submit"
	>
		<AppFormGroup
			name="background_id"
			class="sans-margin-bottom"
			:label="$gettext(`Background`)"
			optional
			small
		>
			<AppFormBackground :backgrounds="backgrounds" :tile-size="40" />
		</AppFormGroup>

		<AppSpacer vertical :scale="6" />
	</AppForm> -->

	<hr />
	<AppSpacer vertical :scale="6" />

	<AppForm :controller="settingsForm" @changed="settingsForm.submit">
		<!-- :forced-is-loading="notificationLevelForm.isProcessing ? true : undefined" -->
		<AppFormGroup
			name="chat_allow_images"
			class="sans-margin-bottom"
			:label="$gettext(`Allow images in fireside chat`)"
			small
		>
			<AppFormControlStackedButtonGroup
				:options="[
					{ label: 'No one', value: 0 },
					{ label: 'Only hosts', value: 1 },
					{ label: 'Everyone', value: 2 },
				]"
			/>
		</AppFormGroup>

		<AppSpacer vertical :scale="6" />

		<AppFormGroup
			name="chat_allow_gifs"
			class="sans-margin-bottom"
			:label="$gettext(`Allow GIFs in fireside chat`)"
			small
		>
			<AppFormControlStackedButtonGroup
				:options="[
					{ label: 'No one', value: 0 },
					{ label: 'Only hosts', value: 1 },
					{ label: 'Everyone', value: 2 },
				]"
			/>
		</AppFormGroup>
	</AppForm>
</template>

<style lang="stylus" scoped></style>
