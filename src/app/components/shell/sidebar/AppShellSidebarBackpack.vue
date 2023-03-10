<script lang="ts" setup>
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyPill from '../../../../_common/currency/AppCurrencyPill.vue';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackOpenModal } from '../../../../_common/sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import {
	getStickerCountsFromPayloadData,
	useStickerStore,
} from '../../../../_common/sticker/sticker-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { illPointyThing } from '../../../img/ill/illustrations';
import { useAppStore } from '../../../store';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';

type FormModel = {
	// nothing
};

const { stickerPacks, drawerItems: stickers } = useStickerStore();
const { coinBalance } = useAppStore();

const form: FormController<FormModel> = createForm({
	loadUrl: `/mobile/sticker`,
	loadData: {
		_fields: {
			ownedPacks: true,
			ownedStickers: true,
			unreadStickerIds: true,
		},
	},
	sanitizeComplexData: false,
	onInit() {
		run(async () => {
			const payload = await Api.sendFieldsRequest(
				'/mobile/me',
				{ coinBalance: true },
				{ detach: true }
			);

			coinBalance.value = payload.coinBalance;
		});
	},
	async onLoad(payload) {
		stickerPacks.value = UserStickerPack.populate(payload.ownedPacks);

		stickers.value = getStickerCountsFromPayloadData({
			stickerCounts: payload.ownedStickers.stickerCounts,
			stickers: payload.ownedStickers.stickers,
		}).flat();
	},
});

async function onClickVendingMachine() {
	await showVendingMachineModal();
}

function openPack(pack: UserStickerPack) {
	StickerPackOpenModal.show({
		pack,
		openImmediate: true,
	});
}
</script>

<template>
	<div id="shell-sidebar-backpack" class="fill-offset">
		<AppForm :controller="form">
			<div
				:style="{
					display: 'flex',
					alignItems: 'center',
					gap: '12px',
				}"
			>
				<AppButton block solid @click="onClickVendingMachine()">
					{{ $gettext(`Get packs`) }}
				</AppButton>

				<AppCurrencyPill
					:style="{
						flex: 'none',
					}"
					currency="coins"
					:amount="coinBalance"
				/>
			</div>

			<AppSpacer vertical :scale="8" />

			<div class="_section-header">
				{{ $gettext(`Sticker packs`) }}
			</div>
			<div v-if="stickerPacks.length" class="_packs">
				<AppStickerPack
					v-for="userPack in stickerPacks"
					:key="userPack.id"
					:pack="userPack.sticker_pack"
					:show-details="{
						name: true,
						expiry: true,
					}"
					can-click-pack
					:hover-title="$gettext(`Open`)"
					@click-pack="openPack(userPack)"
				/>
			</div>
			<div v-else>
				<AppIllustration :asset="illPointyThing" />

				<p class="text-center">
					{{ $gettext(`You currently have no packs to open.`) }}
				</p>
			</div>

			<AppSpacer vertical :scale="8" />

			<div class="_section-header">
				{{ $gettext(`Stickers`) }}
			</div>
			<div v-if="stickers.length" class="_stickers">
				<AppStickerLayerDrawerItem
					v-for="{ sticker, sticker_id, count } in stickers"
					:key="sticker_id"
					:sticker="sticker"
					:count="count"
					fit-parent
					no-drag
					show-creator
				/>
			</div>
			<div v-else>
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

._packs
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(3, 1fr)

	@media $media-xs
		grid-template-columns: repeat(2, 1fr)

._stickers
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr))
</style>
