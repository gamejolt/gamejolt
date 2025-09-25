<script lang="ts" setup>
import { GameCollectionModel } from '../collection.model';
import AppGameCollectionGridItem from './item/AppGameCollectionGridItem.vue';

type Props = {
	collections: GameCollectionModel[];
	eventLabel?: string;
};

defineProps<Props>();
</script>

<template>
	<div class="row game-collection-grid">
		<div
			v-for="collection of collections"
			:key="collection._id"
			class="col-xs-12 col-sm-6 col-lg-4 game-collection-grid-item"
		>
			<AppGameCollectionGridItem :collection :event-label="eventLabel" />
		</div>
	</div>
</template>
