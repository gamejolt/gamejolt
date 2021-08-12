import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../utils/router';
import { ShareModal } from '../../../../_common/share/card/_modal/modal.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { FiresideController, FiresideControllerKey } from '../_controller/controller';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideShareOptions extends Vue {
	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	get fireside() {
		return this.c.fireside;
	}

	get shareUrl() {
		if (!this.fireside) {
			return;
		}

		return getAbsoluteLink(this.$router, this.fireside.location);
	}

	get isDraft() {
		return this.fireside?.is_draft ?? true;
	}

	onClickShare() {
		if (!this.fireside || !this.shareUrl) {
			return;
		}

		ShareModal.show({
			url: this.shareUrl,
			model: this.fireside,
		});
	}
}
