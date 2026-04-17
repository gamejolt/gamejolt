<script lang="ts" setup>
import { computed } from 'vue';

import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppGameCollectionThumbnail from '~app/components/game/collection/thumbnail/AppGameCollectionThumbnail.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

type Props = {
	collection: GameCollectionModel;
	eventLabel?: string;
};

const { collection } = defineProps<Props>();

const notOwner = computed(() => {
	return collection.from_subscription || !collection.isOwner;
});
</script>

<template>
	<div class="game-collection-grid-item">
		<router-link :to="collection.routeLocation">
			<AppGameCollectionThumbnail :collection="collection" />

			<div class="game-collection-title h4">
				<template v-if="collection.type === 'developer'">
					<span
						v-if="notOwner"
						v-translate="{ developer: '@' + collection.owner?.username }"
					>
						Games Made
						<small>by %{ developer }</small>
					</span>
					<AppTranslate v-else> Your Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'followed'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner?.username }">
						Games Followed
						<small>by %{ user }</small>
					</span>
					<AppTranslate v-else> Your Followed Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'owned'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner?.username }">
						Games Owned
						<small>by %{ user }</small>
					</span>
					<AppTranslate v-else> Your Owned Games </AppTranslate>
				</template>
				<template v-else-if="collection.type === 'recommended'">
					<span v-if="notOwner" v-translate="{ user: '@' + collection.owner?.username }">
						Daily Mix
						<small>for %{ user }</small>
					</span>
					<AppTranslate v-else> Your Daily Mix </AppTranslate>
				</template>
				<template v-else>
					{{ collection.name }}
				</template>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.game-collection-grid-item
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm
		&:nth-child(odd)
			clear: both

	@media $media-md
		&:nth-child(odd)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	> a
		display: block

.game-collection-title
	margin: 0
	margin-top: $font-size-base

	a &
		color: $headings-color

	> small
		theme-prop('color', 'fg-muted')
</style>
