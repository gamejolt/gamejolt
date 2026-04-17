<script lang="ts" setup>
import { ref } from 'vue';

import AppAnimElectricity from '~common/animation/AppAnimElectricity.vue';
import { useContentOwnerController } from '~common/content/content-owner';
import AppLoading from '~common/loading/AppLoading.vue';
import { storeModel } from '~common/model/model-store.service';
import { StickerModel } from '~common/sticker/sticker.model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	stickerId: number;
	isCharged?: boolean;
};
const { stickerId, isCharged } = defineProps<Props>();

const owner = useContentOwnerController()!;

const sticker = ref<StickerModel>();
const hasError = ref(false);

owner.hydrator.useData('sticker-id', stickerId.toString(), data => {
	if (data) {
		sticker.value = storeModel(StickerModel, data);
	} else {
		hasError.value = true;
	}
});
</script>

<template>
	<div class="-sticker">
		<template v-if="sticker">
			<AppAnimElectricity :disabled="!isCharged" shock-anim="square" ignore-asset-padding>
				<img
					class="content-image"
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:src="sticker.img_url"
					:alt="sticker.name || ''"
				/>
			</AppAnimElectricity>
		</template>
		<template v-else-if="hasError">
			<AppTranslate>Error loading sticker</AppTranslate>
		</template>
		<template v-else>
			<AppLoading />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-sticker
	width: 64px
	height: 64px
</style>
