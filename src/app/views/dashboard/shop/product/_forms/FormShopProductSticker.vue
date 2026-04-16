<script lang="ts" setup>
import { computed, ref } from 'vue';

import FormShopProductBase, { createShopProductBaseForm } from '~app/views/dashboard/shop/product/_forms/FormShopProductBase.vue';
import AppDashShopProductHeader from '~app/views/dashboard/shop/product/AppDashShopProductHeader.vue';
import { ShopDashProductType, useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '~common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import {
	validateAvailability,
	validateEmojiName,
	validateMaxLength,
	validateMinLength,
} from '~common/form-vue/validators';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import { StickerModel } from '~common/sticker/sticker.model';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	model?: StickerModel;
};
const { model } = defineProps<Props>();

const emojiNameMinLength = ref(3);
const emojiNameMaxLength = ref(30);
const emojiPrefix = ref(model?.emoji?.prefix);

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.Sticker,
	baseModel: model,
	fields: {
		emoji_name: model?.emoji?.short_name ?? '',
	},
	onLoad({ payload }) {
		emojiNameMinLength.value = payload.emojiNameMinLength || emojiNameMinLength.value;
		emojiNameMaxLength.value = payload.emojiNameMaxLength || emojiNameMaxLength.value;
		emojiPrefix.value = payload.emojiPrefix || emojiPrefix.value;

		const changeRequest = data.changeRequest.value;
		const formModel = data.form.formModel;
		const initialFormModel = data.initialFormModel;

		if (changeRequest) {
			const emojiName = changeRequest.change_sticker_emoji_short_name || formModel.name;
			formModel.emoji_name = emojiName;
			initialFormModel.value.emoji_name = emojiName;
		}
	},
});

const { baseModel, getFieldAvailabilityUrl, productType, isEditing } = data;

const heading = computed(() => {
	if (productType.value === undefined) {
		return $gettext(`What type of sticker are you adding?`);
	}

	return isEditing ? $gettext(`Edit sticker`) : $gettext(`Add sticker`);
});
</script>

<template>
	<AppDashShopProductHeader :product-type="productType" :heading="heading">
		<template v-if="productType === ShopDashProductType.Basic">
			<div>
				{{
					$gettext(
						`Basic stickers are a free-tier option, must be static, and can only be added to reward packs.`
					)
				}}
			</div>
			<div>
				<AppLinkHelp page="stickers">
					{{ $gettext(`Learn about stickers and sticker packs.`) }}
				</AppLinkHelp>
			</div>
		</template>
		<template v-else-if="productType === ShopDashProductType.Premium">
			<div>
				{{
					$gettext(
						`Premium stickers are available for purchase within premium packs in your shop for joltbux. We recommend you upload animated stickers.`
					)
				}}
			</div>
			<div>
				<AppLinkHelp page="shop">
					{{ $gettext(`Learn about the shop.`) }}
				</AppLinkHelp>
			</div>
		</template>
	</AppDashShopProductHeader>

	<FormShopProductBase :data="data">
		<template #fields="{ formGroupBindings }">
			<AppFormGroup
				v-bind="formGroupBindings"
				name="emoji_name"
				tiny-label-margin
				:label="$gettext(`Emoji name`)"
			>
				<div class="help-block">
					{{
						$gettext(
							`Once mastered your sticker can be used as an emoji. This is the name that will show when selecting the emoji to use.`
						)
					}}
				</div>

				<AppFormControlPrefix :prefix="emojiPrefix || ''">
					<AppFormControl
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
