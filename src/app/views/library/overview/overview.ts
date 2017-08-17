import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./overview.html?style=./overview.styl';

import { GameCollection } from '../../../components/game/collection/collection.model';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameCollectionList } from '../../../components/game/collection/list/list';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import { Store } from '../../../store/index';
import { LibraryState, LibraryStore } from '../../../store/library';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteLibraryOverview',
	components: {
		AppPageHeader,
		AppJolticon,
		AppGameCollectionGrid,
		AppGameCollectionList,
	},
})
export default class RouteLibraryOverview extends BaseRouteComponent {
	@State isBootstrapped: Store['isBootstrapped'];
	@LibraryState followedCollection: LibraryStore['followedCollection'];
	@LibraryState developerCollection: LibraryStore['developerCollection'];
	@LibraryState ownedCollection: LibraryStore['ownedCollection'];
	@LibraryState recommendedCollection: LibraryStore['recommendedCollection'];
	@LibraryState collections: LibraryStore['collections'];

	Connection = makeObservableService(Connection);
	Screen = makeObservableService(Screen);

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

		if (this.recommendedCollection) {
			main.push(this.recommendedCollection);
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
