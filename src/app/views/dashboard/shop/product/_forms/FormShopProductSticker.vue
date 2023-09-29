<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import {
	validateMaxLength,
	validateMinLength,
} from '../../../../../../_common/form-vue/validators';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useShopManagerStore } from '../../shop.store';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<StickerModel>(),
});

const { model } = toRefs(props);

const emojiNameMinLength = ref(3);
const emojiNameMaxLength = ref(30);
const emojiPrefix = ref(props.model?.emoji?.prefix || 'username');

const shopStore = useShopManagerStore()!;

const data = createShopProductBaseForm({
	shopStore,
	typename: 'Sticker',
	baseModel: model?.value,
	fields: {
		emoji_name: model?.value?.emoji?.short_name ?? '',
	},
	onLoad({ payload }) {
		emojiNameMinLength.value = payload.emojiNameMinLength || emojiNameMinLength.value;
		emojiNameMaxLength.value = payload.emojiNameMaxLength || emojiNameMaxLength.value;
		emojiPrefix.value = payload.emojiPrefix || emojiPrefix.value;

		const changeData = JSON.parse(data.latestChangeRequest.value?.change_data || '{}');
		if (changeData.emoji_name) {
			data.form.formModel.emoji_name = changeData.emoji_name;
		}
	},
});

const { form, isEditing } = data;

// TODO(creator-shops) Emoji name availability validator.
const emojiNameAvailabilityUrl = computed(() => {
	if (isEditing) {
		return ``;
	}
	return ``;
});
</script>

<template>
	<!-- TODO(creator-shops) This should be checking both `canAddPremium` and
	`canAddFree` for the sticker group. -->
	<FormShopProductBase :data="data" :diff-keys="['emoji_name']">
		<template #default="{ formGroupBindings }">
			<AppFormGroup
				v-bind="formGroupBindings"
				name="emoji_name"
				:label="$gettext(`Emoji name`)"
			>
				<AppFormControl
					:placeholder="$gettext(`Emoji name...`)"
					:validators="[
						validateMinLength(emojiNameMinLength),
						validateMaxLength(emojiNameMaxLength),
						// validateAvailability({
						// 	url: emojiNameAvailabilityUrl,
						// 	initVal: form.formModel.emoji_name,
						// }),
					]"
				/>
				<AppFormControlErrors />
			</AppFormGroup>
		</template>
	</FormShopProductBase>
</template>
