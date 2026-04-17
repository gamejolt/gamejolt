<script lang="ts" setup>
import { computed, Ref, ref, watch } from 'vue';

import { showFormStickerSelectorModal } from '~app/views/dashboard/shop/product/_forms/_sticker-selector/modal.service';
import FormShopProductBase, {
	createShopProductBaseForm,
} from '~app/views/dashboard/shop/product/_forms/FormShopProductBase.vue';
import AppDashShopProductHeader from '~app/views/dashboard/shop/product/AppDashShopProductHeader.vue';
import { ShopDashProductType, useShopDashStore } from '~app/views/dashboard/shop/shop.store';
import AppAlertBox from '~common/alert/AppAlertBox.vue';
import AppButton from '~common/button/AppButton.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { storeModelList } from '~common/model/model-store.service';
import AppOnHover from '~common/on/AppOnHover.vue';
import { ShopProductResource } from '~common/shop/product/product-model';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppStickerImg from '~common/sticker/AppStickerImg.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { kThemeBg, kThemeBgOffset, kThemeFg } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { styleBorderRadiusLg, styleFlexCenter, styleTyped, styleWhen } from '~styles/mixins';
import { kStrongEaseOut } from '~styles/variables';

type Props = {
	model?: StickerPackModel;
};
const { model } = defineProps<Props>();

const minStickers = ref(3);
const maxStickers = ref(5);
const stickers = ref([]) as Ref<StickerModel[]>;

const shopStore = useShopDashStore()!;

const data = createShopProductBaseForm({
	shopStore,
	resource: ShopProductResource.StickerPack,
	baseModel: model,
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
	} else if (!model?.was_approved) {
		initialFormModel.value.stickers = stickerIds;
	}
}

async function addStickers() {
	// Will return all the stickers (the current in pack as well as new).
	const newStickers = await showFormStickerSelectorModal({
		stickerPackId: model?.id,
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
						<AppStickerImg
							:src="sticker.img_url"
							:style="{ width: `100%`, height: `100%` }"
						/>
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
