<script lang="ts" setup>
import { RealmModel } from './realm-model';

type Props = {
	realm: RealmModel;
	overlay?: boolean;
	small?: boolean;
	tiny?: boolean;
};
defineProps<Props>();
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
