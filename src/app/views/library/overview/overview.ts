import { Options } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { shallowSetup } from '../../../../utils/vue';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseRouteComponent } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { GameCollection } from '../../../components/game/collection/collection.model';
import AppGameCollectionGrid from '../../../components/game/collection/grid/grid.vue';
import AppGameCollectionList from '../../../components/game/collection/list/list.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store } from '../../../store';
import { useLibraryStore } from '../../../store/library';

@Options({
	name: 'RouteLibraryOverview',
	components: {
		AppPageHeader,
		AppGameCollectionGrid,
		AppGameCollectionList,
	},
})
export default class RouteLibraryOverview extends BaseRouteComponent {
	libraryStore = shallowSetup(() => useLibraryStore());

	@State
	isBootstrapped!: Store['isBootstrapped'];

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
		return this.$gettext('library.page_title');
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
		const main: GameCollection[] = [];

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
