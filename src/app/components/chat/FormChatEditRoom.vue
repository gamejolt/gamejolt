<script lang="ts" setup>
import { ref, toRef } from 'vue';
import AppForm, { createForm, FormController } from '../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../_common/form-vue/validators';
import { ChatRoom } from './room';

type FormModel = ChatRoom & {};

const props = defineProps({
	room: {
		type: ChatRoom,
		required: true,
	},
});

const emit = defineEmits({
	submit: (_model: ChatRoom) => true,
});

const titleMinLength = ref<number>();
const titleMaxLength = ref<number>();

const form: FormController<FormModel> = createForm({
	modelClass: ChatRoom,
	model: toRef(props, 'room'),
	loadUrl: `/web/chat/rooms/room-edit`,
	onLoad(payload) {
		titleMinLength.value = payload.titleMinLength;
		titleMaxLength.value = payload.titleMaxLength;
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext('Group Name')" optional>
			<AppFormControl
				type="text"
				:validators="[validateMinLength(titleMinLength), validateMaxLength(titleMaxLength)]"
				validate-on-blur
			/>

			<AppFormControlErrors />
		</AppFormGroup>

		<!-- <AppButton solid primary :disabled="!valid" @click="onRename">
			<AppTranslate>Rename</AppTranslate>
		</AppButton> -->
	</AppForm>
</template>
