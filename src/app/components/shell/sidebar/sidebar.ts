import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { stringSort } from '../../../../utils/array';
import AppShortkey from '../../../../_common/shortkey/shortkey.vue';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Store } from '../../../store/index';
import { LibraryModule, LibraryStore } from '../../../store/library';
import AppShellSidebarCollectionList from './collection-list.vue';

@Component({
	components: {
		AppShellSidebarCollectionList,
		AppExpand,
		AppScrollScroller,
		AppShortkey,
	},
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export default class AppShellSidebar extends Vue {
	@State
	app!: Store['app'];

	@State
	isLibraryBootstrapped!: Store['isLibraryBootstrapped'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@LibraryModule.State
	bundleCollections!: LibraryStore['bundleCollections'];

	@LibraryModule.State
	developerCollection!: LibraryStore['developerCollection'];

	@LibraryModule.State
	followedCollection!: LibraryStore['followedCollection'];

	@LibraryModule.State
	ownedCollection!: LibraryStore['ownedCollection'];

	@LibraryModule.State
	collections!: LibraryStore['collections'];

	@LibraryModule.State
	playlistFolders!: LibraryStore['playlistFolders'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];

	@LibraryModule.Action
	newPlaylist!: LibraryStore['newPlaylist'];

	playlistFilterQuery = '';
	openFolders: string[] = [];

	readonly Environment = Environment;
	readonly Screen = Screen;

	get filteredBundleCollections() {
		return this.bundleCollections.sort((a, b) => stringSort(a.name, b.name));
	}

	get playlistFoldersToDisplay() {
		return Object.keys(this.playlistFolders).filter(folder => folder !== 'main');
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
