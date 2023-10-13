<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { CancelToken } from '../../../utils/cancel-token';
import { Api } from '../../api/api.service';
import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppLoading from '../../loading/AppLoading.vue';
import { storeModelList } from '../../model/model-store.service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import { $gettext } from '../../translate/translate.service';
import AppStickerMastery from '../AppStickerMastery.vue';
import { StickerModel } from '../sticker.model';
import { StickerPackModel } from './pack.model';

const props = defineProps({
	pack: {
		type: Object as PropType<StickerPackModel>,
		required: true,
	},
});

const { pack } = toRefs(props);

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

		stickers.value = storeModelList(StickerModel, payload.packContents || []);
		isLoading.value = false;
	},
	{ immediate: true }
);
</script>

<template>
	{{ $gettext(`You'll get a random selection of these stickers when you open this pack.`) }}

	<AppSpacer vertical :scale="4" />

	<template v-if="isLoading">
		<AppLoading centered />
	</template>
	<template v-else>
		<div
			:style="{
				display: `grid`,
				gap: `8px`,
				gridTemplateColumns: `repeat(auto-fill, minmax(56px, 1fr))`,
			}"
		>
			<div v-for="sticker of stickers" :key="sticker.id">
				<AppAspectRatio v-app-tooltip="sticker.name" :ratio="1">
					<img
						draggable="false"
						:style="{
							width: `100%`,
							height: `100%`,
						}"
						:src="sticker.img_url"
						@dragstart.prevent
					/>
				</AppAspectRatio>

				<template v-if="typeof sticker.mastery === 'number'">
					<AppSpacer vertical :scale="1" />
					<AppStickerMastery :progress="sticker.mastery" />
				</template>
			</div>
		</div>
	</template>
</template>
