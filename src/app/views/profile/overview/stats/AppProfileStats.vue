<script lang="ts">
import { PropType } from 'vue';
import { ProfileTileAction } from '../RouteProfileOverview.vue';

export type ProfileStat = {
	label: string;
	value: string;
} & ProfileTileAction;
</script>

<script lang="ts" setup>
defineProps({
	items: {
		type: Array as PropType<ProfileStat[]>,
		required: true,
	},
});
</script>

<template>
	<div
		v-if="$slots.default"
		:style="{
			display: `flex`,
			flexDirection: `row`,
			justifyContent: `space-around`,
			flexWrap: `wrap`,
		}"
	>
		<slot v-for="item in items" v-bind="item" :key="item.label" />
		<slot name="extras" />
	</div>
</template>
