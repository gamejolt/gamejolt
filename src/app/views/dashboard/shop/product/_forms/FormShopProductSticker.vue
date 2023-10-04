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
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useShopManagerStore } from '../../shop.store';
import AppDashShopProductHeader from '../_header/AppDashShopProductHeader.vue';
import FormShopProductBase, {
	ShopProductPaymentType,
	createShopProductBaseForm,
} from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<StickerModel>(),
});

const { model } = toRefs(props);

const emojiNameMinLength = ref(3);
const emojiNameMaxLength = ref(30);
const emojiPrefix = ref(props.model?.emoji?.prefix);

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
		// TODO(creator-shops) Get emoji prefix from the payload.
		emojiPrefix.value = baseModel?.emoji?.prefix || emojiPrefix.value;

		const changeData = JSON.parse(data.latestChangeRequest.value?.change_data || '{}');
		if (changeData.emoji_name) {
			data.form.formModel.emoji_name = changeData.emoji_name;
			if (!data.isEditing || !model?.value?.was_approved) {
				data.initialFormModel.value.emoji_name = changeData.emoji_name;
			}
		}
	},
});

const { baseModel, getFieldAvailabilityUrl, paymentType, isEditing } = data;

const headerMessage = computed(() => {
	switch (paymentType.value) {
		case ShopProductPaymentType.Premium:
			return $gettext(
				`Premium stickers can be placed into premium sticker packs, which can be purchased in your shop.`
			);
		case ShopProductPaymentType.Free:
			return $gettext(`Charge stickers can be placed into charge sticker packs.`);
	}
});

const heading = computed(() => {
	if (paymentType.value === undefined) {
		return $gettext(`What type of sticker are you adding?`);
	}

	return isEditing ? $gettext(`Sticker product`) : $gettext(`Add sticker`);
});
</script>

<template>
	<AppDashShopProductHeader
		:payment-type="paymentType"
		:heading="heading"
		:message="headerMessage"
	/>

	<!-- TODO(creator-shops) (call) This should be checking both `canEditPremium`
	and `canEditFree` for the sticker group. -->
	<FormShopProductBase :data="data">
		<template #default="{ formGroupBindings }">
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
