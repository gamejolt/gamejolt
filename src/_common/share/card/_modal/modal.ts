import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
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
	@Prop({ required: true, type: Location }) location!: Location;

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
		return AppShareCard.copyLink(this.$router, this.location);
	}
}
