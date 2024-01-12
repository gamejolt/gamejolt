<script lang="ts" setup>
import { CSSProperties, PropType, computed, onMounted, ref, toRef, toRefs, watch } from 'vue';
import {
	styleBorderRadiusBase,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleWhen,
} from '../../_styles/mixins';
import { kBorderRadiusBase, kFontSizeLarge, kFontSizeSmall } from '../../_styles/variables';
import { showPurchaseShopProductModal } from '../../app/components/vending-machine/modal/_purchase-modal/modal.service';
import { arrayAssignAll } from '../../utils/array';
import { isInstance } from '../../utils/utils';
import AppAlertBox from '../alert/AppAlertBox.vue';
import { Api } from '../api/api.service';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel } from '../avatar/frame.model';
import { BackgroundModel } from '../background/background.model';
import AppButton from '../button/AppButton.vue';
import { EmojiModel } from '../emoji/emoji.model';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import { PurchasableProductType } from '../inventory/shop/product-owner-helpers';
import AppLoading from '../loading/AppLoading.vue';
import { getMediaItemImageSrc } from '../media-item/media-item-model';
import { storeModel, storeModelList } from '../model/model-store.service';
import AppCircularProgress from '../progress/AppCircularProgress.vue';
import { Screen } from '../screen/screen-service';
import AppStickerMastery from '../sticker/AppStickerMastery.vue';
import AppStickerPack, { StickerPackRatio } from '../sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../sticker/pack/pack.model';
import { StickerModel } from '../sticker/sticker.model';
import { kThemeFg10, kThemeFgMuted } from '../theme/variables';
import { $gettext } from '../translate/translate.service';
import AppCollectibleUnlockedRibbon from './AppCollectibleUnlockedRibbon.vue';
import { AcquisitionMethod, filterAcquisitionMethods } from './acquisition.model';
import { CollectibleModel } from './collectible.model';
import { CollectibleResourceItem } from './resource-details-modal/modal.service';

const props = defineProps({
	item: {
		type: Object as PropType<CollectibleResourceItem>,
		required: true,
	},
	packs: {
		type: Array as PropType<StickerPackModel[]>,
		required: true,
	},
});

const { item } = toRefs(props);

const emit = defineEmits({
	'update:packs': (_packs: StickerPackModel[]) => true,
});

const isLoading = ref(true);
const collectible = ref<CollectibleModel>();

const hideCollectibleRibbon = ref(false);
watch(
	() => Screen.isPointerMouse,
	() => {
		hideCollectibleRibbon.value = false;
	}
);

function ifInstance<T>(item: any, constructor: new (...data: any) => T): T | undefined {
	return item && isInstance(item, constructor) ? item : undefined;
}

const sticker = computed(() => ifInstance(item.value, StickerModel));
const emoji = computed(() => ifInstance(item.value, EmojiModel));
const avatarFrame = computed(() => ifInstance(item.value, AvatarFrameModel));
const background = computed(() => ifInstance(item.value, BackgroundModel));

const collectibleLoadData = toRef<
	() => null | {
		loadUrl: string;
		loadResourceFields: Record<string, any>;
	}
>(() => {
	if ((sticker.value || emoji.value) && stickerId.value) {
		return {
			loadUrl: `/mobile/sticker`,
			loadResourceFields: {
				collectible: stickerId.value,
			},
		};
	} else if (avatarFrame.value) {
		return {
			loadUrl: `/mobile/avatar-frame`,
			loadResourceFields: {
				collectible: { id: avatarFrame.value.id },
			},
		};
	} else if (background.value) {
		return {
			loadUrl: `/mobile/background`,
			loadResourceFields: {
				collectible: { id: background.value.id },
			},
		};
	} else {
		return null;
	}
});

const stickerId = toRef(() => sticker.value?.id ?? emoji.value?.sticker_id);
const stickerMastery = toRef(() => collectible.value?.sticker_mastery ?? sticker.value?.mastery);
const name = toRef(
	() =>
		emoji.value?.commandString ??
		collectible.value?.name ??
		sticker.value?.name ??
		avatarFrame.value?.name ??
		background.value?.name
);
const description = toRef(() => {
	if (collectible.value?.description) {
		return collectible.value.description;
	}
	if ('description' in item.value && item.value.description) {
		return item.value.description;
	}
	return null;
});

const imageUrl = computed(() => {
	// TODO(resource-collectible-links) items without media items are super
	// blurry since we don't have a media_item to check if it's animated. See if
	// we can merge in https://github.com/gamejolt/gamejolt/pull/1176, or grab
	// some parts of it, so we can get mediaserverUrl based on the url instead
	// of making these other checks required.
	const mediaItem = 'media_item' in item.value ? item.value.media_item : undefined;
	if (mediaItem) {
		return getMediaItemImageSrc(mediaItem);
	}
	return {
		src: sticker.value?.img_url || emoji.value?.img_url || avatarFrame.value?.image_url || '',
		isMediaserver: false,
	} satisfies ReturnType<typeof getMediaItemImageSrc>;
});

