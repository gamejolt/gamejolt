<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { GameCollectionModel } from '../collection.model';
import AppGameCollectionThumbnail from '../thumbnail/AppGameCollectionThumbnail.vue';

type Props = {
	collections: GameCollectionModel[];
	eventLabel?: string;
};

defineProps<Props>();
</script>

<template>
	<div class="list-group game-collection-list">
		<RouterLink
			v-for="collection of collections"
			:key="collection._id"
			class="list-group-item clearfix"
			:to="collection.routeLocation"
			:title="collection.getTitle()"
		>
			<div class="row">
				<div class="col-xs-3">
					<AppGameCollectionThumbnail :collection="collection" hide-tag />
				</div>
				<div class="col-xs-9">
					<div class="game-collection-title h5">
						{{ collection.name }}

						<small v-if="collection.from_subscription && collection.owner">
							{{ ' ' }}
							<AppTranslate translate-comment="As in made by: / the author is:">
								by
							</AppTranslate>
							{{ ' @' + collection.owner.username }}
						</small>
					</div>
				</div>
			</div>
		</RouterLink>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-list
	// Override from the grid to make this smaller.
	.game-collection-title
		margin-top: 0
</style>
