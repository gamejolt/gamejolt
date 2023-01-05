<script lang="ts" setup>
import { ref } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
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
import { showVendingMachineModal } from '../../vending-machine/modal/vending-machine-modal.service';

type FormModel = {
	// nothing
};

const { stickerPacks, drawerItems: stickers } = useStickerStore();

const isOpeningPack = ref(false);

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
	async onLoad(payload) {
		stickerPacks.value = UserStickerPack.populate(payload.ownedPacks);

		// TODO(sticker-collections-2) remove, should get from the above payload instead.
		payload = await Api.sendRequest(`/web/stickers/dash`);
		const { stickerCounts, stickers: payloadStickers } = payload;
		console.warn('asdf', payload);

		// const { stickerCounts, stickers } = payload.ownedStickers;

		stickers.value = getStickerCountsFromPayloadData({
			stickerCounts,
			stickers: payloadStickers,
		});
	},
});

async function onClickVendingMachine() {
	await showVendingMachineModal();
	// TODO(sticker-collections-2) Shop modal can probably modify state itself.
	//
	// Probably refetch data afterwards as users may have bought packs.
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
	<AppForm id="shell-sidebar-backpack" :controller="form">
		<AppButton icon="marketplace" solid block @click="onClickVendingMachine()">
			{{ $gettext(`Purchase items`) }}
		</AppButton>

		<!-- TODO(sticker-collections-2) AppIllustration directing to shop? -->
		<AppSpacer vertical :scale="4" />

		<!--
			TODO(sticker-collections-2) Primary/Home display with sticky tabs at the top.

			Main tab:
				- Sticker packs, new stickers, more?

			Header tabs:
				- Overview
				- Packs
				- Stickers
		-->
		<div class="-section-header">
			{{ $gettext(`Sticker packs`) }}
		</div>
		<div v-if="stickerPacks.length" class="-packs">
			<AppStickerPack
				v-for="userPack in stickerPacks.splice(0, 1)"
				:key="userPack.id"
				:pack="userPack.sticker_pack"
				:show-details="{
					name: true,
					contents: true,
					expiry: true,
				}"
				can-click-pack
				@click-pack="onClickPack(userPack)"
			/>
		</div>
		<div v-else>
			<AppIllustration :asset="illPointyThing">
				<p class="text-center small">
					{{
						$gettext(
							`You currently have no packs to open. Visit the store to purchase more.`
						)
					}}
				</p>
			</AppIllustration>
		</div>

		<AppSpacer vertical :scale="8" />

		<div class="-section-header">
			{{ $gettext(`Stickers`) }}
		</div>
		<div class="-stickers">
			<AppStickerLayerDrawerItem
				v-for="{ sticker, sticker_id, count } in stickers"
				:key="sticker_id"
				:sticker="sticker"
				:count="count"
				fit-parent
				no-drag
			/>
		</div>
	</AppForm>
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
	display: grid
	gap: var(--base-pad)
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))

.-stickers
	display: grid
	gap: var(--half-pad)
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr))
</style>
