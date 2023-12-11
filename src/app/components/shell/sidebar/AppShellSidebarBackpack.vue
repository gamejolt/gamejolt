<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyPillList from '../../../../_common/currency/AppCurrencyPillList.vue';
import { CurrencyType } from '../../../../_common/currency/currency-type';
import { shorthandReadableTime } from '../../../../_common/filters/duration';
import AppForm, { FormController, createForm } from '../../../../_common/form-vue/AppForm.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illPointyThing } from '../../../../_common/illustration/illustrations';
import { InventoryShopGiftModel } from '../../../../_common/inventory/shop/inventory-shop-gift.model';
import { InventoryShopProduct } from '../../../../_common/inventory/shop/product-owner-helpers';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { storeModelList } from '../../../../_common/model/model-store.service';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack, {
	StickerPackExpiryStyles,
} from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { showStickerPackOpenModal } from '../../../../_common/sticker/pack/open-modal/modal.service';
import { UserStickerPackModel } from '../../../../_common/sticker/pack/user-pack.model';
import {
	StickerSortMethod,
	getStickerStacksFromPayloadData,
	sortStickerStacks,
	useStickerStore,
} from '../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { styleTextOverflow } from '../../../../_styles/mixins';
import { kFontSizeLarge } from '../../../../_styles/variables';
import { arrayRemove } from '../../../../utils/array';
import { run } from '../../../../utils/utils';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';
import AppBackpackGift from './_backpack/AppBackpackGift.vue';

type FormModel = {
	// nothing
};

const { stickerPacks, eventStickers, creatorStickers, generalStickers, allStickers } =
	useStickerStore();

const { coinBalance, joltbuxBalance, setInitialPackWatermarkStorageValue } = useCommonStore();

const gifts = ref([]) as Ref<{ gift: InventoryShopGiftModel; product: InventoryShopProduct }[]>;

const form: FormController<FormModel> = createForm({
	loadUrl: `/mobile/sticker`,
	loadData: {
		_fields: {
			ownedPacks: true,
			ownedStickers: true,
			unreadStickerIds: true,
			unownedStickerMasteries: true,
		},
	},
	sanitizeComplexData: false,
	onInit() {
		setInitialPackWatermarkStorageValue(false);

		run(async () => {
			const payload = await Api.sendFieldsRequest(
				'/mobile/me',
				{ coinBalance: true, buxBalance: true },
				{ detach: true }
			);

			if (typeof payload.coinBalance === 'number') {
				coinBalance.value = payload.coinBalance;
			}
			if (typeof payload.buxBalance === 'number') {
				joltbuxBalance.value = payload.buxBalance;
			}
		});

		run(async () => {
			try {
				const payload = await Api.sendRequest('/web/inventory/gift/received');

				const newGifts: typeof gifts.value = [];
				for (const gift of storeModelList(InventoryShopGiftModel, payload.gifts)) {
					const product = gift.product;
					if (product) {
						newGifts.push({
							gift,
							product,
						});
					}
				}
				gifts.value = newGifts;
			} catch (e) {
				console.error('Error loading gifts', e);
				gifts.value = [];
			}
		});
	},
	async onLoad(payload) {
		stickerPacks.value = storeModelList(UserStickerPackModel, payload.ownedPacks);

		const data = getStickerStacksFromPayloadData({
			stickerCounts: payload.ownedStickers.stickerCounts,
			stickers: payload.ownedStickers.stickers,
			unownedStickerMasteries: payload.unownedStickerMasteries?.stickers,
		});

		eventStickers.value = data.eventStickers;
		creatorStickers.value = data.creatorStickers;
		generalStickers.value = data.generalStickers;
	},
});

async function onClickVendingMachine() {
	await showVendingMachineModal({ location: 'backpack' });
}

function openPack(pack: UserStickerPackModel) {
	showStickerPackOpenModal({ pack });
}

function sortStickers(sorting: StickerSortMethod) {
	Popper.hideAll();

	const data = sortStickerStacks({
		eventStickers: [...eventStickers.value],
		creatorStickers: new Map([...creatorStickers.value]),
		generalStickers: [...generalStickers.value],
		sorting,
	});

	eventStickers.value = data.eventStickers;
	creatorStickers.value = data.creatorStickers;
	generalStickers.value = data.generalStickers;
}

function onRemoveGift(gift: InventoryShopGiftModel) {
	arrayRemove(gifts.value, i => i.gift.id === gift.id);
}
</script>

