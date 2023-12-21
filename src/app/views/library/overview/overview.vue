<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Connection } from '../../../../_common/connection/connection-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { shallowSetup } from '../../../../utils/vue';
import { GameCollectionModel } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/grid.vue';
import AppGameCollectionList from '../../../components/game/collection/list/list.vue';
import AppPageHeader from '../../../components/page-header/AppPageHeader.vue';
import { useAppStore } from '../../../store';
import { useLibraryStore } from '../../../store/library';

@Options({
	name: 'RouteLibraryOverview',
	components: {
		AppPageHeader,
		AppGameCollectionGrid,
		AppGameCollectionList,
	},
})
@OptionsForLegacyRoute({
	deps: {},
})
export default class RouteLibraryOverview extends LegacyRouteComponent {
	store = setup(() => useAppStore());
	libraryStore = shallowSetup(() => useLibraryStore());

	get isBootstrapped() {
		return this.store.isBootstrapped;
	}

	get followedCollection() {
		return this.libraryStore.followedCollection.value;
	}

	get developerCollection() {
		return this.libraryStore.developerCollection.value;
	}

	get ownedCollection() {
		return this.libraryStore.ownedCollection.value;
	}

	get collections() {
		return this.libraryStore.collections.value;
	}

	readonly Connection = Connection;
	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettext('Your Library of Games');
	}

	get collectionGroups() {
		return [
			{
				key: 'mainCollections',
				heading: null,
				eventLabel: 'system',
				collections: this.mainCollections,
			},
			{
				key: 'playlistCollections',
				heading: this.$gettext('Your Playlists'),
				eventLabel: 'playlist',
				collections: this.playlistCollections,
			},
			{
				key: 'followedCollections',
				heading: this.$gettext('Followed Playlists'),
				eventLabel: 'followed',
				collections: this.followedCollections,
			},
		].filter(i => i.collections.length > 0);
	}

	get mainCollections() {
		const main: GameCollectionModel[] = [];

		if (this.followedCollection) {
			main.push(this.followedCollection);
		}

		if (this.developerCollection) {
			main.push(this.developerCollection);
		}

		if (this.ownedCollection) {
			main.push(this.ownedCollection);
		}

		return main;
	}

	get playlistCollections() {
		return this.collections.filter(collection => {
			if (collection.type === 'playlist' && !collection.from_subscription) {
				return true;
			}
			return false;
		});
	}

	get followedCollections() {
		return this.collections.filter(collection => {
			if (collection.from_subscription) {
				return true;
			}
			return false;
		});
	}
}
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
					<AppGameCollectionList
						v-if="Screen.isXs"
						:collections="group.collections"
						:event-label="`library-overview:collection:${group.eventLabel}`"
					/>

					<AppGameCollectionGrid
						v-else
						:collections="group.collections"
						:event-label="`library-overview:collection:${group.eventLabel}`"
					/>
				</div>
			</section>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.route-library-overview-page .collection-row-section
	padding-bottom: 0
</style>
