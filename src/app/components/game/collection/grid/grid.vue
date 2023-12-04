<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameCollectionModel } from '../collection.model';
import AppGameCollectionGridItem from './item/item.vue';

@Options({
	components: {
		AppGameCollectionGridItem,
	},
})
export default class AppGameCollectionGrid extends Vue {
	@Prop(Array) collections!: GameCollectionModel[];
	@Prop(String) eventLabel?: string;
}
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
