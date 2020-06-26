import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppBlockedNotice extends Vue {
	@Prop(propRequired(Community)) community!: Community;

	get communityBlockReason() {
		if (!this.community.user_block) {
			return '';
		}

		const reason = this.community.user_block.reason;
		const reasons = {
			spam: this.$gettext('Spam'),
			'off-topic': this.$gettext('Off Topic'),
			abuse: this.$gettext('Offensive or insulting'),
			other: this.$gettext('Other'),
		} as { [reason: string]: string };
		if (reasons[reason]) {
			return reasons[reason];
		}
		return reason;
	}
}
