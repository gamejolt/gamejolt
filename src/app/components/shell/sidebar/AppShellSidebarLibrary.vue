<script lang="ts" setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useAppStore } from '../../../store/index';
import { libraryNewPlaylist, useLibraryStore } from '../../../store/library';
import AppShellSidebarCollectionList from './AppShellSidebarCollectionList.vue';

const { isLibraryBootstrapped } = useAppStore();
const { user } = useCommonStore();
const libraryStore = useLibraryStore();
const { developerCollection, followedCollection, ownedCollection, collections, playlistFolders } =
	libraryStore;
const router = useRouter();

const playlistFilterQuery = ref('');
const openFolders = ref<string[]>([]);

const collectionsLength = computed(() => formatNumber(collections.value.length));
const mainPlaylists = computed(() => playlistFolders.value.main.collections.value);
const playlistFoldersToDisplay = computed(() =>
	Object.keys(playlistFolders.value).filter(folder => folder !== 'main')
);

function toggleFolder(key: string) {
	const index = openFolders.value.indexOf(key);
	if (index === -1) {
		openFolders.value.push(key);
	} else {
		openFolders.value.splice(index, 1);
	}
}

async function showAddPlaylistModal() {
	const collection = await libraryNewPlaylist(libraryStore);
	if (collection) {
		router.push(collection.routeLocation);
	}
}
</script>

<template>
	<div id="shell-sidebar-library">
		<ul v-if="user" class="shell-nav">
			<li v-if="GJ_IS_DESKTOP_APP">
				<RouterLink :to="{ name: 'library.installed' }" active-class="active">
					<span class="shell-nav-icon">
						<AppJolticon icon="download-box" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Installed Games</AppTranslate>
					</span>
				</RouterLink>
			</li>

			<li v-if="developerCollection" class="offline-disable">
				<RouterLink :to="developerCollection.routeLocation" active-class="active">
					<span class="shell-nav-icon">
						<AppJolticon icon="user" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Your Games</AppTranslate>
					</span>
				</RouterLink>
			</li>

			<li v-if="followedCollection" class="offline-disable">
				<RouterLink :to="followedCollection.routeLocation" active-class="active">
					<span class="shell-nav-icon">
						<AppJolticon icon="subscribe" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Followed Games</AppTranslate>
					</span>
				</RouterLink>
			</li>

			<li v-if="ownedCollection" class="offline-disable">
				<RouterLink :to="ownedCollection.routeLocation" active-class="active">
					<span class="shell-nav-icon">
						<AppJolticon icon="heart-filled" />
					</span>
					<span class="shell-nav-label">
						<AppTranslate>Owned Games</AppTranslate>
					</span>
				</RouterLink>
			</li>
		</ul>

		<template v-if="user">
			<!-- Playlists -->
			<template v-if="isLibraryBootstrapped">
				<div class="nav-heading" :title="$gettext(`Playlists`)">
					<AppTranslate>Playlists</AppTranslate>
					<span class="badge">
						{{ collectionsLength }}
					</span>
				</div>

				<div class="nav-controls">
					<AppButton primary block class="offline-disable" @click="showAddPlaylistModal">
						<AppTranslate>New Playlist</AppTranslate>
					</AppButton>
				</div>

				<div v-if="collections.length > 0" class="nav-controls">
					<input
						v-model="playlistFilterQuery"
						type="search"
						class="form-control"
						:placeholder="$gettext(`Filter playlists...`)"
					/>
				</div>
				<div v-else class="-no-playlists alert">
					<p>
						<AppTranslate>
							Create playlists to organize and share the games in your library.
						</AppTranslate>
					</p>
					<p>
						<AppTranslate>
							Follow other people's playlists to discover more games!
						</AppTranslate>
					</p>
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
