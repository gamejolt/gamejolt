import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../modal/base';
import { Model } from '../../../model/model.service';
import { copyShareLink, ShareProvider } from '../../share.service';
import AppShareCardTile from '../_tile/tile.vue';

@Component({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCardModal extends BaseModal {
	@Prop({ type: Model, required: true })
	model!: Model;

	@Prop({ type: String, required: true })
	url!: string;

	readonly providers: ShareProvider[] = [
		'facebook',
		'twitter',
		'reddit',
		'whatsapp',
		'fb_messenger',
		'email',
		'sms',
	];

	copyLink() {
		copyShareLink(this.url);
	}
}
