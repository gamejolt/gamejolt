<script lang="ts" setup>
import { ref, watch } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { storeModelList } from '~common/model/model-store.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppStickerGrid from '~common/sticker/pack/AppStickerGrid.vue';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { CancelToken } from '~utils/cancel-token';

type Props = {
	pack: StickerPackModel;
};
const { pack } = defineProps<Props>();

const modal = useModal()!;

const isLoading = ref(true);
const stickers = ref<StickerModel[]>([]);

let cancelToken = new CancelToken();

watch(
	() => pack,
	async () => {
		cancelToken.cancel();
		cancelToken = new CancelToken();
		const ourToken = cancelToken;

		isLoading.value = true;

		const payload = await Api.sendFieldsRequest(
			`/mobile/sticker`,
			{
				packContents: {
					packId: pack.id,
				},
			},
			{ detach: true }
		);

		if (ourToken.isCanceled) {
			return;
		}

		stickers.value = storeModelList(StickerModel, payload.packContents);
		isLoading.value = false;
	},
	{ immediate: true }
);
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			{{
				$gettext(`You'll get a random selection of these stickers when you open this pack.`)
			}}

			<AppSpacer vertical :scale="4" />

			<AppStickerGrid :stickers="stickers" />
		</div>
	</AppModal>
</template>
