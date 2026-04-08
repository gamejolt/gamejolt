<script lang="ts" setup>
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { computed, onMounted, ref } from 'vue';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { vAppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { stringSort } from '../../../../utils/array';
import { fuzzysearch } from '../../../../utils/string';
import {
	libraryAddGameToPlaylist,
	libraryNewPlaylist,
	libraryRemoveGameFromPlaylist,
	useLibraryStore,
} from '../../../store/library';

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const libraryStore = useLibraryStore();

const playlists = ref<GamePlaylistModel[]>([]);
const playlistsWithGame = ref<number[]>([]);
const isLoading = ref(true);
const filterQuery = ref('');

const filteredPlaylists = computed(() => {
	return playlists.value
		.filter(item => fuzzysearch(filterQuery.value.toLowerCase(), item.name.toLowerCase()))
		.sort((a, b) => stringSort(a.name, b.name));
});

onMounted(() => {
	fetchPlaylists();
	Analytics.trackEvent('add-to-playlist', 'open');
});

function close() {
	Popper.hideAll();
}

async function fetchPlaylists() {
	const response = await GamePlaylistModel.fetchPlaylists({
		gameId: game.id,
	});

	playlists.value = response.playlists;
	playlistsWithGame.value = response.playlistsWithGame;
	isLoading.value = false;
}

function selectPlaylist(playlist: GamePlaylistModel) {
	if (playlistsWithGame.value.indexOf(playlist.id) === -1) {
		addToPlaylist(playlist);
		Analytics.trackEvent('add-to-playlist', 'add-game');
	} else {
		removeFromPlaylist(playlist);
		Analytics.trackEvent('add-to-playlist', 'remove-game');
	}
}

async function addToPlaylist(playlist: GamePlaylistModel) {
	if (await libraryAddGameToPlaylist(libraryStore, playlist, game)) {
		playlistsWithGame.value.push(playlist.id);
	}
}

async function removeFromPlaylist(playlist: GamePlaylistModel) {
	if (await libraryRemoveGameFromPlaylist(libraryStore, playlist, game)) {
		const index = playlistsWithGame.value.indexOf(playlist.id);
		if (index !== -1) {
			playlistsWithGame.value.splice(index, 1);
		}
	}
}

async function addToNewPlaylist() {
	const collection = await libraryNewPlaylist(libraryStore);
	if (collection && collection.playlist) {
		addToPlaylist(collection.playlist);
	}
}
</script>

<template>
	<div class="add-to-playlist-popover">
		<AppLoading v-if="isLoading" :centered="true" />
		<template v-else>
			<div class="list-group list-group-dark">
				<a class="list-group-item has-icon" @click="addToNewPlaylist">
					<AppJolticon icon="add" />
					<AppTranslate>New Playlist</AppTranslate>
				</a>
				<div v-if="playlists.length" class="list-group-item">
					<input
						v-model="filterQuery"
						v-app-focus-when
						type="search"
						class="form-control"
						:placeholder="$gettext('Filter playlists...')"
						@keydown.esc.stop="close"
					/>
				</div>
			</div>
			<div
				v-if="playlists.length"
				class="list-group list-group-dark thin add-to-playlist-popover-playlists"
			>
				<a
					v-for="playlist of filteredPlaylists"
					:key="playlist.id"
					class="list-group-item has-icon"
					:class="
						playlistsWithGame.indexOf(playlist.id) === -1
							? 'playlist-no-game'
							: 'playlist-has-game'
					"
					@click="selectPlaylist(playlist)"
				>
					<AppJolticon icon="playlist" />
					<AppJolticon icon="check" />
					<AppJolticon icon="remove" />
					<AppJolticon icon="add" />
					{{ playlist.name }}
				</a>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.add-to-playlist-popover
	.loading
		margin-top: $line-height-computed

	.list-group
		margin-bottom: 0 !important

	&-playlists
		.jolticon
			display: none

		.list-group-item
			&.playlist-no-game
				.jolticon-playlist
					display: inline-block

				&:hover
					.jolticon-playlist
						display: none

					.jolticon-add
						theme-prop('color', 'highlight')
						display: inline-block

			&.playlist-has-game
				.jolticon-check
					theme-prop('color', 'highlight')
					display: inline-block

				&:hover
					.jolticon-check
						display: none

					.jolticon-remove
						theme-prop('color', 'notice')
						display: inline-block
</style>
