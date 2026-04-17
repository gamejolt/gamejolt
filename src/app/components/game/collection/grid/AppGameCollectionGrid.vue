<script lang="ts" setup>
import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppGameCollectionGridItem from '~app/components/game/collection/grid/item/AppGameCollectionGridItem.vue';

type Props = {
	collections: GameCollectionModel[];
	eventLabel?: string;
};

const { collections, eventLabel } = defineProps<Props>();
</script>

<template>
	<div class="row game-collection-grid">
		<div
			v-for="collection of collections"
			:key="collection._id"
			class="col-xs-12 col-sm-6 col-lg-4 game-collection-grid-item"
		>
			<AppGameCollectionGridItem :collection="collection" :event-label="eventLabel" />
		</div>
	</div>
</template>
