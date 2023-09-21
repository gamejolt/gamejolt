<script lang="ts" setup>
import { CSSProperties, Ref, ref, toRefs } from 'vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import { storeModelList } from '../../../../../../_common/model/model-store.service';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import AppStickerSelectorItem from './AppStickerSelectorItem.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';

const props = defineProps({
	...defineFormProps<StickerPackModel>(),
});

const { model } = toRefs(props);

const minStickers = ref(3);
const maxStickers = ref(5);
const stickers = ref([]) as Ref<StickerModel[]>;

const data = createShopProductBaseForm({
	typename: 'Sticker_Pack',
	baseModel: model?.value,
	fields: {
		stickers: [] as number[],
	},
	complexFields: ['stickers'],
	onLoad(payload) {
		stickers.value = storeModelList(StickerModel, payload.stickers);
		minStickers.value = payload.minStickers || minStickers.value;
		maxStickers.value = payload.maxStickers || maxStickers.value;
		data.form.formModel.stickers = stickers.value.map(i => i.id);
	},
});

const { form } = data;

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
	gap: `12px`,
};

function getIndex(id: number) {
	return form.formModel.stickers.indexOf(id);
}

function isSelected(id: number) {
	return getIndex(id) !== -1;
}

function toggle(id: number) {
	const index = getIndex(id);
	if (index !== -1) {
		form.formModel.stickers.splice(index, 1);
	} else {
		form.formModel.stickers.push(id);
	}
}
</script>

<template>
	<FormShopProductBase :data="data">
		<template #default>
			<!-- TODO(creator-shops) should probably make this a form control or something for easy validation -->
			<div :style="[gridStyles]">
				<AppStickerSelectorItem
					v-for="i in stickers"
					:key="i.id"
					:sticker="i"
					:selected="isSelected(i.id)"
					:disabled="form.formModel.stickers.length >= maxStickers && !isSelected(i.id)"
					@click="toggle(i.id)"
				/>
			</div>
		</template>
	</FormShopProductBase>
</template>
