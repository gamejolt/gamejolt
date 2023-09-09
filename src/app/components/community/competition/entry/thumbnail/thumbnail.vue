<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { GameModel } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { showEntryFromCommunityCompetitionEntryModal } from '../modal/modal.service';

@Options({
	components: {
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppCommunityCompetitionEntryThumbnail extends Vue {
	@Prop({ type: Object, required: true }) entry!: CommunityCompetitionEntryModel;
	@Prop({ type: Boolean, default: false }) showRemove!: boolean;
	@Prop({ type: Boolean, default: false }) showRank!: boolean;
	/** Voting category the rank should be shown from. No voting category means Overall. */
	@Prop(Object)
	votingCategory?: CommunityCompetitionVotingCategoryModel;
	@Prop({ type: Boolean, default: false }) showAwards!: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	@Emit('remove')
	emitRemove() {}

	get shouldShowRemove() {
		return this.showRemove && this.user && this.user.id === this.entry.user.id;
	}

	get game() {
		return this.entry.resource as GameModel;
	}

	get shouldShowRank() {
		if (!this.showRank) {
			return false;
		}

		if (!this.entry.vote_results || this.entry.vote_results.length === 0) {
			return false;
		}

		return !!this.displayRank;
	}

	get shouldShowNoVotes() {
		return (
			this.showRank &&
			!this.votingCategory &&
			(!this.entry.vote_results || this.entry.vote_results.length === 0)
		);
	}

	get displayRank() {
		// Find the result for the given category.
		const categoryId = this.votingCategory ? this.votingCategory.id : null;
		const voteResult = this.entry.vote_results.find(
			i => i.community_competition_voting_category_id === categoryId
		);
		if (voteResult) {
			return voteResult.rank;
		}
	}

	get displayCategoryName() {
		if (this.votingCategory) {
			return this.votingCategory.name;
		}

		return this.$gettext(`Overall`);
	}

	get hasAwards() {
		return this.entry.awards && this.entry.awards.length > 0;
	}

	get shouldShowAwards() {
		return this.showAwards && this.hasAwards;
	}

	async onClickRemove() {
		const result = await showModalConfirm(
			this.$gettext(`Are you sure you want to remove this entry from the jam?`)
		);

		if (result) {
			await this.entry.$remove();
			if (this.entry._removed) {
				showSuccessGrowl(
					this.$gettext(`Your entry was successfully removed from the jam.`)
				);
				this.emitRemove();
			}
		}
	}

	/** Instead of navigating to the link target, open the entry modal instead. */
	onClickThumbnail() {
		showEntryFromCommunityCompetitionEntryModal(this.entry);
	}
}
</script>

<template>
	<div class="-container">
		<router-link :to="game.routeLocation">
			<div @click.prevent="onClickThumbnail">
				<div class="-thumb">
					<AppGameThumbnailImg :game="game" class="-game-img" />

					<div v-if="shouldShowAwards" class="-game-img-award-border" />

					<div class="-inner">
						<div v-if="shouldShowRank" class="-rank">
							{{ displayCategoryName }}
							<AppTranslate>Rank</AppTranslate>
							<b>#{{ displayRank }}</b>
						</div>
						<div v-else-if="shouldShowNoVotes" class="-rank">
							<AppTranslate>No Votes</AppTranslate>
						</div>
						<div v-if="shouldShowRemove" class="-remove">
							<AppButton
								v-app-tooltip="$gettext(`Remove Entry`)"
								icon="remove"
								sparse
								circle
								overlay
								@click.stop.prevent="onClickRemove"
							/>
						</div>
					</div>
				</div>
				<div class="-meta">
					<div class="-title-data">
						<span class="-title" :title="game.title">
							<b>{{ game.title }}</b>
						</span>
					</div>
					<div class="-author-data">
						<span
							v-translate="{ name: entry.user.display_name }"
							class="text-muted -author"
						>
							by %{ name }
						</span>
					</div>

					<div v-if="shouldShowAwards" class="-award-data">
						<span
							v-for="entryAward of entry.awards"
							:key="entryAward.id"
							v-app-tooltip="entryAward.community_competition_award.description"
							class="-award"
						>
							<AppJolticon class="-award-icon" icon="medal" />
							<small>
								<b>{{ entryAward.community_competition_award.name }}</b>
							</small>
						</span>
					</div>
				</div>
			</div>
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	margin-bottom: 24px

.-thumb
	position: relative
	rounded-corners-lg()

	&:hover
		.-rank
			opacity: 0.25

		.-game-img
			elevate-2()

.-game-img
	elevate-0()
	z-index: 2

.-game-img-award-border
	z-index: 1
	position: absolute
	left: -($border-width-large)
	top: -($border-width-large)
	bottom: -($border-width-large)
	right: -($border-width-large)
	background-color: var(--theme-bi-bg)
	rounded-corners-lg()

.-inner
	position: absolute
	z-index: 3
	rounded-corners-lg()
	overflow: hidden
	top: 0
	left: 0
	right: 0
	bottom: 0

.-rank
	position: absolute
	background-color: rgba(0, 0, 0, 0.5)
	backdrop-filter: blur(3px)
	color: white
	bottom: 0
	left: 0
	right: 0
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 8px
	padding-right: 8px
	transition: opacity 0.1s ease

.-remove
	position: absolute
	right: 8px
	top: 8px

.-meta
	padding: 4px

.-title-data
	display: flex

.-title
	font-size: $font-size-large
	transition: color 0.1s ease
	text-overflow()

.-author-data
	display: flex

.-author
	text-overflow()

.-award-data
	display: flex
	flex-direction: column
	align-items: flex-start

.-award
	change-bg('bi-bg')
	width: auto
	color: var(--theme-bi-fg)
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 12px
	padding-right: 12px
	display: inline-flex
	rounded-corners()
	margin-top: 4px

	&-icon
		display: inline-block
		margin-right: 8px
</style>
