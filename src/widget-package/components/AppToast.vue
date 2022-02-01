<script lang="ts" setup>
import { onMounted } from 'vue';
import AppJolticon from '../../_common/jolticon/AppJolticon.vue';

defineProps({
	type: {
		type: String,
		default: 'info',
	},
});

const emit = defineEmits({
	dismiss: () => true,
});

let _timeout: number | undefined;

onMounted(() => {
	_setTimer();
});

function focus() {
	_clear();
}

function blur() {
	_setTimer();
}

function dismiss() {
	emit('dismiss');
	_clear();
}

function _setTimer() {
	_timeout = window.setTimeout(() => dismiss(), 3000);
}

function _clear() {
	if (_timeout) {
		clearTimeout(_timeout);
		_timeout = undefined;
	}
}
</script>

<template>
	<div
		class="-toast"
		:class="{
			'fill-pink': type === 'error',
		}"
		@mouseenter="focus"
		@mouseleave="blur"
	>
		<a class="-close" @click="dismiss">
			<AppJolticon icon="remove" />
		</a>
		<AppJolticon v-if="type === 'error'" icon="notice" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-toast
	rounded-corners()
	position: absolute
	bottom: 0
	left: $shell-padding * 2
	right: @left
	padding: 7px 10px
	z-index: 1000

.-close
	float: right
	margin-left: 10px
</style>
