<script lang="ts" setup>
import { ref } from 'vue';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppLoading from '../../loading/AppLoading.vue';
import { Sticker } from '../../sticker/sticker.model';
import AppTranslate from '../../translate/AppTranslate.vue';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	stickerId: {
		type: Number,
		required: true,
	},
	isCharged: {
		type: Boolean,
	},
});

const owner = useContentOwnerController()!;

const sticker = ref<Sticker>();
const hasError = ref(false);

owner.hydrator.useData('sticker-id', props.stickerId.toString(), data => {
	if (data) {
		sticker.value = new Sticker(data);
	} else {
		hasError.value = true;
	}
});
</script>

<template>
	<div class="-sticker">
		<template v-if="sticker">
			<AppAnimElectricity :disabled="!isCharged" shock-anim="square" ignore-asset-padding>
				<AppImgResponsive class="content-image" :src="sticker.img_url" />
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
