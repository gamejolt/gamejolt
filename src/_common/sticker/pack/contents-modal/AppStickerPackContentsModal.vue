<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { CancelToken } from '../../../../utils/cancel-token';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/AppButton.vue';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import { storeModelList } from '../../../model/model-store.service';
import AppSpacer from '../../../spacer/AppSpacer.vue';
import { StickerModel } from '../../sticker.model';
import AppStickerGrid from '../AppStickerGrid.vue';
import { StickerPackModel } from '../pack.model';

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPackModel>,
		required: true,
	},
});

const { pack } = toRefs(props);

const modal = useModal()!;

const isLoading = ref(true);
const stickers = ref<StickerModel[]>([]);

let cancelToken = new CancelToken();

watch(
	pack,
	async () => {
		cancelToken.cancel();
		cancelToken = new CancelToken();
		const ourToken = cancelToken;

		isLoading.value = true;

		const payload = await Api.sendFieldsRequest(
			`/mobile/sticker`,
			{
				packContents: {
					packId: pack.value.id,
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
