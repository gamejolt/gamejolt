<script lang="ts" setup>
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppPostCardPlaceholder from '../../fireside/post/card/AppPostCardPlaceholder.vue';

defineProps({
	cardsPerRow: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div class="-posts">
		<template v-for="num of cardsPerRow" :key="num">
			<AppSpacer v-if="num > 1" horizontal :scale="4" />

			<div class="-card">
				<AppPostCardPlaceholder />
			</div>
		</template>
	</div>
</template>

<style lang="stylus" src="./common.styl" scoped></style>
