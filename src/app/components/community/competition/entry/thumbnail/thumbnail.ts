import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { Game } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { AppState, AppStore } from '../../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { CommunityCompetitionEntryModal } from '../modal/modal.service';

@Component({
	components: {
		AppGameThumbnailImg,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityCompetitionEntryThumbnail extends Vue {
	@Prop(propRequired(CommunityCompetitionEntry)) entry!: CommunityCompetitionEntry;
	@Prop(propOptional(Boolean, false)) showRemove!: boolean;
	@Prop(propOptional(Boolean, false)) showRank!: boolean;
	/** Voting category the rank should be shown from. No voting category means Overall. */
	@Prop(propOptional(CommunityCompetitionVotingCategory))
	votingCategory?: CommunityCompetitionVotingCategory;
	@Prop(propOptional(Boolean, false)) showAwards!: boolean;

	@AppState
	user!: AppStore['user'];

	@Emit('remove')
	emitRemove() {}

	get shouldShowRemove() {
		return this.showRemove && this.user && this.user.id === this.entry.user.id;
	}

	get game() {
		return this.entry.resource as Game;
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
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this entry from the jam?`)
		);

		if (result) {
			await this.entry.$remove();
			if (this.entry._removed) {
				Growls.success(this.$gettext(`Your entry was successfully removed from the jam.`));
				this.emitRemove();
			}
		}
	}

	/** Instead of navigating to the link target, open the entry modal instead. */
	onClickThumbnail() {
		CommunityCompetitionEntryModal.showEntry(this.$router, this.entry);
	}
}
