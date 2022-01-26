<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { stringSort } from '../../../../../utils/array';
import { shouldShowAppPromotion } from '../../../../../utils/mobile-app';
import { shallowSetup } from '../../../../../utils/vue';
import { trackAppPromotionClick } from '../../../../../_common/analytics/analytics.service';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppShortkey from '../../../../../_common/shortkey/shortkey.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useAppStore } from '../../../../store/index';
import { libraryNewPlaylist, useLibraryStore } from '../../../../store/library';
import AppShellSidebarCollectionList from './AppShellSidebarCollectionList.vue';

@Options({
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
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	libraryStore = shallowSetup(() => useLibraryStore());

	get app() {
		return this.commonStore;
	}
	get isLibraryBootstrapped() {
		return this.store.isLibraryBootstrapped;
	}

	playlistFilterQuery = '';
	openFolders: string[] = [];

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly trackAppPromotionClick = trackAppPromotionClick;

	get bundleCollections() {
		return this.libraryStore.bundleCollections.value;
	}

	get developerCollection() {
		return this.libraryStore.developerCollection.value;
	}
	get followedCollection() {
		return this.libraryStore.followedCollection.value;
	}

	get ownedCollection() {
		return this.libraryStore.ownedCollection.value;
	}

	get collections() {
		return this.libraryStore.collections.value;
	}

	get playlistFolders() {
		return this.libraryStore.playlistFolders.value;
	}

	get collectionsLength() {
		return formatNumber(this.collections.length);
	}

	get bundleCollectionsLength() {
		return formatNumber(this.bundleCollections.length);
	}

	get filteredBundleCollections() {
		return this.bundleCollections.sort((a, b) => stringSort(a.name, b.name));
	}

	get playlistFoldersToDisplay() {
		return Object.keys(this.playlistFolders).filter(folder => folder !== 'main');
	}

	get shouldShowAppPromotion() {
		return shouldShowAppPromotion(this.$route);
	}

	get mainPlaylists() {
		return this.playlistFolders.main.collections.value;
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
		const collection = await libraryNewPlaylist(this.libraryStore);
		if (collection) {
			this.$router.push(collection.routeLocation);
		}
	}
}
</script>

<template>
	<div id="shell-sidebar-library">
		<ul v-if="Screen.isXs" class="shell-nav">
			<li class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:discover`"
					:to="{ name: 'discover.home' }"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="compass-needle" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Explore</AppTranslate>
					</span>
				</router-link>
			</li>

			<li class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:store`"
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
					:class="{ active: ($route.name || '').startsWith('discover.games.') }"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="game" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Store</AppTranslate>
					</span>
				</router-link>
			</li>

			<li class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:search`"
					:to="{ name: 'search.results' }"
					:class="{ active: $route.name && $route.name.indexOf('search') === 0 }"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="search" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Search</AppTranslate>
					</span>
				</router-link>
			</li>
		</ul>

		<ul v-if="app.user" class="shell-nav">
			<li v-if="GJ_IS_DESKTOP_APP">
				<router-link
					v-app-track-event="`sidebar:collection:installed`"
					:to="{ name: 'library.installed' }"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="download-box" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Installed Games</AppTranslate>
					</span>
				</router-link>
			</li>

			<li v-if="developerCollection" class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:collection:developer`"
					:to="developerCollection.routeLocation"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="user" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>library.nav.developer</AppTranslate>
					</span>
				</router-link>
			</li>

			<li v-if="followedCollection && !Screen.isXs" class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:collection:followed`"
					:to="followedCollection.routeLocation"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="subscribe" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>library.nav.followed</AppTranslate>
					</span>
				</router-link>
			</li>

			<li v-if="ownedCollection && !Screen.isXs" class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:collection:owned`"
					:to="ownedCollection.routeLocation"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="heart-filled" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Owned Games</AppTranslate>
					</span>
				</router-link>
			</li>
		</ul>

		<ul v-if="Screen.isSm && shouldShowAppPromotion" class="shell-nav">
			<li class="offline-disable">
				<router-link
					:to="{ name: 'landing.app' }"
					@click="
						trackAppPromotionClick({
							source: 'sidebar',
							platform: 'mobile',
						})
					"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="phone" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Get the Mobile App</AppTranslate>
					</span>
				</router-link>
			</li>
		</ul>
		<ul v-else-if="!GJ_IS_DESKTOP_APP && Screen.isDesktop" class="shell-nav">
			<li class="offline-disable">
				<router-link
					:to="{ name: 'landing.client' }"
					@click="
						trackAppPromotionClick({
							source: 'sidebar',
							platform: 'desktop',
						})
					"
				>
					<span class="shell-nav-icon">
						<AppJolticon icon="client" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Get the Desktop App</AppTranslate>
					</span>
				</router-link>
			</li>
		</ul>

		<template v-if="app.user">
			<template v-if="bundleCollections.length">
				<div class="nav-heading">
					<AppTranslate>library.nav.bundles</AppTranslate>
					<span class="badge">
						{{ bundleCollectionsLength }}
					</span>
				</div>

				<ul class="shell-nav">
					<li
						v-for="bundleCollection of filteredBundleCollections"
						:key="bundleCollection._id"
						class="offline-disable"
					>
						<router-link
							v-app-track-event="`sidebar:collection:bundle`"
							:to="bundleCollection.routeLocation"
							active-class="active"
							:title="bundleCollection.name"
						>
							<span class="shell-nav-icon">
								<AppJolticon icon="bundle" />
							</span>
							<span class="shell-nav-label">
								{{ bundleCollection.name }}
							</span>
						</router-link>
					</li>
				</ul>
			</template>

			<!-- Playlists -->
			<template v-if="isLibraryBootstrapped">
				<div class="nav-heading" :title="$gettext(`library.nav.playlists`)">
					<AppTranslate>library.nav.playlists</AppTranslate>
					<span class="badge">
						{{ collectionsLength }}
					</span>
				</div>

				<div class="nav-controls">
					<AppButton
						v-app-track-event="`sidebar:playlist-add`"
						primary
						block
						class="offline-disable"
						@click="showAddPlaylistModal"
					>
						<AppTranslate>library.nav.new_playlist_button</AppTranslate>
					</AppButton>
				</div>

				<div v-if="collections.length > 0" class="nav-controls">
					<input
						v-model="playlistFilterQuery"
						type="search"
						class="form-control"
						:placeholder="$gettext(`library.nav.filter_playlists_placeholder`)"
					/>
				</div>
				<div v-else class="-no-playlists alert">
					<div v-translate>library.nav.no_playlists_html</div>
				</div>

				<!-- Playlist Folders -->
				<div v-for="key of playlistFoldersToDisplay" :key="key">
					<ul class="shell-nav">
						<li class="offline-disable">
							<a @click="toggleFolder(key)">
								<span class="shell-nav-icon">
									<AppJolticon
										:icon="
											openFolders.indexOf(key) === -1
												? 'folder'
												: 'folder-open'
										"
									/>
								</span>
								{{ playlistFolders[key].title }}
							</a>
							<AppExpand :when="openFolders.indexOf(key) !== -1">
								<AppShellSidebarCollectionList
									:collections="playlistFolders[key].collections.value"
									:filter="playlistFilterQuery"
									:should-sort="key === 'developers'"
								/>
							</AppExpand>
						</li>
					</ul>
				</div>

				<!-- Main Playlists (not in folders) -->
				<AppShellSidebarCollectionList
					:collections="mainPlaylists"
					:filter="playlistFilterQuery"
				/>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
#shell-sidebar-library
	padding-top: 16px

	.-no-playlists
		margin-left: ($grid-gutter-width-xs / 2)
		margin-right: ($grid-gutter-width-xs / 2)
		background-color: var(--theme-bg-subtle)
</style>
