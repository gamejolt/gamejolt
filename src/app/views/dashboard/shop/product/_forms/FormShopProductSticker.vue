<script lang="ts" setup>
import { toRefs } from 'vue';
import AppAspectRatio from '../../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<StickerModel>(),
});

const { model } = toRefs(props);

const data = createShopProductBaseForm({
	typename: 'Sticker',
	baseModel: model?.value,
	fields: {
		emoji_name: model?.value?.emoji?.short_name ?? '',
	},
});
</script>

<template>
	<FormShopProductBase :data="data">
		<template #diff="{ state, imgUrl }">
			<AppAspectRatio :ratio="1">
				<img
					:style="[
						// imgData.styles,
						{
							width: `100%`,
							height: `100%`,
						},
					]"
					:src="imgUrl!"
				/>
			</AppAspectRatio>

			<template v-if="state === 'after'"> After </template>
		</template>

		<AppFormGroup name="emoji_name" :label="$gettext(`Emoji name`)">
			<AppFormControl />
			<AppFormControlErrors />
		</AppFormGroup>
	</FormShopProductBase>
</template>
