<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { ModelData } from '../../../../../_common/model/model.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { StickerPack } from '../../../../../_common/sticker/pack/pack.model';
import { Sticker } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/creators/stickers'),
	}),
};

type InitPayload = {
	stickers: ModelData<Sticker>[];
	pack: ModelData<StickerPack> | null;
	maxStickerAmount: number;
};
</script>

<script lang="ts" setup>
const stickers = ref([]) as Ref<Sticker[]>;
const pack = ref<StickerPack | null>(null);
const maxStickerAmount = ref(5);

const routeTitle = computed(() => $gettext(`Your Stickers`));

createAppRoute({
	routeTitle,
	onResolved(data) {
		const payload: InitPayload = data.payload;

		stickers.value = Sticker.populate(payload.stickers);
		pack.value = payload.pack ? new StickerPack(payload.pack) : null;
		maxStickerAmount.value = payload.maxStickerAmount;
	},
});
</script>

<template>
	<div></div>
</template>

<style lang="stylus" scoped></style>