onMounted(async () => {
	// Nothing to load.
	if (!collectibleLoadData.value) {
		isLoading.value = false;
		return;
	}

	const { loadUrl, loadResourceFields } = collectibleLoadData.value;

	try {
		const response = await Api.sendFieldsRequest(loadUrl, loadResourceFields, { detach: true });

		if (!response.collectible) {
			throw Error('No collectible data returned.');
		}

		const rawCollectible = Array.isArray(response.collectible)
			? response.collectible[0]
			: response.collectible;

		const newCollectible = storeModel(CollectibleModel, rawCollectible);
		const packIds = filterAcquisitionMethods(
			newCollectible.acquisition,
			AcquisitionMethod.PackOpen
		).map(i => i.sticker_pack_id);

		const packs: StickerPackModel[] = [];

		if (packIds.length && !props.packs.length) {
			const packsResponse = await Api.sendFieldsRequest(
				'/mobile/sticker',
				{
					packs: {
						id: packIds,
					},
				},
				{ detach: true }
			);
			arrayAssignAll(packs, storeModelList(StickerPackModel, packsResponse.packs));
			emit('update:packs', packs);
		}

		collectible.value = newCollectible;
	} catch {
		collectible.value = undefined;
		emit('update:packs', []);
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

const collectibleResourceAcquisition = computed(() => {
	const acquisitions = collectible.value?.acquisition;
	// Ignore if we have no shop purchase acquisitions.
	if (
		!acquisitions?.length ||
		acquisitions.every(i => i.method !== AcquisitionMethod.ShopPurchase)
	) {
		return null;
	}

	let resource: PurchasableProductType;
	if (avatarFrame.value) {
		resource = PurchasableProductType.AvatarFrame;
	} else if (background.value) {
		resource = PurchasableProductType.Background;
	} else {
		return null;
	}

	return {
		resource,
		resourceId: item.value.id,
	};
});
</script>

<template>
	<div
		:style="{
			display: `flex`,
			flexDirection: `column`,
			gap: `16px`,
		}"
	>
		<!-- Label -->
		<div :style="{ textAlign: `center`, fontWeight: `bold`, fontSize: kFontSizeLarge.px }">
			{{ name }}
		</div>

		<!-- Image -->
		<div
			:style="{
				width: `100%`,
				alignSelf: `center`,
				...styleMaxWidthForOptions({
					ratio: 1,
					maxWidth: 320,
					maxHeight: Screen.height / 3,
				}),
			}"
			@mouseover="Screen.isPointerMouse ? (hideCollectibleRibbon = true) : undefined"
			@mouseout="Screen.isPointerMouse ? (hideCollectibleRibbon = false) : undefined"
			@click="
				Screen.isPointerMouse ? undefined : (hideCollectibleRibbon = !hideCollectibleRibbon)
			"
		>
			<AppAspectRatio
				:style="{
					...styleWhen(!!background, {
						borderRadius: kBorderRadiusBase.px,
					}),
				}"
				:ratio="1"
			>
				<AppImgResponsive v-if="imageUrl.isMediaserver" :src="imageUrl.src" />
				<img
					v-else
					:style="{
						width: `100%`,
						height: `auto`,
					}"
					:src="imageUrl.src"
					alt=""
				/>

				<Transition name="fade">
					<AppCollectibleUnlockedRibbon
						v-if="collectible?.is_unlocked && !hideCollectibleRibbon"
					/>
				</Transition>
			</AppAspectRatio>
		</div>

		<div v-if="(emoji || sticker) && stickerMastery !== undefined">
			<h2 :style="headingStyles">
				{{ $gettext(`Mastery`) }}
			</h2>

			<template v-if="typeof stickerMastery === 'number'">
				<div
					:style="{
						flex: `none`,
						display: `flex`,
						flexDirection: `row`,
						alignItems: `center`,
						gap: `8px`,
					}"
				>
					<div :style="{ flex: `none`, fontSize: kFontSizeSmall.px }">
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

		<div v-if="description">
			<h2 :style="headingStyles">
				{{ $gettext(`Description`) }}
			</h2>

			<div :style="mutedStyles">
				{{ description }}
			</div>
		</div>

		<AppLoading
			v-if="isLoading"
			:style="{ marginTop: `24px` }"
			hide-label
			centered
			stationary
		/>

		<template v-if="collectible && (packs.length || collectibleResourceAcquisition)">
			<template v-if="packs.length">
				<h2 :style="headingStyles">
					{{ $gettext(`Packs`) }}
				</h2>

				<div
					:style="{
						display: `grid`,
						gridTemplateColumns: `repeat(2, 1fr)`,
						gap: `8px`,
					}"
				>
					<div v-for="pack in packs" :key="pack.id">
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
			</template>

			<AppButton
				v-if="collectibleResourceAcquisition"
				block
				solid
				primary
				@click="showPurchaseShopProductModal(collectibleResourceAcquisition)"
			>
				{{ $gettext(`View in shop`) }}
			</AppButton>
		</template>
		<AppAlertBox v-else-if="!isLoading">
			<template v-if="emoji && (!emoji.prefix || emoji.prefix.toLowerCase() === 'gj/')">
				{{ $gettext(`This emoji is available to everyone.`) }}
			</template>
			<template v-else>
				{{ $gettext(`This is not obtainable right now.`) }}
			</template>
		</AppAlertBox>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter-from
.fade-leave-to
	opacity: 0
</style>
