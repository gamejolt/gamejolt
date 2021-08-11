import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../modal/base';
import { Model } from '../../../model/model.service';
import AppShareCard from '../card';
import { ShareCardProvider } from '../_tile/tile';
import AppShareCardTile from '../_tile/tile.vue';

@Component({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCardModal extends BaseModal {
	@Prop({ required: true, type: Model }) model!: Model;
	@Prop({ required: true, type: String }) url!: string;

	readonly Providers: ShareCardProvider[] = [
		'facebook',
		'twitter',
		'email',
		'sms',
		'fb_messenger',
		'whatsapp',
		'reddit',
	];

	copyLink() {
		return AppShareCard.copyLink(this.url);
	}
}
