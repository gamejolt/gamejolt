<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import {
	CollectionType,
	COLLECTION_TYPE_GAME,
	COLLECTION_TYPE_GAMEJOLT,
	COLLECTION_TYPE_USER,
} from './collection.model';

const props = defineProps({
	type: {
		type: String as PropType<CollectionType>,
		required: true,
	},
	canSelect: {
		type: Boolean,
	},
});

const { type } = toRefs(props);
</script>

<template>
	<div
		class="_book"
		:class="{
			'_book-user': type === COLLECTION_TYPE_USER,
			'_book-game': type === COLLECTION_TYPE_GAME,
			'_book-gamejolt': type === COLLECTION_TYPE_GAMEJOLT,
		}"
	>
		test
	</div>
</template>

<style lang="stylus" scoped>
._book
	rounded-corners-lg()

._book-user
	background-color: red;

._book-game
	background-color: blue;

._book-gamejolt
	background-color: green;
</style>
