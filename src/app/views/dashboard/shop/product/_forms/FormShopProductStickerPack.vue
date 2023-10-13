<script lang="ts" setup>
import { Ref, computed, ref, toRefs, watch } from 'vue';
import AppAlertBox from '../../../../../../_common/alert/AppAlertBox.vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { defineFormProps } from '../../../../../../_common/form-vue/AppForm.vue';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { storeModelList } from '../../../../../../_common/model/model-store.service';
import AppOnHover from '../../../../../../_common/on/AppOnHover.vue';
import { ShopProductResource } from '../../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import AppStickerStackItem from '../../../../../../_common/sticker/stack/AppStickerStackItem.vue';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeBg, kThemeBgOffset, kThemeFg } from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleTyped,
	styleWhen,
} from '../../../../../../_styles/mixins';
import { kStrongEaseOut } from '../../../../../../_styles/variables';
import { ShopDashProductType, useShopDashStore } from '../../shop.store';
import AppDashShopProductHeader from '../AppDashShopProductHeader.vue';
import FormShopProductBase, { createShopProductBaseForm } from './FormShopProductBase.vue';
import { showFormStickerSelectorModal } from './_sticker-selector/modal.service';

const props = defineProps({
	...defineFormProps<StickerPackModel>(),
});

const { model } = toRefs(props);

const minStickers = ref(3);
const maxStickers = ref(5);
const stickers = ref([]) as Ref<StickerModel[]>;

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.StickerPack,
	baseModel: model?.value,
	fields: {
		stickers: [] as number[],
	},
	complexFields: ['stickers'],
	onLoad({ payload }) {
		minStickers.value = payload.minStickers || minStickers.value;
		maxStickers.value = payload.maxStickers || maxStickers.value;

		// Set the initial sticker selection up. We want to either use the
		// current stickers returned in the payload, or if there's one in the
		// change request, map them over to our known stickers from the store.
		let currentStickers = storeModelList(StickerModel, payload.currentStickers);
		data.initialFormModel.value.stickers = currentStickers.map(i => i.id);

		const changeRequest = data.changeRequest.value;
		const changeRequestStickerIds = changeRequest?.change_sticker_pack_sticker_ids || [];
		if (changeRequestStickerIds.length) {
			currentStickers = [];

			// Filter to only the valid ones we know about.
			for (const id of changeRequestStickerIds) {
				const sticker = shopStore.stickers.value.items.find(i => i.id === id);
				if (sticker) {
					currentStickers.push(sticker);
				}
			}
		}

		_setStickers(true, currentStickers);
	},
});

const { form, initialFormModel, productType, isEditing } = data;

const stickersError = computed(() => {
	if (stickers.value.length < minStickers.value) {
		return $gettext(`You must have at least %{ count } sticker(s) in a pack.`, {
			count: minStickers.value,
		});
	} else if (stickers.value.length > maxStickers.value) {
		// This shouldn't really happen, but better to be safe.
		return $gettext(`You can only have %{ count } sticker in a pack. Please remove some.`, {
			count: maxStickers.value,
		});
	}

	return null;
});

watch(
	stickersError,
	stickersError => {
		if (stickersError) {
			form.setCustomError('stickers');
		} else {
			form.clearCustomError('stickers');
		}
	},
	{ immediate: true }
);

function _setStickers(isInitial: boolean, newStickers: StickerModel[] | undefined) {
	if (!newStickers || !newStickers.length) {
		return;
	}

	const stickerIds = newStickers.map(i => i.id);
	stickers.value = newStickers;
	form.formModel.stickers = stickerIds;

	if (!isInitial) {
		form.triggerChanged();
	} else if (!model?.value?.was_approved) {
		initialFormModel.value.stickers = stickerIds;
	}
}

async function addStickers() {
	// Will return all the stickers (the current in pack as well as new).
	const newStickers = await showFormStickerSelectorModal({
		stickerPackId: model?.value?.id,
		premium: productType.value === ShopDashProductType.Premium,
		currentStickers: stickers.value,
		availableSlots: maxStickers.value,
	});

	_setStickers(false, newStickers);
}

async function removeSticker(sticker: StickerModel) {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove this sticker from the pack?`)
	);
	if (!result) {
		return;
	}

	_setStickers(
		false,
		stickers.value.filter(i => i !== sticker)
	);
}
</script>

<template>
	<AppDashShopProductHeader
		:product-type="productType"
		:heading="isEditing ? $gettext(`Edit sticker pack`) : $gettext(`Add sticker pack`)"
	>
		<template v-if="productType === ShopDashProductType.Reward">
			<div>
				{{
					$gettext(
						`Given out automatically to reward supporters for placing charged stickers on your content.`
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
						`Premium sticker packs contain premium stickers that are animated and available for purchase for Joltbux in your shop.`
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
		<template #fields>
			<h2>{{ $gettext(`Stickers`) }}</h2>

			<AppButton solid :disabled="stickers.length >= maxStickers" @click="addStickers()">
				{{ $gettext(`Add stickers`) }}
			</AppButton>

			<AppSpacer vertical :scale="4" />

			<template v-if="stickers.length >= maxStickers">
				<AppAlertBox fill-color="offset" icon="info-circle">
					{{
						$gettext(
							`You've hit the sticker limit for this pack. You can either remove some stickers or create a new pack.`
						)
					}}
				</AppAlertBox>
				<AppSpacer vertical :scale="4" />
			</template>

			<div
				:style="{
					display: `grid`,
					gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
					gap: `12px`,
				}"
			>
				<AppOnHover
					v-for="sticker of stickers"
					:key="sticker.id"
					v-slot="{ hoverBinding, hovered }"
				>
					<div
						v-bind="hoverBinding"
						:style="
							styleTyped({
								...styleBorderRadiusLg,
								backgroundColor: kThemeBgOffset,
								padding: `12px`,
								position: `relative`,
							})
						"
					>
						<div
							:style="{
								position: `absolute`,
								padding: `20px`,
								top: `-${20 + 8}px`,
								right: `-${20 + 8}px`,
								opacity: 0,
								transform: `scale(0)`,
								transition: `all 300ms ${kStrongEaseOut}`,
								pointerEvents: `none`,
								cursor: `pointer`,
								...styleWhen(hovered, {
									opacity: 1,
									transform: `scale(1)`,
									pointerEvents: `initial`,
								}),
							}"
							@click="removeSticker(sticker)"
						>
							<div
								:style="{
									...styleFlexCenter(),
									width: `30px`,
									height: `30px`,
									borderRadius: `50%`,
									backgroundColor: kThemeFg,
									color: kThemeBg,
								}"
							>
								<AppJolticon icon="remove" />
							</div>
						</div>
						<AppStickerStackItem :img-url="sticker.img_url" />
					</div>
				</AppOnHover>
			</div>

			<template v-if="stickersError">
				<div class="control-erros">
					<p class="help-block error anim-fade-in">
						{{ stickersError }}
					</p>
				</div>
			</template>

			<AppSpacer vertical :scale="6" />
		</template>
	</FormShopProductBase>
</template>
