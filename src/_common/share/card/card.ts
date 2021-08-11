import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import VueRouter, { Location } from 'vue-router';
import { getShareableLink } from '../../../utils/router';
import { Clipboard } from '../../clipboard/clipboard-service';
import { Model } from '../../model/model.service';
import { ShareModal } from './_modal/modal.service';
import { ShareCardProvider } from './_tile/tile';
import AppShareCardTile from './_tile/tile.vue';

const Providers: ShareCardProvider[] = ['facebook', 'twitter'];
@Component({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCard extends Vue {
	@Prop({ required: true, type: Model }) model!: Model;
	@Prop({ required: true, type: Location }) location!: Location;
	@Prop({ required: false, type: Boolean, default: false }) hideHeading!: boolean;

	readonly Providers = Providers;

	get url() {
		return getShareableLink(this.$router, this.location);
	}

	openShareModal() {
		ShareModal.show({
			model: this.model,
			location: this.location,
		});
	}

	copyLink() {
		return AppShareCard.copyLink(this.$router, this.location);
	}

	static copyLink(router: VueRouter, location: Location) {
		Clipboard.copy(getShareableLink(router, location));
	}
}
