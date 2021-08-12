import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Model } from '../../model/model.service';
import { copyShareLink, ShareProvider } from '../share.service';
import { ShareModal } from './_modal/modal.service';
import AppShareCardTile from './_tile/tile.vue';

@Component({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCard extends Vue {
	@Prop({ type: Model, required: true })
	model!: Model;

	@Prop({ type: String, required: true })
	url!: string;

	@Prop({ type: Boolean, required: false, default: false })
	hideHeading!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	bleedPadding!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	offsetColor!: boolean;

	readonly providers: ShareProvider[] = ['facebook', 'twitter'];

	openShareModal() {
		ShareModal.show({
			model: this.model,
			url: this.url,
		});
	}

	copyLink() {
		copyShareLink(this.url, this.model);
	}
}
