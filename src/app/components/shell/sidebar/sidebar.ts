import View from '!view!./sidebar.html?style=./sidebar.styl';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollScroller } from '../../../../lib/gj-lib-client/components/scroll/scroller/scroller';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { Store } from '../../../store/index';
import { LibraryAction, LibraryState, LibraryStore } from '../../../store/library';
import { AppShellSidebarCollectionList } from './collection-list';

@View
@Component({
	components: {
		AppPopper,
		AppUserAvatarImg,
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
export class AppShellSidebar extends Vue {
	@State
	app!: Store['app'];

	@State
	isBootstrapped!: Store['isBootstrapped'];

	@State
	isLibraryBootstrapped!: Store['isLibraryBootstrapped'];

	@State
	notificationCount!: Store['notificationCount'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@LibraryState
	bundleCollections!: LibraryStore['bundleCollections'];

	@LibraryState
	developerCollection!: LibraryStore['developerCollection'];

	@LibraryState
	followedCollection!: LibraryStore['followedCollection'];

	@LibraryState
	ownedCollection!: LibraryStore['ownedCollection'];

	@LibraryState
	collections!: LibraryStore['collections'];

	@LibraryState
	playlistFolders!: LibraryStore['playlistFolders'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];

	@LibraryAction
	newPlaylist!: LibraryStore['newPlaylist'];

	playlistFilterQuery = '';
	openFolders: string[] = [];

	// This is "hot".
	defaultBrowseSection = null;

	readonly Environment = Environment;
	readonly Screen = Screen;

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
