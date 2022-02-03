<script lang="ts" setup>
import { PropType } from 'vue';
import { Realm } from './realm-model';
import AppRealmThumbnail from './AppRealmThumbnail.vue';

defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});
</script>

<template>
	<div class="-label">
		<div class="-avatar">
			<AppRealmThumbnail :realm="realm" />
		</div>
		<div class="-content">{{ realm.name }}</div>
	</div>
</template>

<style lang="stylus" scoped>
.-label
	change-bg('bg-backdrop')
	display: inline-flex
	flex-direction: row
	align-items: center
	padding: 4px 8px
	border-radius: 100px

.-avatar
	width: 16px
	height: 16px
	border-radius: 50%
	overflow: hidden
	margin-right: 4px

.-content
	font-weight: 700
</style>
