<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import AppIllustration from '../../../../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../../../../../../_common/illustration/illustrations';
import AppLoading from '../../../../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../../_common/modal/modal.service';
import { storeModelList } from '../../../../../../../_common/model/model-store.service';
import { StickerModel } from '../../../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { run } from '../../../../../../../utils/utils';
import AppFormStickerSelectorItem from './AppFormStickerSelectorItem.vue';

const props = defineProps({
	stickerPackId: {
		type: Number,
		default: undefined,
	},
	premium: {
		type: Boolean,
		required: true,
	},
	currentStickers: {
		type: Array as PropType<StickerModel[]>,
		required: true,
	},
	availableSlots: {
		type: Number,
		required: true,
	},
});

const { stickerPackId, premium, currentStickers } = toRefs(props);

const router = useRouter();
const modal = useModal()!;

const isLoading = ref(true);
const selectableStickers = ref<StickerModel[]>([]);
const selectedStickers = ref<StickerModel[]>([]);

/** Combined current in the pack and the newly selected */
const combinedStickers = computed(() => currentStickers.value.concat(selectedStickers.value));

run(async () => {
	let url = '/web/dash/creators/shop/packs/stickers';
	if (stickerPackId?.value) {
		url += `/${stickerPackId.value}`;
	}

	const payload = await Api.sendRequest(url);

	selectableStickers.value = storeModelList(
		StickerModel,
		premium.value ? payload.selectablePremium : payload.selectableFree
	).filter(i => !currentStickers.value.includes(i));

	isLoading.value = false;
});

function getIndex(sticker: StickerModel) {
	return selectedStickers.value.indexOf(sticker);
}

function isSelected(sticker: StickerModel) {
	return getIndex(sticker) !== -1;
}

function toggle(sticker: StickerModel) {
	const index = getIndex(sticker);
	if (index !== -1) {
		selectedStickers.value.splice(index, 1);
	} else {
		selectedStickers.value.push(sticker);
	}
}

function confirm() {
	modal.resolve(combinedStickers.value);
}

function gotoDashboard() {
	modal.dismiss();
	router.push({
		name: 'dash.shop.overview',
	});
}

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
	gap: `12px`,
};
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>

			<AppButton v-if="selectedStickers.length" solid primary @click="confirm()">
				{{
					$ngettext(`Add 1 sticker`, `Add %{ count } stickers`, selectedStickers.length, {
						count: selectedStickers.length,
					})
				}}
			</AppButton>
		</div>

		<div v-if="isLoading || selectableStickers.length" class="modal-header">
			<h2 class="modal-title text-center">
				{{ $gettext(`Select stickers to add`) }}
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="isLoading">
				<AppLoading centered />
			</template>
			<template v-else-if="!selectableStickers.length">
				<AppIllustration :asset="illExtremeSadness">
					<template v-if="!currentStickers.length">
						<p>{{ $gettext(`You have no stickers to put into this pack.`) }}</p>
						<p>
							{{
								$gettext(
									`Before creating a pack, you'll need to add your stickers indivdually from your shop dashboard.`
								)
							}}
						</p>
					</template>
					<template v-else>
						<p>{{ $gettext(`You have no more stickers to put into this pack.`) }}</p>
						<p>{{ $gettext(`You can add new stickers from your shop dashboard.`) }}</p>
					</template>

					<br />

					<p>
						<AppButton @click="gotoDashboard()">
							{{ $gettext(`Go to shop dashboard`) }}
						</AppButton>
					</p>
				</AppIllustration>
			</template>
			<template v-else>
				<div :style="gridStyles">
					<AppFormStickerSelectorItem
						v-for="sticker of selectableStickers"
						:key="sticker.id"
						:sticker="sticker"
						:selected="isSelected(sticker)"
						:disabled="
							combinedStickers.length >= availableSlots && !isSelected(sticker)
						"
						@click="toggle(sticker)"
					/>
				</div>
			</template>
		</div>
	</AppModal>
</template>
