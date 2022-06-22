<script lang="ts" setup>
import { computed, inject, PropType, ref } from 'vue';
import AppButton from '../../../_common/button/AppButton.vue';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { FIRESIDE_ROLES } from '../../../_common/fireside/role/role.model';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlToggleButton from '../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButton.vue';
import AppFormControlToggleButtonGroup from '../../../_common/form-vue/controls/toggle-button/AppFormControlToggleButtonGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../_common/form-vue/validators';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import { ChatStoreKey } from '../chat/chat-store';
import { extinguishFireside, FiresideController, publishFireside } from './controller/controller';

const props = defineProps({
	c: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

const emit = defineEmits({
	submit: (_model: Fireside) => true,
});

// Controller doesn't change.
// eslint-disable-next-line vue/no-setup-props-destructure
const c = props.c;
const { fireside, chatRoom, canPublish, canExtinguish, gridChannel } = c;

const chatStore = inject(ChatStoreKey)!;
const chat = computed(() => chatStore.chat!);

const form: FormController<Fireside> = createForm({
	modelClass: Fireside,
	// Just wrapping in a ref to make the form happy. It never actually changes.
	model: ref(fireside),
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

// type FormModelBackground = {
// 	background_id: number | null;
// };

// const backgrounds = ref<Background[]>([]);
// const roomBackgroundId = ref(chatRoom.value.background?.id || null);
// const hasLoadedBackgrounds = computed(() => backgroundForm.isLoadedBootstrapped);

// const backgroundForm: FormController<FormModelBackground> = createForm({
// 	loadUrl: `/web/chat/rooms/backgrounds/${chatRoom.value.id}`,
// 	onLoad(payload) {
// 		backgrounds.value = Background.populate(payload.backgrounds);
// 		roomBackgroundId.value = payload.roomBackgroundId || null;
// 		backgroundForm.formModel.background_id = roomBackgroundId.value;
// 	},
// 	onSubmit: async () =>
// 		editChatRoomBackground(
// 			chat.value,
// 			chatRoom.value,
// 			backgroundForm.formModel.background_id || null
// 		),
// });

type FormModelSettings = {
	allow_images: FIRESIDE_ROLES;
	allow_gifs: FIRESIDE_ROLES;
	allow_links: FIRESIDE_ROLES;
};

const settingsForm: FormController<FormModelSettings> = createForm({
	onInit() {
		// TODO
		settingsForm.formModel.allow_images = 'audience';
		settingsForm.formModel.allow_gifs = 'audience';
		settingsForm.formModel.allow_links = 'host';
	},
	// TODO
	// onSubmit() {
	// 	const { formModel } = form;

	// 	// %{"fireside_hash" => fireside_hash} = payload,
	// 	gridChannel.value?.socketChannel.push('update_chat_settings', {
	// 		fireside_hash: formModel.hash,
	// 	});
	// },
});

const settingsRoleOptions = computed<{ label: string; value: FIRESIDE_ROLES | null }[]>(() => [
	{ label: $gettext('Only owner'), value: 'host' },
	{ label: $gettext('Only hosts'), value: 'cohost' },
	{ label: $gettext('Everyone'), value: 'audience' },
]);

function onClickPublish() {
	publishFireside(c);
}

function onClickExtinguish() {
	extinguishFireside(c);
}
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
			name="allow_images"
			class="sans-margin-bottom"
			:label="$gettext(`Allow images in fireside chat`)"
			small
		>
			<AppFormControlToggleButtonGroup>
				<AppFormControlToggleButton
					v-for="{ label, value } of settingsRoleOptions"
					:key="label"
					:value="value"
				>
					{{ label }}
				</AppFormControlToggleButton>
			</AppFormControlToggleButtonGroup>
		</AppFormGroup>

		<AppSpacer vertical :scale="6" />

		<AppFormGroup
			name="allow_gifs"
			class="sans-margin-bottom"
			:label="$gettext(`Allow GIFs in fireside chat`)"
			small
		>
			<AppFormControlToggleButtonGroup>
				<AppFormControlToggleButton
					v-for="{ label, value } of settingsRoleOptions"
					:key="label"
					:value="value"
				>
					{{ label }}
				</AppFormControlToggleButton>
			</AppFormControlToggleButtonGroup>
		</AppFormGroup>

		<AppSpacer vertical :scale="6" />

		<AppFormGroup
			name="allow_links"
			class="sans-margin-bottom"
			:label="$gettext(`Allow links in fireside chat`)"
			small
		>
			<AppFormControlToggleButtonGroup>
				<AppFormControlToggleButton
					v-for="{ label, value } of settingsRoleOptions"
					:key="label"
					:value="value"
				>
					{{ label }}
				</AppFormControlToggleButton>
			</AppFormControlToggleButtonGroup>
		</AppFormGroup>
	</AppForm>

	<hr />
	<AppSpacer vertical :scale="6" />

	<AppButton
		v-if="canPublish"
		icon="megaphone"
		icon-color="primary"
		block
		@click="onClickPublish"
	>
		<AppTranslate>Make fireside public</AppTranslate>
	</AppButton>

	<AppButton
		v-if="canExtinguish"
		icon="remove"
		icon-color="notice"
		block
		@click="onClickExtinguish"
	>
		<AppTranslate>Extinguish fireside</AppTranslate>
	</AppButton>
</template>

<style lang="stylus" scoped></style>
