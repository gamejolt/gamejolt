<script lang="ts" setup>
import { PropType, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../api/api.service';
import AppButton from '../../../../button/AppButton.vue';
import { GameModel } from '../../../../game/game.model';
import AppGameThumbnail from '../../../../game/thumbnail/AppGameThumbnail.vue';
import AppGameThumbnailImg from '../../../../game/thumbnail/AppGameThumbnailImg.vue';
import { showErrorGrowl } from '../../../../growls/growls.service';
import AppLoading from '../../../../loading/AppLoading.vue';
import AppModal from '../../../../modal/AppModal.vue';
import { useModal } from '../../../../modal/modal.service';
import { $gettext } from '../../../../translate/translate.service';
import { CommunityCompetitionModel } from '../../competition.model';
import { CommunityCompetitionEntryModel } from '../entry.model';

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
});

const { competition } = toRefs(props);

const modal = useModal()!;

const games = ref<GameModel[]>([]);
const isLoading = ref(true);
const selectedGame = ref<GameModel | null>(null);
const isSubmitting = ref(false);

onMounted(() => {
	loadGames();
});

async function loadGames() {
	isLoading.value = true;

	const payload = await Api.sendRequest(
		`/web/communities/competitions/entries/list-games/${competition.value.id}`
	);

	if (payload.games) {
		games.value = GameModel.populate(payload.games);
	}

	isLoading.value = false;
}

function onClickSelectGame(game: GameModel) {
	selectedGame.value = game;
}

async function onClickSubmit() {
	if (!selectedGame.value || isSubmitting.value) {
		return;
	}

	isSubmitting.value = true;

	try {
		const payload = await Api.sendRequest(
			`/web/communities/competitions/entries/submit-game/${competition.value.id}/${selectedGame.value.id}`,
			{},
			{
				noErrorRedirect: true,
			}
		);

		if (payload.success) {
			const entry = new CommunityCompetitionEntryModel(payload.entry);
			modal.resolve(entry);
		} else {
			console.error(payload);
			throw new Error('Payload error');
		}
	} catch (error) {
		showErrorGrowl($gettext(`Could not submit your game to the jam :(`));

		// Reset modal, try again?
		selectedGame.value = null;
		games.value = [];
		loadGames();
	}

	isSubmitting.value = false;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">{{ $gettext(`Choose a game to submit`) }}</h2>
		</div>
		<div class="modal-body">
			<AppLoading v-if="isLoading" centered />
			<template v-else-if="selectedGame">
				<AppGameThumbnail :game="selectedGame" class="-game-thumb-selected" hide-pricing />
				<p class="help-block">
					{{
						$gettext(`Before submitting, make sure that you have read and understood the rules of
						the jam.`)
					}}
				</p>
				<AppButton solid primary @click="onClickSubmit">
					{{ $gettext(`Submit`) }}
				</AppButton>
			</template>
			<template v-else-if="games.length">
				<div v-for="game of games" :key="game.id" class="-game">
					<div class="-game-thumb">
						<AppGameThumbnailImg :game="game" />
					</div>

					<div class="-game-label">
						<div class="-game-title">{{ game.title }}</div>
					</div>

					<div class="-game-button">
						<AppButton primary @click="onClickSelectGame(game)">
							{{ $gettext(`Select`) }}
						</AppButton>
					</div>
				</div>
			</template>
			<div v-else class="alert">
				<p>{{ $gettext(`You have no games available to be submitted.`) }}</p>
				<p v-translate>
					To enter a game into the jam, upload it to Game Jolt first,
					<b>make sure it is published</b>, then return to this page.
				</p>
				<AppButton :to="{ name: 'dash.games.add' }">
					{{ $gettext(`Add Game`) }}
				</AppButton>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
$-v-padding = 15px
$-h-padding = 20px
$-height = 44px

.-game
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: center
	padding: $-v-padding 0
	height: $-height + $-v-padding * 2
	overflow: hidden
	border-bottom-width: $border-width-small
	border-bottom-style: solid

	&:last-child
		border-bottom: 0

	&-thumb
		flex: none
		width: $-height * 2
		margin-right: $-h-padding

		&-selected
			margin-bottom: 0 !important
			max-width: 300px

	&-label
		flex: auto
		overflow: hidden

	&-title
	&-hidden
		text-overflow()

	&-title
		font-weight: bold

	&-button
		flex: none
		margin-left: $-h-padding

.-back
	display: inline-block
	margin-bottom: 12px
	cursor: pointer

	*
		vertical-align: middle
</style>
