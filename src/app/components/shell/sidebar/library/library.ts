import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { stringSort } from '../../../../../utils/array';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppShortkey from '../../../../../_common/shortkey/shortkey.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../../store/index';
import { LibraryModule, LibraryStore } from '../../../../store/library';
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
	},
})
export default class AppShellSidebarLibrary extends Vue {
	@State app!: Store['app'];
	@State isLibraryBootstrapped!: Store['isLibraryBootstrapped'];
	@LibraryModule.State bundleCollections!: LibraryStore['bundleCollections'];
	@LibraryModule.State developerCollection!: LibraryStore['developerCollection'];
	@LibraryModule.State followedCollection!: LibraryStore['followedCollection'];
	@LibraryModule.State ownedCollection!: LibraryStore['ownedCollection'];
	@LibraryModule.State collections!: LibraryStore['collections'];
	@LibraryModule.State playlistFolders!: LibraryStore['playlistFolders'];
	@LibraryModule.Action newPlaylist!: LibraryStore['newPlaylist'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	playlistFilterQuery = '';
	openFolders: string[] = [];

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	get collectionsLength() {
		return number(this.collections.length);
	}

	get bundleCollectionsLength() {
		return number(this.bundleCollections.length);
	}

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
