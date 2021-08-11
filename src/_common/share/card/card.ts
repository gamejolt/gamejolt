import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
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
	@Prop({ required: true, type: String }) url!: string;
	@Prop({ required: false, type: Boolean, default: false }) hideHeading!: boolean;

	readonly Providers = Providers;

	openShareModal() {
		ShareModal.show({
			model: this.model,
			url: this.url,
		});
	}

	copyLink() {
		return AppShareCard.copyLink(this.url);
	}

	static copyLink(url: string) {
		Clipboard.copy(url);
	}
}
