<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppLoading,
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip,
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
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Choose a game to link</translate>
			</h2>
		</div>
		<div class="modal-body">
			<template v-if="games.length">
				<div v-for="game of games" :key="game.id" class="-game">
					<div class="-game-thumb">
						<app-game-thumbnail-img :game="game" />
					</div>

					<div class="-game-label">
						<div class="-game-title">{{ game.title }}</div>
						<div v-if="!game.isVisible" class="-game-hidden">
							<span
								v-app-tooltip.bottom="
									$gettext(`Unlisted games do not show in the community sidebar.`)
								"
							>
								<translate>Unlisted</translate>
							</span>
						</div>
					</div>

					<div class="-game-button">
						<app-button primary @click="onClickLink(game)">
							<translate>Link</translate>
						</app-button>
					</div>
				</div>
			</template>
			<div v-else-if="!isLoading" class="page-help">
				<p>
					<translate>
						You have no more games available to link. Just remember, games can only be
						linked to a single community.
					</translate>
				</p>
			</div>

			<app-loading v-if="isLoading" centered />
			<template v-else-if="!lastPage">
				<div class="page-cut">
					<app-button @click="onClickLoadMore">
						<translate>Load More</translate>
					</app-button>
				</div>
			</template>
		</div>
	</app-modal>
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
