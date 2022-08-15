<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppLoading,
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityLinkGameModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: Community;

	page = 1;
	isLoading = true;
	lastPage = false;
	games: Game[] = [];

	mounted() {
		this.loadPage();
	}

	async loadPage() {
		this.isLoading = true;

		try {
			const payload = await Api.sendRequest(
				'/web/dash/communities/games/list/' + this.community.id + '?page=' + this.page,
				undefined,
				{ noErrorRedirect: true }
			);

			const games = Game.populate(payload.games);
			if (games.length < payload.perPage) {
				this.lastPage = true;
			}
			this.games.push(...games);
		} catch (error) {
			console.error(error);
			showErrorGrowl(this.$gettext(`Failed to load games.`));
			this.modal.resolve();
		}

		this.isLoading = false;
	}

	onClickLoadMore() {
		this.page++;
		this.loadPage();
	}

	onClickLink(game: Game) {
		this.modal.resolve(game);
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Choose a game to link</AppTranslate>
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
								<AppTranslate>Unlisted</AppTranslate>
							</span>
						</div>
					</div>

					<div class="-game-button">
						<AppButton primary @click="onClickLink(game)">
							<AppTranslate>Link</AppTranslate>
						</AppButton>
					</div>
				</div>
			</template>
			<div v-else-if="!isLoading" class="page-help">
				<p>
					<AppTranslate>
						You have no more games available to link. Just remember, games can only be
						linked to a single community.
					</AppTranslate>
				</p>
			</div>

			<AppLoading v-if="isLoading" centered />
			<template v-else-if="!lastPage">
				<div class="page-cut">
					<AppButton @click="onClickLoadMore">
						<AppTranslate>Load More</AppTranslate>
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
