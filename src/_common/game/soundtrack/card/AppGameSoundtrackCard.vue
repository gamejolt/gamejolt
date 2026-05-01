<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';

import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import AppAudioPlaylist from '~common/audio/playlist/AppAudioPlaylist.vue';
import AppButton from '~common/button/AppButton.vue';
import AppCard from '~common/card/AppCard.vue';
import { BaseUrl } from '~common/environment/environment.service';
import { formatNumber } from '~common/filters/number';
import { GameModel } from '~common/game/game.model';
import { GameSongModel } from '~common/game/song/song.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Navigate } from '~common/navigate/navigate.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

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
		Navigate.gotoExternal(BaseUrl + router.resolve(location).href.substr(1));
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
					ref="playlist"
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
