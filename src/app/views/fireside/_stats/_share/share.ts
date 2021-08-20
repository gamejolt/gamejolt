import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../../utils/router';
import AppCard from '../../../../../_common/card/card.vue';
import { configShareCard } from '../../../../../_common/config/config.service';
import AppShareCard from '../../../../../_common/share/card/card.vue';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { FiresideController, FiresideControllerKey } from '../../_controller/controller';

@Component({
	components: {
		AppShareCard,
		AppCard,
	},
})
export default class AppFiresideShare extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	hideHeading!: boolean;

	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	get useShareCard() {
		return configShareCard.value;
	}

	get fireside() {
		return this.c.fireside;
	}

	get shareUrl() {
		if (!this.fireside) {
			return;
		}
		return getAbsoluteLink(this.$router, this.fireside.location);
	}

	copyShareUrl() {
		if (!this.shareUrl || !this.fireside) {
			return;
		}

		copyShareLink(this.shareUrl, 'fireside');
	}
}
