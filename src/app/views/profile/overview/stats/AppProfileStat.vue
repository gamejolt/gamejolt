<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import { ProfileStat } from './AppProfileStats.vue';

defineProps({
	item: {
		type: Object as PropType<ProfileStat>,
		required: true,
	},
	tag: {
		type: String,
		default: 'div',
	},
});
</script>

<template>
	<component
		:is="item.location ? RouterLink : item.action ? 'a' : tag"
		class="stat-big stat-big-smaller text-center"
		:class="{
			'link-unstyled': item.location,
		}"
		:style="{
			flex: 1,
			marginBottom: 0,
		}"
		:to="item.location"
		@click="item.action?.()"
	>
		<div class="stat-big-digit">
			{{ item.value }}
		</div>
		<div class="stat-big-label">
			{{ item.label }}
		</div>
	</component>
</template>
