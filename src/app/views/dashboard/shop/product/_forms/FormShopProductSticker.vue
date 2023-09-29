<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
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
</script>

<template>
	<!-- TODO(creator-shops) This should be checking both `canAddPremium` and
	`canAddFree` for the sticker group. -->
	<FormShopProductBase :data="data" :diff-keys="['emoji_name']">
		<AppFormGroup name="emoji_name" :label="$gettext(`Emoji name`)">
			<!-- TODO(creator-shops) validators for emoji name, use the same styling as [FormShopProductBase]. -->
			<AppFormControl :placeholder="$gettext(`Emoji name...`)" />
			<AppFormControlErrors />
		</AppFormGroup>
	</FormShopProductBase>
</template>
