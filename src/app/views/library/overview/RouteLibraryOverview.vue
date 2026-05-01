<script lang="ts">
import { computed } from 'vue';

import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppGameCollectionGrid from '~app/components/game/collection/grid/AppGameCollectionGrid.vue';
import AppGameCollectionList from '~app/components/game/collection/list/AppGameCollectionList.vue';
import AppPageHeader from '~app/components/page-header/AppPageHeader.vue';
import { useLibraryStore } from '~app/store/library';
import { Connection } from '~common/connection/connection-service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { Screen } from '~common/screen/screen-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteLibraryOverview',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { followedCollection, developerCollection, ownedCollection, collections } = useLibraryStore();

const mainCollections = computed(() => {
	const main: GameCollectionModel[] = [];

	if (followedCollection.value) {
		main.push(followedCollection.value);
	}

	if (developerCollection.value) {
		main.push(developerCollection.value);
	}

	if (ownedCollection.value) {
		main.push(ownedCollection.value);
	}

	return main;
});

const playlistCollections = computed(() =>
	collections.value.filter(collection => {
		if (collection.type === 'playlist' && !collection.from_subscription) {
			return true;
		}
		return false;
	})
);

const followedCollections = computed(() =>
	collections.value.filter(collection => {
		if (collection.from_subscription) {
			return true;
		}
		return false;
	})
);

const collectionGroups = computed(() =>
	[
		{
			key: 'mainCollections',
			heading: null as string | null,
			collections: mainCollections.value,
		},
		{
			key: 'playlistCollections',
			heading: $gettext('Your Playlists'),
			collections: playlistCollections.value,
		},
		{
			key: 'followedCollections',
			heading: $gettext('Followed Playlists'),
			collections: followedCollections.value,
		},
	].filter(i => i.collections.length > 0)
);

createAppRoute({
	routeTitle: computed(() => $gettext('Your Library of Games')),
});
</script>

<template>
	<div class="route-library-overview">
		<AppPageHeader>
			<h1 class="section-header sans-margin-bottom">
				<AppTranslate>Game Library</AppTranslate>
			</h1>
			<div class="text-muted small">
				<p>
					<AppTranslate>
						This is your personalized library of games. Here dwell the games you've
						followed and any playlists or bundles that you've made or followed.
					</AppTranslate>
				</p>
			</div>
		</AppPageHeader>

		<!--
			When they are offline, we show them this message.
		-->
		<section v-if="Connection.isClientOffline" class="section fill-notice text-center">
			<p>
				<AppJolticon icon="notice" big />
			</p>
			<p class="sans-margin">
				<AppTranslate>You must be online to access your playlists.</AppTranslate>
			</p>
		</section>

		<template v-else>
			<section
				v-for="group of collectionGroups"
				:key="group.key"
				class="section collection-row-section"
			>
				<div v-if="group.heading" class="container">
					<h2 class="section-header" :class="{ h4: Screen.isXs }">
						{{ group.heading }}
					</h2>
				</div>

				<div :class="!Screen.isXs ? 'container' : ''">
					<AppGameCollectionList v-if="Screen.isXs" :collections="group.collections" />

					<AppGameCollectionGrid v-else :collections="group.collections" />
				</div>
			</section>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.route-library-overview-page .collection-row-section
	padding-bottom: 0
</style>
