<script lang="ts" setup>
import { ref } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import { showErrorGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerLayerDrawerItem from '../../../../_common/sticker/layer/AppStickerLayerDrawerItem.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import {
	getStickerCountsFromPayloadData,
	useStickerStore,
} from '../../../../_common/sticker/sticker-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { illPointyThing } from '../../../img/ill/illustrations';
import { showVendingMachineModal } from '../../vending-machine/modal/modal.service';

type FormModel = {
	// nothing
};

const { stickerPacks, drawerItems: stickers } = useStickerStore();

const isOpeningPack = ref(false);
// TODO(sticker-collections-2) Put this in a store somewhere so we have some
// placeholder data.
const coinBalance = ref(0);

const form: FormController<FormModel> = createForm({
	loadUrl: `/mobile/sticker`,
	loadData: {
		_fields: {
			// TODO(sticker-collections-2) `coinBalance`
			ownedPacks: true,
			ownedStickers: true,
			unreadStickerIds: true,
		},
	},
	sanitizeComplexData: false,
	// TODO(sticker-collections-2) Remove if we get resolve the above TODO
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

async function onClickPack(pack: UserStickerPack) {
	const canProceed = await ModalConfirm.show(
		$gettext(`Are you sure you want to open this pack?`)
	);

	if (!canProceed) {
		return;
	}

	isOpeningPack.value = true;
	try {
		const payload = await Api.sendRequest(
			`/web/stickers/open-pack/${pack.id}`,
			{},
			{ detach: true }
		);

		if (!payload.success) {
			throw 'Pack was unable to be opened.';
		}

		// TODO(sticker-collections-2) Show a modal displaying rewards from our newly opened pack.
		arrayRemove(stickerPacks.value, i => i.id === pack.id);

		// TODO(sticker-collections-2) Remove debug code.
		//
		// Refetch data as the pack was opened, and new stickers were added.
		showSuccessGrowl(JSON.stringify(payload), 'OPENED PACK');
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong opening that pack.`));
	} finally {
		isOpeningPack.value = false;
	}
}
</script>

<template>
	<div id="shell-sidebar-backpack">
		<AppForm :controller="form">
			<AppButton solid block @click="onClickVendingMachine()">
				<span>
					{{ formatFuzzynumber(coinBalance) }}
					{{ ' 🪙 ' }}
				</span>

				<span>
					{{ $gettext(`Purchase items`) }}
				</span>
			</AppButton>

			<AppSpacer vertical :scale="4" />

			<div class="-section-header">
				{{ $gettext(`Sticker packs`) }}
			</div>
			<div v-if="stickerPacks.length" class="-packs">
				<AppStickerPack
					v-for="userPack in stickerPacks"
					:key="userPack.id"
					:pack="userPack.sticker_pack"
					:show-details="{
						name: true,
						expiry: true,
					}"
					can-click-pack
					@click-pack="onClickPack(userPack)"
				/>
			</div>
			<div v-else>
				<AppIllustration :asset="illPointyThing" />

				<p class="text-center">
					{{ $gettext(`You currently have no packs to open.`) }}
				</p>
				<AppButton block trans @click="onClickVendingMachine()">
					{{ $gettext(`Get packs`) }}
				</AppButton>
			</div>

			<AppSpacer vertical :scale="8" />

			<div class="-section-header">
				{{ $gettext(`Stickers`) }}
			</div>
			<div v-if="stickers.length" class="-stickers">
				<AppStickerLayerDrawerItem
					v-for="{ sticker, sticker_id, count } in stickers"
					:key="sticker_id"
					:sticker="sticker"
					:count="count"
					fit-parent
					no-drag
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
	--base-pad: 12px
	--half-pad: calc(var(--base-pad) * 0.5)
	padding: var(--base-pad)

.-section-header
	margin-top: 0
	font-family: $font-family-display
	font-weight: 800
	font-size: $font-size-large
	margin-bottom: var(--half-pad)

.-packs
	--min-pack-width: 100px
	display: grid
	gap: var(--base-pad)
	grid-template-columns: repeat(auto-fill, minmax(var(--min-pack-width), 1fr))

	@media $media-xs
		--min-pack-width: 80px

.-stickers
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr))
</style>
