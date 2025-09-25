<script lang="ts" setup>
import { ref, watch } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import AppAudioPlaylist from '../../../audio/playlist/AppAudioPlaylist.vue';
import AppButton from '../../../button/AppButton.vue';
import AppCard from '../../../card/AppCard.vue';
import { Environment } from '../../../environment/environment.service';
import { formatNumber } from '../../../filters/number';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import { Navigate } from '../../../navigate/navigate.service';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { GameModel } from '../../game.model';
import { GameSongModel } from '../../song/song.model';

type Props = {
	game: GameModel;
	songs: GameSongModel[];
};

const { game, songs } = defineProps<Props>();

const router = useRouter();

const isPlaying = ref(false);
const isShowingSoundtrack = ref(false);
const canToggleSoundtrack = ref(false);

watch(isPlaying, () => {
	// If we're playing, make sure the full soundtrack is open.
	if (isPlaying.value) {
		isShowingSoundtrack.value = true;
	}
});

function download() {
	const location: RouteLocationRaw = {
		name: 'download',
		params: {
			type: 'soundtrack',
		},
		query: { game: game.id + '' },
	};

	if (GJ_IS_DESKTOP_APP) {
		// Gotta go past the first char since it's # in client.
		Navigate.gotoExternal(Environment.baseUrl + router.resolve(location).href.substr(1));
		return;
	}

	router.push(location);
}
</script>

<template>
	<AppCard class="soundtrack-package-card">
		<div class="card-title">
			<h4>
				<AppTranslate>Game Soundtrack</AppTranslate>
				<AppJolticon icon="musical-note-double" big class="pull-right text-muted" />
			</h4>
		</div>

		<div class="card-meta">
			<AppTranslate
				:translate-n="songs.length"
				:translate-params="{ count: formatNumber(songs.length) }"
				translate-plural="%{ count } songs"
			>
				%{ count } song
			</AppTranslate>
		</div>

		<br />

		<div class="card-content">
			<AppFadeCollapse
				:collapse-height="250"
				:is-open="isShowingSoundtrack"
				@require-change="canToggleSoundtrack = $event"
				@expand="isShowingSoundtrack = true"
			>
				<AppAudioPlaylist
					:songs="songs"
					@play="isPlaying = true"
					@stop="isPlaying = false"
				/>
			</AppFadeCollapse>
		</div>

		<a
			v-if="canToggleSoundtrack"
			class="hidden-text-expander"
			@click="isShowingSoundtrack = !isShowingSoundtrack"
		/>

		<div class="card-controls">
			<AppButton primary @click="download">
				<AppTranslate>Download</AppTranslate>
				<AppJolticon icon="musical-note-double" class="jolticon-addon" />
			</AppButton>
		</div>
	</AppCard>
</template>
