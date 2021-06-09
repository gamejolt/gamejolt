<script lang="ts" src="./library"></script>

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
						<app-jolticon icon="compass-needle" />
					</span>
					<span class="shell-nav-label">
						<translate>Explore</translate>
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
						<app-jolticon icon="game" />
					</span>
					<span class="shell-nav-label">
						<translate>Store</translate>
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
						<app-jolticon icon="search" />
					</span>
					<span class="shell-nav-label">
						<translate>Search</translate>
					</span>
				</router-link>
			</li>
		</ul>

		<ul v-if="app.user" class="shell-nav">
			<li v-if="GJ_IS_CLIENT">
				<router-link
					v-app-track-event="`sidebar:collection:installed`"
					:to="{ name: 'library.installed' }"
					active-class="active"
				>
					<span class="shell-nav-icon">
						<app-jolticon icon="download-box" />
					</span>
					<span class="shell-nav-label">
						<translate>Installed Games</translate>
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
						<app-jolticon icon="user" />
					</span>
					<span class="shell-nav-label">
						<translate>library.nav.developer</translate>
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
						<app-jolticon icon="subscribe" />
					</span>
					<span class="shell-nav-label">
						<translate>library.nav.followed</translate>
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
						<app-jolticon icon="heart-filled" />
					</span>
					<span class="shell-nav-label">
						<translate>Owned Games</translate>
					</span>
				</router-link>
			</li>
		</ul>

		<ul v-if="Screen.isXs" class="shell-nav">
			<li v-if="shouldShowAppPromotion" class="offline-disable">
				<router-link
					:to="{ name: 'landing.app' }"
					@click.native="trackAppPromotionClick({ source: 'sidebar' })"
				>
					<span class="shell-nav-icon">
						<app-jolticon icon="world" />
					</span>
					<span class="shell-nav-label">
						<translate>Get the App</translate>
					</span>
				</router-link>
			</li>
			<li class="offline-disable">
				<router-link
					v-app-track-event="`sidebar:forums`"
					:to="{ name: 'forums.landing.overview' }"
					:class="{ active: $route.name && $route.name.indexOf('forums') === 0 }"
				>
					<span class="shell-nav-icon">
						<app-jolticon icon="forums" />
					</span>
					<span class="shell-nav-label">
						<translate>Forums</translate>
					</span>
				</router-link>
			</li>
		</ul>

		<template v-if="app.user">
			<template v-if="bundleCollections.length">
				<div class="nav-heading">
					<translate>library.nav.bundles</translate>
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
								<app-jolticon icon="bundle" />
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
					<translate>library.nav.playlists</translate>
					<span class="badge">
						{{ collectionsLength }}
					</span>
				</div>

				<div class="nav-controls">
					<app-button
						v-app-track-event="`sidebar:playlist-add`"
						primary
						block
						class="offline-disable"
						@click="showAddPlaylistModal"
					>
						<translate>library.nav.new_playlist_button</translate>
					</app-button>
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
									<app-jolticon
										:icon="
											openFolders.indexOf(key) === -1
												? 'folder'
												: 'folder-open'
										"
									/>
								</span>
								{{ playlistFolders[key].title }}
							</a>
							<app-expand :when="openFolders.indexOf(key) !== -1">
								<app-shell-sidebar-collection-list
									:collections="playlistFolders[key].collections"
									:filter="playlistFilterQuery"
									:should-sort="key === 'developers'"
								/>
							</app-expand>
						</li>
					</ul>
				</div>

				<!-- Main Playlists (not in folders) -->
				<app-shell-sidebar-collection-list
					:collections="playlistFolders.main.collections"
					:filter="playlistFilterQuery"
				/>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

#shell-sidebar-library
	padding-top: 16px

	.-no-playlists
		margin-left: ($grid-gutter-width-xs / 2)
		margin-right: ($grid-gutter-width-xs / 2)
		background-color: var(--theme-bg-subtle)
</style>
