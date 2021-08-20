import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../modal/base';
import { copyShareLink, ShareProvider, ShareResource } from '../../share.service';
import AppShareCardTile from '../_tile/tile.vue';

@Component({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCardModal extends BaseModal {
	@Prop({ type: String, required: true })
	resource!: ShareResource;

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
		copyShareLink(this.url, this.resource);
	}
}
