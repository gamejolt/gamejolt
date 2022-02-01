<script lang="ts" setup>
import { computed, PropType, useAttrs } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import AppJolticon from '../jolticon/AppJolticon.vue';

const props = defineProps({
	tag: {
		type: String,
		default: 'button',
	},
	primary: {
		type: Boolean,
	},
	trans: {
		type: Boolean,
	},
	solid: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	sparse: {
		type: Boolean,
	},
	circle: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
	lg: {
		type: Boolean,
	},
	sm: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
	blockXs: {
		type: Boolean,
	},
	icon: {
		type: String,
		default: undefined,
	},
	badge: {
		type: String,
		default: undefined,
	},
	to: {
		type: null as unknown as PropType<RouteLocationRaw>,
		default: undefined,
	},
});

const attrs = useAttrs();

const ourTag = computed(() => {
	if (attrs.href) {
		return 'a';
	} else if (props.to) {
		return RouterLink;
	}
	return props.tag;
});
</script>

<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': primary,
			'-trans': trans,
			'-outline': !solid,
			'-overlay': overlay,
			'-circle': circle,
			'-sparse': sparse || circle,
			'-lg': lg,
			'-sm': sm,
			'-block': block,
			'-block-xs': blockXs,
			'-disabled': disabled,
		}"
		:to="to"
		:disabled="disabled === true ? 'disabled' : null"
	>
		<span v-if="badge" class="-badge">{{ badge }}</span>
		<AppJolticon v-if="icon" class="-icon" :icon="icon" :big="lg" />
		<slot />
	</component>
</template>

<style lang="stylus" src="./button.styl" scoped></style>
