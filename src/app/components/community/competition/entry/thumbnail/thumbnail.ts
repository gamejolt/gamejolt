import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
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
		CommunityCompetitionEntryModal.showEntry(this.entry);
	}
}
