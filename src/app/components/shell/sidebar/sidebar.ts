import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import * as View from '!view!./sidebar.html?style=./sidebar.styl';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { Store } from '../../../store/index';
import { AppShellSidebarCollectionList } from './collection-list';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { LibraryStore, LibraryAction, LibraryState } from '../../../store/library';

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
		AppUserAvatarImg,
		AppShellSidebarCollectionList,
		AppExpand,
	},
	directives: {
		AppPopoverTrigger,
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export class AppShellSidebar extends Vue {
	@State app: Store['app'];
	@State isBootstrapped: Store['isBootstrapped'];
	@State notificationCount: Store['notificationCount'];
	@State isLeftPaneVisible: Store['isLeftPaneVisible'];
	@LibraryState bundleCollections: LibraryStore['bundleCollections'];
	@LibraryState developerCollection: LibraryStore['developerCollection'];
	@LibraryState followedCollection: LibraryStore['followedCollection'];
	@LibraryState recommendedCollection: LibraryStore['recommendedCollection'];
	@LibraryState ownedCollection: LibraryStore['ownedCollection'];
	@LibraryState collections: LibraryStore['collections'];
	@LibraryState playlistFolders: LibraryStore['playlistFolders'];

	@Action toggleLeftPane: Store['toggleLeftPane'];
	@LibraryAction newPlaylist: LibraryStore['newPlaylist'];

	playlistFilterQuery = '';
	openFolders: string[] = [];

	channels = ['horror', 'multiplayer', 'retro', 'survival', 'fangame', 'fnaf'];

	genres = {
		action: 'Action',
		adventure: 'Adventure',
		arcade: 'Arcade',
		platformer: 'Platformer',
		puzzle: 'Puzzle',
		rpg: 'RPG',
		shooter: 'Shooter',
		sports: 'Sports',
		'strategy-sim': 'Strategy/Sim',
		other: 'Other',
	};

	Environment = Environment;
	Screen = makeObservableService(Screen);

	// Show hot when logged in, otherwise default to best.
	get defaultBrowseSection() {
		return this.app.user ? null : 'best';
	}

	get filteredBundleCollections() {
		return this.bundleCollections.sort((a, b) => stringSort(a.name, b.name));
	}

	toggleFolder(key: string) {
		const index = this.openFolders.indexOf(key);
		if (index === -1) {
			this.openFolders.push(key);
		} else {
			this.openFolders.splice(index, 1);
		}
	}

	async showAddPlaylistModal() {
		const collection = await this.newPlaylist();
		if (collection) {
			this.$router.push(collection.routeLocation);
		}
	}
}
