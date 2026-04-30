<script lang="ts" setup>
import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppGameCollectionThumbnail from '~app/components/game/collection/thumbnail/AppGameCollectionThumbnail.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	collections: GameCollectionModel[];
};

const { collections } = defineProps<Props>();
</script>

<template>
	<div class="list-group game-collection-list">
		<router-link
			v-for="collection of collections"
			:key="collection._id"
			class="list-group-item clearfix"
			:to="collection.routeLocation"
			:title="collection.getTitle()"
		>
			<div class="row">
				<div class="col-xs-3">
					<AppGameCollectionThumbnail :collection="collection" :hide-tag="true" />
				</div>
				<div class="col-xs-9">
					<div class="game-collection-title h5">
						{{ collection.name }}

						<small v-if="collection.from_subscription">
							{{ ' ' }}
							<AppTranslate translate-comment="As in made by: / the author is:">
								by
							</AppTranslate>
							{{ ' @' + collection.owner?.username }}
						</small>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-list
	// Override from the grid to make this smaller.
	.game-collection-title
		margin-top: 0
</style>
