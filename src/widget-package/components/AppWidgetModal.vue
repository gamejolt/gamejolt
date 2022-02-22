<script lang="ts" setup>
import AppButton from '../../_common/button/AppButton.vue';
import AppScrollScroller from '../../_common/scroll/AppScrollScroller.vue';

defineProps({
	hideClose: {
		type: Boolean,
	},
});

const emit = defineEmits({
	close: () => true,
});

function close() {
	emit('close');
}
</script>

<template>
	<AppScrollScroller class="-modal fill-darker anim-fade-in-shrink">
		<AppButton v-if="!hideClose" sm sparse icon="remove" class="-close" @click="close" />
		<slot />
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-modal
	rounded-corners()
	position: absolute
	top: $shell-padding
	right: $shell-padding
	bottom: $shell-padding
	left: $shell-padding
	padding: $grid-gutter-width
	box-shadow: 0 0 5px $black
	border: 1px solid $gray
	z-index: 10

.-close
	float: right
	margin-left: $shell-padding
	margin-bottom: $shell-padding
</style>
