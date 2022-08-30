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
});
</script>

<template>
	<div class="-label" :class="{ '-label-overlay': overlay }">
		{{ realm.name }}
	</div>
</template>

<style lang="stylus" scoped>
.-label
	change-bg('bg-backdrop')
	padding: 4px 8px
	border-radius: 24px
	font-weight: 700

.-label-overlay
	background-color: rgba($black, 0.65)
	color: white
</style>
