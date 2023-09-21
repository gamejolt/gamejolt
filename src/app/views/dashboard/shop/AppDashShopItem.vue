<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import AppBackground from '../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../_common/background/background.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import {
	kThemeGjOverlayNotice,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleAbsoluteFill,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
} from '../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../_styles/variables';
import AppDashShopHover from './AppDashShopHover.vue';
import AppDashShopItemBase, { ShopItemStates } from './AppDashShopItemBase.vue';
import { routeDashShopProduct } from './product/product.route';
import { ShopManagerGroupItem } from './shop.store';

const props = defineProps({
	item: {
		type: Object as PropType<ShopManagerGroupItem>,
		required: true,
	},
	borderRadius: {
		type: Number,
		default: undefined,
	},
	borderWidth: {
		type: Number,
		default: undefined,
	},
	itemStates: {
		type: Object as PropType<ShopItemStates>,
		default: () => ({} as ShopItemStates),
	},
});

const { item, borderRadius, itemStates } = toRefs(props);

function _isAvatarFrame(i: ShopManagerGroupItem): i is AvatarFrameModel {
	return i instanceof AvatarFrameModel;
}
function _isBackground(i: ShopManagerGroupItem): i is BackgroundModel {
	return i instanceof BackgroundModel;
}
function _isStickerPack(i: ShopManagerGroupItem): i is StickerPackModel {
	return i instanceof StickerPackModel;
}
function _isSticker(i: ShopManagerGroupItem): i is StickerModel {
	return i instanceof StickerModel;
}

const type = computed(() => {
	const i = item.value;
	if (_isAvatarFrame(i)) {
		return 'avatar-frame';
	} else if (_isBackground(i)) {
		return 'background';
	} else if (_isStickerPack(i)) {
		return 'sticker-pack';
	} else if (_isSticker(i)) {
		return 'sticker';
	}
	throw Error(`Unknown item type`);
});

function makeStateBubbleStyles(backgroundColor: string = kThemePrimary) {
	return {
		...styleFlexCenter(),
		...styleElevate(1),
		borderRadius: `50%`,
		backgroundColor,
		padding: `4px`,
	};
}

function makeStateBubbleIconStyles(color: string = kThemePrimaryFg) {
	return {
		margin: 0,
		fontSize: kFontSizeSmall.px,
		color,
	};
}
</script>

<template>
	<AppDashShopHover
		v-if="!!type"
		:border-radius="borderRadius"
		:border-width="borderWidth"
		:style="{
			width: `100%`,
		}"
		:to="{
			name: routeDashShopProduct.name,
			params: {
				type,
				id: item.id,
			},
		}"
	>
		<template #default="{ borderRadius: parentRadius }">
			<AppDashShopItemBase :name="item.name">
				<template #img>
					<div
						:style="{
							position: `relative`,
						}"
					>
						<AppUserAvatarBubble
							v-if="_isAvatarFrame(item)"
							:user="null"
							:frame-override="item"
							smoosh
							show-frame
						/>
						<AppBackground
							v-else-if="_isBackground(item)"
							:background="item"
							:style="{
								borderRadius: `${parentRadius}px`,
								overflow: `hidden`,
							}"
							:background-style="{
								backgroundSize: `cover`,
								backgroundPosition: `center`,
							}"
						>
							<AppAspectRatio :ratio="1" />
						</AppBackground>
						<AppStickerPack
							v-else-if="_isStickerPack(item)"
							:pack="item"
							:border-radius="parentRadius"
						/>
						<AppStickerLayerDrawerItem
							v-else-if="_isSticker(item)"
							:sticker="item"
							no-drag
							hide-count
							fit-parent
						/>

						<div
							:style="[
								styleAbsoluteFill({
									zIndex: 1,
									inset: `-12px`,
									// Don't overlap the name below the image.
									bottom: 0,
								}),
								{
									display: `flex`,
									justifyContent: `space-between`,
									gap: `8px`,
								},
							]"
						>
							<div
								:style="{
									display: `flex`,
									flexDirection: `column`,
									flexWrap: `wrap`,
									gap: `4px`,
									opacity: 0.8,
								}"
							>
								<div
									v-if="itemStates.active"
									v-app-tooltip="$gettext(`Available in the shop`)"
									:style="makeStateBubbleStyles()"
								>
									<AppJolticon
										icon="marketplace"
										:style="makeStateBubbleIconStyles()"
									/>
								</div>
								<div
									v-if="itemStates.inReview"
									v-app-tooltip="$gettext(`In review`)"
									:style="makeStateBubbleStyles()"
								>
									<AppJolticon
										icon="clock"
										:style="makeStateBubbleIconStyles()"
									/>
								</div>
								<div
									v-if="itemStates.rejected"
									v-app-tooltip="$gettext(`Rejected`)"
									:style="makeStateBubbleStyles(kThemeGjOverlayNotice)"
								>
									<AppJolticon
										icon="exclamation"
										:style="makeStateBubbleIconStyles(`white`)"
									/>
								</div>
							</div>

							<div
								:style="{
									justifySelf: `flex-end`,
									pointerEvents: `none`,
								}"
							>
								<!-- TODO(creator-shops) Now that premium and free
								items are listed together, we'll need a better
								indication to differentiate between them at a
								glance. This is currently too similar for me to be
								comfortable with.
								-->
								<div
									:style="[
										styleBorderRadiusLg,
										{
											backgroundColor: `rgba(0,0,0,0.54)`,
											color: `white`,
											fontWeight: `bold`,
											fontSize: kFontSizeSmall.px,
											padding: `2px 6px`,
										},
									]"
								>
									{{ item.is_premium ? $gettext(`Premium`) : $gettext(`Free`) }}
								</div>
							</div>
						</div>
					</div>
				</template>
			</AppDashShopItemBase>
		</template>
	</AppDashShopHover>
</template>
