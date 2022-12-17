<script lang="ts" setup>
import { ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppStickerPack from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { UserStickerPack } from '../../../../_common/sticker/pack/user_pack.model';
import { showVendingMachineModal } from '../../vending-machine/modal/vending-machine-modal.service';

const isLoading = ref(true);
const ownedPacks = ref<UserStickerPack[]>([]);

run(async () => {
	const payload = await Api.sendFieldsRequest(`/mobile/sticker`, {
		ownedPacks: true,
	});

	ownedPacks.value = UserStickerPack.populate(payload.ownedPacks);

	isLoading.value = false;
});

async function onClickVendingMachine() {
	await showVendingMachineModal();
	// Probably refetch data afterwards as users may have bought packs.
}

async function onClickPack(pack: UserStickerPack) {
	const payload = await Api.sendRequest(
		`/web/stickers/open-pack/${pack.id}`,
		{},
		{ detach: true }
	);
	// Refetch data as the pack was opened, and new stickers were added.
	showSuccessGrowl(JSON.stringify(payload), 'OPENED PACK');
}
</script>

<template>
	<div id="shell-sidebar-backpack">
		<AppLoading v-if="isLoading" centered class="-loading" />
		<div v-else>
			<AppButton @click="onClickVendingMachine()">Vending Machine</AppButton>

			<AppStickerPack
				v-for="userPack in ownedPacks"
				:key="userPack.id"
				:pack="userPack.sticker_pack"
				@click="onClickPack(userPack)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-loading
	margin-top: 36px
</style>
