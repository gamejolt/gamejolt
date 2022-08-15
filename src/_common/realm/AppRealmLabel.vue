<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<div class="-label">
		{{ realm.name }}
	</div>
</template>

<style lang="stylus" scoped>
.-label
	change-bg('bg-backdrop')
	padding: 4px 8px
	border-radius: 24px
	font-weight: 700
</style>
