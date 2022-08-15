<script lang="ts" setup>
import AppPostCardPlaceholder from '../../fireside/post/card/AppPostCardPlaceholder.vue';
import { Screen } from '../../screen/screen-service';
import AppSpacer from '../../spacer/AppSpacer.vue';

defineProps({
	cardsPerRow: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div :class="{ '-scroller': Screen.isXs }">
		<div class="-posts">
			<template v-for="num of cardsPerRow" :key="num">
				<AppSpacer v-if="num > 1" horizontal :scale="4" :scale-xs="2" />

				<div class="-card">
					<AppPostCardPlaceholder />
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" src="./common.styl" scoped></style>
