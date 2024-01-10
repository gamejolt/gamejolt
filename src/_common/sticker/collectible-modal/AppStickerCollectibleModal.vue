<script lang="ts" setup>
import { CSSProperties, PropType, computed, onMounted, ref, toRef, toRefs } from 'vue';
import { styleBorderRadiusBase, styleFlexCenter } from '../../../_styles/mixins';
import { kFontSizeBase, kFontSizeSmall } from '../../../_styles/variables';
import { showPurchaseShopProductModal } from '../../../app/components/vending-machine/modal/_purchase-modal/modal.service';
import { isInstance } from '../../../utils/utils';
import AppAlertBox from '../../alert/AppAlertBox.vue';
import { Api } from '../../api/api.service';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../button/AppButton.vue';
import { AcquisitionMethod, filterAcquisitionMethods } from '../../collectible/acquisition.model';
import { CollectibleModel } from '../../collectible/collectible.model';
import { EmojiModel } from '../../emoji/emoji.model';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { PurchasableProductType } from '../../inventory/shop/product-owner-helpers';
import AppLoading from '../../loading/AppLoading.vue';
import { getMediaItemImageSrc } from '../../media-item/media-item-model';
import AppModal from '../../modal/AppModal.vue';
import AppModalFloatingHeader from '../../modal/AppModalFloatingHeader.vue';
import { useModal } from '../../modal/modal.service';
import { storeModel, storeModelList } from '../../model/model-store.service';
import AppCircularProgress from '../../progress/AppCircularProgress.vue';
import { Screen } from '../../screen/screen-service';
import { kThemeFg10, kThemeFgMuted } from '../../theme/variables';
import { $gettext } from '../../translate/translate.service';
import AppStickerImg from '../AppStickerImg.vue';
import AppStickerMastery from '../AppStickerMastery.vue';
import AppStickerPack, { StickerPackRatio } from '../pack/AppStickerPack.vue';
import { StickerPackModel } from '../pack/pack.model';
import { StickerModel } from '../sticker.model';

const props = defineProps({
	item: {
		type: Object as PropType<EmojiModel | StickerModel>,
		required: true,
	},
});

const { item } = toRefs(props);

const modal = useModal()!;

const isLoading = ref(true);
const loadedData = ref<{ collectible: CollectibleModel; packs: StickerPackModel[] }>();

const sticker = toRef(() => (isInstance(item.value, StickerModel) ? item.value : undefined));
const emoji = toRef(() => (isInstance(item.value, EmojiModel) ? item.value : undefined));
const stickerId = toRef(() => sticker.value?.id ?? emoji.value?.sticker_id);
const name = toRef(() => sticker.value?.name ?? emoji.value?.commandString);
const stickerMastery = toRef(
	() => loadedData.value?.collectible.sticker_mastery ?? sticker.value?.mastery
);

const imgUrl = computed(() => {
	// TODO(sticker-emoji-collectible-info) emojis are super blurry since we
	// don't have a media_item to check if it's animated. See if we can merge in
	// https://github.com/gamejolt/gamejolt/pull/1176, or grab some parts of it,
	// so we can get mediaserverUrl based on the url instead of making these
	// other checks required.
	if (sticker.value && sticker.value.media_item) {
		return getMediaItemImageSrc(sticker.value.media_item);
	}
	return {
		src: sticker.value?.img_url || emoji.value!.img_url,
		isMediaserver: false,
	} satisfies ReturnType<typeof getMediaItemImageSrc>;
});

onMounted(async () => {
	// Nothing to load.
	if (!stickerId.value) {
		isLoading.value = false;
		return;
	}

	try {
		const response = await Api.sendFieldsRequest(
			`/mobile/sticker`,
			{ collectible: stickerId.value },
			{ detach: true }
		);

		if (!response.collectible) {
			throw Error('No collectible data returned.');
		}

		const collectible = storeModel(CollectibleModel, response.collectible);
		const packIds = filterAcquisitionMethods(
			collectible.acquisition,
			AcquisitionMethod.PackOpen
		).map(i => i.sticker_pack_id);

		const packsResponse = await Api.sendFieldsRequest(
			'/mobile/sticker',
			{
				packs: {
					id: packIds,
				},
			},
			{ detach: true }
		);

		loadedData.value = {
			collectible,
			packs: storeModelList(StickerPackModel, packsResponse.packs),
		};
	} catch {
		loadedData.value = undefined;
	}
	isLoading.value = false;
});

const stickerMasteryInfo = toRef(() => {
	if (stickerMastery.value === undefined) {
		return undefined;
	} else if (stickerMastery.value === 0) {
		return $gettext(`You haven't used this sticker yet. Use it to gain mastery!`);
	} else if (stickerMastery.value !== 100) {
		return $gettext(
			`Use this sticker to gain mastery. Once you master it, you'll be able to use it for emojis and reactions!`
		);
	}
	return $gettext(`You've mastered this sticker and can now use it for emojis and reactions!`);
});

