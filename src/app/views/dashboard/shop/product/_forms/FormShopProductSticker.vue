<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import {
	validateAvailability,
	validateEmojiName,
	validateMaxLength,
	validateMinLength,
} from '../../../../../../_common/form-vue/validators';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { ShopDashProductType, useShopDashStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<StickerModel>(),
});

const { model } = toRefs(props);

const emojiNameMinLength = ref(3);
const emojiNameMaxLength = ref(30);
const emojiPrefix = ref(props.model?.emoji?.prefix);

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.Sticker,
	baseModel: model?.value,
	fields: {
		emoji_name: model?.value?.emoji?.short_name ?? '',
	},
	onLoad({ payload }) {
		emojiNameMinLength.value = payload.emojiNameMinLength || emojiNameMinLength.value;
		emojiNameMaxLength.value = payload.emojiNameMaxLength || emojiNameMaxLength.value;
		emojiPrefix.value = payload.emojiPrefix || emojiPrefix.value;

		const changeData = JSON.parse(data.changeRequest.value?.change_data || '{}');
		if (changeData.emoji_name) {
			data.form.formModel.emoji_name = changeData.emoji_name;
			if (!data.isEditing || !model?.value?.was_approved) {
				data.initialFormModel.value.emoji_name = changeData.emoji_name;
			}
		}
	},
});

const { baseModel, getFieldAvailabilityUrl, productType, isEditing } = data;

const headerMessage = computed(() => {
	switch (productType.value) {
		case ShopDashProductType.Premium:
			return $gettext(
				`Premium stickers can be placed into premium sticker packs, which can be purchased in your shop.`
			);
		case ShopDashProductType.Basic:
			return $gettext(`Basic stickers can be placed into reward sticker packs.`);
	}
});

const heading = computed(() => {
	if (productType.value === undefined) {
		return $gettext(`What type of sticker are you adding?`);
	}

	return isEditing ? $gettext(`Sticker product`) : $gettext(`Add sticker`);
});
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="heading"
		:message="headerMessage"
	/>

	<!-- TODO(creator-shops) (call) This should be checking both `canEditPremium`
	and `canEditFree` for the sticker group. -->
	<FormShopProductBase :data="data">
		<template #fields="{ formGroupBindings }">
			<AppFormGroup
				v-bind="formGroupBindings"
				name="emoji_name"
				tiny-label-margin
				:label="$gettext(`Emoji name`)"
			>
				<AppFormControlPrefix :prefix="emojiPrefix || ''">
					<AppFormControl
						:placeholder="emojiPrefix ? undefined : $gettext(`Emoji name...`)"
						:validators="[
							validateMinLength(emojiNameMinLength),
							validateMaxLength(emojiNameMaxLength),
							validateEmojiName(),
							validateAvailability({
								url: getFieldAvailabilityUrl('emoji_name'),
								initVal: baseModel?.emoji?.short_name,
							}),
						]"
					/>
				</AppFormControlPrefix>

				<AppFormControlErrors :label="$gettext(`emoji name`)" />
			</AppFormGroup>
		</template>
	</FormShopProductBase>
</template>
