<template>
	<div
		id="shell-sidebar"
		class="shell-pane shell-pane-left"
		:class="{ visible: isLeftPaneVisible }"
		v-shortkey="['m']"
		@shortkey="toggleLeftPane()"
	>
		<app-scroll-scroller v-if="isLeftPaneVisible" class="-content fill-darkest" overlay>
			<ul v-if="Screen.isXs" class="shell-nav">
				<li v-if="app.user" class="offline-disable">
					<router-link
						:to="{ name: 'discover.home' }"
						active-class="active"
						v-app-track-event="`sidebar:discover`"
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
						:to="{ name: 'search.results' }"
						:class="{ active: $route.name.indexOf('search') === 0 }"
						v-app-track-event="`sidebar:search`"
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
						:to="{ name: 'library.installed' }"
						active-class="active"
						v-app-track-event="`sidebar:collection:installed`"
					>
						<span class="shell-nav-icon">
							<app-jolticon icon="download-box" />
						</span>
						<span class="shell-nav-label">
							<translate>Installed Games</translate>
						</span>
					</router-link>
				</li>

				<li class="offline-disable" v-if="developerCollection">
					<router-link
						:to="developerCollection.routeLocation"
						active-class="active"
						v-app-track-event="`sidebar:collection:developer`"
					>
						<span class="shell-nav-icon">
							<app-jolticon icon="user" />
						</span>
						<span class="shell-nav-label">
							<translate>library.nav.developer</translate>
						</span>
					</router-link>
				</li>

				<li class="offline-disable" v-if="followedCollection && !Screen.isXs">
					<router-link
						:to="followedCollection.routeLocation"
						active-class="active"
						v-app-track-event="`sidebar:collection:followed`"
					>
						<span class="shell-nav-icon">
							<app-jolticon icon="subscribe" />
						</span>
						<span class="shell-nav-label">
							<translate>library.nav.followed</translate>
						</span>
					</router-link>
				</li>

				<li class="offline-disable" v-if="ownedCollection && !Screen.isXs">
					<router-link
						:to="ownedCollection.routeLocation"
						active-class="active"
						v-app-track-event="`sidebar:collection:owned`"
					>
						<span class="shell-nav-icon">
							<app-jolticon icon="heart" />
						</span>
						<span class="shell-nav-label">
							<translate>Owned Games</translate>
						</span>
					</router-link>
				</li>
			</ul>

			<ul v-if="Screen.isXs" class="shell-nav">
				<li class="offline-disable">
					<router-link
						:to="{ name: 'forums.landing.overview' }"
						:class="{ active: $route.name.indexOf('forums') === 0 }"
						v-app-track-event="`sidebar:forums`"
					>
						<span class="shell-nav-icon">
							<app-jolticon icon="forums" />
						</span>
						<span class="shell-nav-label">
							<translate>Forums</translate>
						</span>
					</router-link>
				</li>

				<li class="offline-disable">
					<a :href="Environment.jamsBaseUrl" target="_blank" v-app-track-event="`sidebar:jams`">
						<span class="shell-nav-icon">
							<app-jolticon icon="jams" />
						</span>
						<span class="shell-nav-label">
							<translate>Jams</translate>
						</span>
					</a>
				</li>
			</ul>

			<template v-if="app.user">
				<template v-if="bundleCollections.length">
					<div class="nav-heading">
						<translate>library.nav.bundles</translate>
						<span class="badge">
							{{ bundleCollections.length | number }}
						</span>
					</div>

					<ul class="shell-nav">
						<li
							class="offline-disable"
							v-for="bundleCollection of filteredBundleCollections"
							:key="bundleCollection._id"
						>
							<router-link
								:to="bundleCollection.routeLocation"
								active-class="active"
								v-app-track-event="`sidebar:collection:bundle`"
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

				<!--
				Playlists
			-->
				<template v-if="isLibraryBootstrapped">
					<div class="nav-heading" :title="$gettext(`library.nav.playlists`)">
						<translate>library.nav.playlists</translate>
						<span class="badge">
							{{ collections.length | number }}
						</span>
					</div>

					<div class="nav-controls">
						<app-button
							primary
							block
							class="offline-disable"
							@click="showAddPlaylistModal"
							v-app-track-event="`sidebar:playlist-add`"
						>
							<translate>library.nav.new_playlist_button</translate>
						</app-button>
					</div>

					<div class="nav-controls" v-if="collections.length > 0">
						<input
							type="search"
							class="form-control"
							:placeholder="$gettext(`library.nav.filter_playlists_placeholder`)"
							v-model="playlistFilterQuery"
						/>
					</div>
					<div class="alert fill-gray" v-else>
						<div v-translate>library.nav.no_playlists_html</div>
					</div>

					<!--
					Playlist Folders
				-->
					<div v-for="(folder, key) of playlistFolders" :key="key" v-if="key !== 'main'">
						<ul class="shell-nav">
							<li class="offline-disable">
								<a @click="toggleFolder(key)">
									<span class="shell-nav-icon">
										<app-jolticon
											:icon="openFolders.indexOf(key) === -1 ? 'folder' : 'folder-open'"
										/>
									</span>
									{{ folder.title }}
								</a>
								<app-expand :when="openFolders.indexOf(key) !== -1">
									<app-shell-sidebar-collection-list
										:collections="folder.collections"
										:filter="playlistFilterQuery"
										:should-sort="key === 'developers'"
									/>
								</app-expand>
							</li>
						</ul>
					</div>

					<!--
					Main Playlists (not in folders)
				-->
					<app-shell-sidebar-collection-list
						:collections="playlistFolders.main.collections"
						:filter="playlistFilterQuery"
					/>
				</template>
			</template>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

#shell-sidebar
	hr
		margin: $line-height-computed 15px

	.tag
		margin-top: 15px

	.alert
		border-radius: 0

.-content
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	padding: $line-height-computed 0
</style>

<script lang="ts" src="./sidebar" />
