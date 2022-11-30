<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	small: {
		type: Boolean,
	},
	tiny: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="-label" :class="{ '-label-overlay': overlay, small, tiny }">
		{{ realm.name }}
	</div>
</template>

<style lang="stylus" scoped>
.-label
	change-bg('bg-backdrop')
	line-clamp(2)
	padding: 4px 8px
	border-radius: 16px
	font-weight: 700

.-label-overlay
	background-color: rgba($black, 0.65)
	color: white
</style>