const titleFontSize = kFontSizeBase;
const headingStyles = {
	textTransform: `uppercase`,
	fontSize: kFontSizeSmall.px,
	fontWeight: `bold`,
	margin: `0 0 8px 0`,
} satisfies CSSProperties;

const mutedStyles = {
	fontStyle: `italic`,
	color: kThemeFgMuted,
} satisfies CSSProperties;
</script>

<template>
	<AppModal>
		<AppModalFloatingHeader>
			<template #inline-title>
				<div
					:style="{
						fontWeight: `bold`,
						fontSize: titleFontSize.px,
						display: `flex`,
						gap: `12px`,
						alignItems: `center`,
					}"
				>
					<AppStickerImg :size="24" :src="imgUrl.src" />

					{{ name }}
				</div>
			</template>

			<template #modal-controls>
				<AppButton @click="modal.dismiss()">
					{{ $gettext(`Close`) }}
				</AppButton>
			</template>
		</AppModalFloatingHeader>

		<div class="modal-body">
			<div
				class="well"
				:style="{
					display: `flex`,
					flexDirection: `column`,
					gap: `16px`,
				}"
			>
				<!-- Image -->
				<div :style="{ maxWidth: `200px`, width: `100%`, alignSelf: `center` }">
					<AppAspectRatio :ratio="1">
						<AppImgResponsive v-if="imgUrl.isMediaserver" :src="imgUrl.src" />
						<AppStickerImg
							v-else
							:style="{
								width: `100%`,
								height: `100%`,
							}"
							:src="imgUrl.src"
						/>
					</AppAspectRatio>
				</div>

				<div v-if="loadedData || sticker">
					<h2 :style="headingStyles">
						{{ $gettext(`Mastery`) }}
					</h2>

					<template v-if="stickerMastery !== undefined">
						<div
							:style="{
								flex: `none`,
								display: `flex`,
								flexDirection: `row`,
								alignItems: `center`,
								gap: `8px`,
							}"
						>
							<div
								:style="{
									flex: `none`,
									fontSize: kFontSizeSmall.px,
								}"
							>
								{{ stickerMastery }}%
							</div>
							<div :style="{ flex: `auto` }">
								<AppStickerMastery :progress="stickerMastery" />
							</div>
						</div>

						<div
							:style="[
								mutedStyles,
								{
									marginTop: `4px`,
									fontSize: kFontSizeSmall.px,
								},
							]"
						>
							{{ stickerMasteryInfo }}
						</div>
					</template>
					<div v-else :style="mutedStyles">
						{{ $gettext(`This sticker can't be mastered.`) }}
					</div>
				</div>

				<template v-if="isLoading">
					<AppLoading
						v-if="isLoading"
						:style="{ marginTop: `24px` }"
						hide-label
						centered
						stationary
					/>
				</template>

				<div v-if="loadedData?.collectible?.description">
					<h2 :style="headingStyles">
						{{ $gettext(`Description`) }}
					</h2>

					<div :style="mutedStyles">
						{{ loadedData.collectible.description }}
					</div>
				</div>

				<div v-if="loadedData && loadedData.packs.length">
					<h2 :style="headingStyles">
						{{ $gettext(`Packs`) }}
					</h2>

					<div
						:style="{
							display: `grid`,
							gridTemplateColumns: `repeat(${Screen.isXs ? 2 : 3}, 1fr)`,
							gap: `16px`,
						}"
					>
						<div v-for="pack in loadedData.packs" :key="pack.id">
							<AppStickerPack
								v-if="isInstance(pack, StickerPackModel)"
								:pack="pack"
								show-name
								can-click-pack
								@click-pack="
									showPurchaseShopProductModal({
										resource: PurchasableProductType.StickerPack,
										resourceId: pack.id,
									})
								"
							/>
							<AppAspectRatio
								v-else
								:style="{
									...styleBorderRadiusBase,
									backgroundColor: kThemeFg10,
								}"
								:ratio="StickerPackRatio"
								:inner-styles="styleFlexCenter()"
							>
								<AppCircularProgress :style="{ width: `36px`, maxWidth: `100%` }" />
							</AppAspectRatio>
						</div>
					</div>
				</div>
				<AppAlertBox v-else-if="!isLoading">
					<template v-if="emoji && !emoji.sticker_id">
						<!-- TODO(sticker-emoji-collectible-info) make sure this is correct -->
						{{ $gettext(`This emoji is available to everyone.`) }}
					</template>
					<template v-else>
						{{ $gettext(`This is not obtainable right now.`) }}
					</template>
				</AppAlertBox>
			</div>
		</div>
	</AppModal>
</template>
