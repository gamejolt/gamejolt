import View from '!view!./overview.html?style=./overview.styl';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { GameCollection } from '../../../components/game/collection/collection.model';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import { AppGameCollectionList } from '../../../components/game/collection/list/list';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { Store } from '../../../store/index';
import { LibraryState, LibraryStore } from '../../../store/library';

@View
@Component({
	name: 'RouteLibraryOverview',
	components: {
		AppPageHeader,
		AppGameCollectionGrid,
		AppGameCollectionList,
	},
})
export default class RouteLibraryOverview extends BaseRouteComponent {
	@State
	isBootstrapped!: Store['isBootstrapped'];

	@LibraryState
	followedCollection!: LibraryStore['followedCollection'];

	@LibraryState
	developerCollection!: LibraryStore['developerCollection'];

	@LibraryState
	ownedCollection!: LibraryStore['ownedCollection'];

	@LibraryState
	collections!: LibraryStore['collections'];

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
			// {
			// 	key: 'bundleCollections',
			// 	heading: this.$gettext( 'Bundles' ),
			// 	eventLabel: 'bundle',
			// 	collections: ,
			// },
			{
				key: 'followedCollections',
				heading: this.$gettext('Followed Playlists'),
				eventLabel: 'followed',
				collections: this.followedCollections,
			},
		];
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
