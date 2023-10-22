<script lang="ts" setup>
import { PropType, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
});

const { community } = toRefs(props);
const modal = useModal()!;
const page = ref(1);
const isLoading = ref(true);
const lastPage = ref(false);
const games = ref<GameModel[]>([]);

onMounted(() => {
	loadPage();
});

async function loadPage() {
	isLoading.value = true;

	try {
		const payload = await Api.sendRequest(
			'/web/dash/communities/games/list/' + community.value.id + '?page=' + page.value,
			undefined,
			{ noErrorRedirect: true }
		);

		const games = GameModel.populate(payload.games);
		if (games.length < payload.perPage) {
			lastPage.value = true;
		}
		games.push(...games);
	} catch (error) {
		console.error(error);
		showErrorGrowl($gettext(`Failed to load games.`));
		modal.resolve();
	}

	isLoading.value = false;
}

function onClickLoadMore() {
	page.value++;
	loadPage();
}

function onClickLink(game: GameModel) {
	modal.resolve(game);
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
			<h2 class="modal-title">
				{{ $gettext(`Choose a game to link`) }}
			</h2>
		</div>
		<div class="modal-body">
			<template v-if="games.length">
				<div v-for="game of games" :key="game.id" class="-game">
					<div class="-game-thumb">
						<AppGameThumbnailImg :game="game" />
					</div>

					<div class="-game-label">
						<div class="-game-title">{{ game.title }}</div>
						<div v-if="!game.isVisible" class="-game-hidden">
							<span
								v-app-tooltip.bottom="
									$gettext(`Unlisted games do not show in the community sidebar.`)
								"
							>
								{{ $gettext(`Unlisted`) }}
							</span>
						</div>
					</div>

					<div class="-game-button">
						<AppButton primary @click="onClickLink(game)">
							{{ $gettext(`Link`) }}
						</AppButton>
					</div>
				</div>
			</template>
			<div v-else-if="!isLoading" class="page-help">
				<p>
					{{
						$gettext(`You have no more games available to link. Just remember, games can only be
						linked to a single community.`)
					}}
				</p>
			</div>

			<AppLoading v-if="isLoading" centered />
			<template v-else-if="!lastPage">
				<div class="page-cut">
					<AppButton @click="onClickLoadMore">
						{{ $gettext(`Load More`) }}
					</AppButton>
				</div>
			</template>
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

	&-label
		flex: auto
		overflow: hidden

	&-title
	&-hidden
		text-overflow()

	&-title
		font-weight: bold

	&-hidden
		theme-prop('color', 'fg-muted')
		font-size: $font-size-small

	&-button
		flex: none
		margin-left: $-h-padding
</style>