<template>
	<div id="shell-sidebar-backpack" class="fill-offset">
		<AppCurrencyPillList
			:currencies="{
				[CurrencyType.joltbux.id]: [CurrencyType.joltbux, joltbuxBalance],
				[CurrencyType.coins.id]: [CurrencyType.coins, coinBalance],
			}"
			direction="row"
			:gap="8"
			wrap
		/>

		<AppSpacer vertical :scale="2" />

		<div
			:style="{
				display: `flex`,
				alignItems: `flex-start`,
				gap: `12px`,
			}"
		>
			<AppButton block solid @click="onClickVendingMachine()">
				{{ $gettext(`Open Shop`) }}
			</AppButton>
		</div>

		<AppSpacer vertical :scale="4" />

		<template v-if="gifts.length">
			<div class="_section-header">
				{{ $gettext(`Gifts`) }}
			</div>

			<div
				:style="{ display: `grid`, gridTemplateColumns: `minmax(0, 1fr)`, rowGap: `12px` }"
			>
				<!-- Gift items -->
				<AppBackpackGift
					v-for="{ gift, product } of gifts"
					:key="gift.id"
					:gift="gift"
					:product="product"
					@remove="onRemoveGift(gift)"
				/>
			</div>

			<AppSpacer vertical :scale="4" />
		</template>

		<AppForm :controller="form">
			<div class="_section-header">
				{{ $gettext(`Sticker packs`) }}
			</div>
			<div v-if="stickerPacks.length" class="_packs">
				<AppStickerPack
					v-for="userPack in stickerPacks"
					:key="userPack.id"
					:pack="userPack.sticker_pack"
					show-name
					can-click-pack
					@click-pack="openPack(userPack)"
				>
					<div v-if="userPack.expires_on" :style="StickerPackExpiryStyles">
						{{
							shorthandReadableTime(userPack.expires_on, {
								allowFuture: true,
								precision: 'rough',
								nowText: $gettext(`Expired`),
							})
						}}
					</div>
				</AppStickerPack>
			</div>
			<div v-else>
				<AppIllustration :asset="illPointyThing" />

				<p class="text-center">
					{{ $gettext(`You currently have no packs to open.`) }}
				</p>
			</div>

			<AppSpacer vertical :scale="8" />

			<div
				class="_section-header"
				:style="{
					display: `flex`,
				}"
			>
				<span>
					{{ $gettext(`Stickers`) }}
				</span>

				<AppPopper
					:style="{
						marginLeft: `12px`,
					}"
				>
					<AppJolticon
						:style="{
							margin: 0,
							fontSize: kFontSizeLarge.px,
							cursor: `pointer`,
						}"
						icon="filter"
					/>

					<template #popover>
						<div class="list-group">
							<a
								v-for="sortMethod in StickerSortMethod"
								:key="sortMethod"
								class="list-group-item"
								@click="sortStickers(sortMethod)"
							>
								{{ sortMethod }}
							</a>
						</div>
					</template>
				</AppPopper>
			</div>

			<div v-if="eventStickers.length">
				<div
					v-if="generalStickers.length || creatorStickers.size"
					class="_section-subheader"
				>
					{{ $gettext(`Event stickers`) }}
				</div>

				<div class="_stickers">
					<AppStickerLayerDrawerItem
						v-for="{ sticker, sticker_id, count } in eventStickers"
						:key="sticker_id"
						:sticker="sticker"
						:count="count || undefined"
						fit-parent
						no-drag
						show-mastery
					/>
				</div>
			</div>

			<template v-if="creatorStickers.size">
				<div v-for="[creatorId, stickers] in creatorStickers" :key="creatorId">
					<template v-if="stickers.length">
						<div
							v-if="stickers[0].sticker.owner_user"
							class="_section-subheader"
							:style="{
								maxWidth: `100%`,
								display: `inline-flex`,
								alignItems: `center`,
								gap: `6px`,
							}"
						>
							<AppUserAvatar
								:style="{
									width: `16px`,
									height: `16px`,
								}"
								:user="stickers[0].sticker.owner_user"
								disable-link
							/>

							<div
								:style="{
									...styleTextOverflow,
									minWidth: 0,
								}"
							>
								{{
									$gettext(`@%{ username } stickers`, {
										username: stickers[0].sticker.owner_user.username,
									})
								}}
							</div>
						</div>

						<div class="_stickers">
							<AppStickerLayerDrawerItem
								v-for="{ sticker, sticker_id, count } in stickers"
								:key="sticker_id"
								:sticker="sticker"
								:count="count || undefined"
								fit-parent
								no-drag
								show-mastery
							/>
						</div>
					</template>
				</div>
			</template>

			<div v-if="generalStickers.length">
				<div v-if="eventStickers.length || creatorStickers.size" class="_section-subheader">
					{{ $gettext(`General stickers`) }}
				</div>

				<div class="_stickers">
					<AppStickerLayerDrawerItem
						v-for="{ sticker, sticker_id, count } in generalStickers"
						:key="sticker_id"
						:sticker="sticker"
						:count="count || undefined"
						fit-parent
						no-drag
						show-mastery
					/>
				</div>
			</div>

			<div v-if="!allStickers.length">
				<p class="text-center">
					{{ $gettext(`You have no stickers. Open packs to get some!`) }}
				</p>
				<AppButton block trans @click="onClickVendingMachine()">
					{{ $gettext(`Get packs`) }}
				</AppButton>
			</div>
		</AppForm>
	</div>
</template>

<style lang="stylus" scoped>
#shell-sidebar-backpack
	--base-pad: 16px
	--half-pad: calc(var(--base-pad) * 0.5)
	padding: var(--base-pad)

._radius-lg
	rounded-corners-lg()

._section-header
	margin-top: 0
	font-family: $font-family-display
	font-weight: 800
	font-size: $font-size-large
	margin-bottom: var(--half-pad)

._section-subheader
	margin-top: 0
	font-size: $font-size-small
	margin-bottom: var(--half-pad)
	color: var(--theme-fg-muted)

._packs
	display: grid
	gap: var(--base-pad)
	grid-template-columns: repeat(3, 1fr)

	@media $media-xs
		grid-template-columns: repeat(2, 1fr)

._stickers
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr))
	margin-bottom: $line-height-computed
</style>
