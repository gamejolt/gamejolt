import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { stringSort } from 'game-jolt-frontend-lib/utils/array';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
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
