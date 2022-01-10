import { Options, Prop, Vue } from 'vue-property-decorator';
import { copyShareLink, ShareProvider, ShareResource } from '../share.service';
import { ShareModal } from './_modal/modal.service';
import AppShareCardTile from './_tile/tile.vue';

@Options({
	components: {
		AppShareCardTile,
	},
})
export default class AppShareCard extends Vue {
	@Prop({ type: String, required: true })
	resource!: ShareResource;

	@Prop({ type: String, required: true })
	url!: string;

	@Prop({ type: Boolean })
	hideHeading!: boolean;

	@Prop({ type: Boolean })
	bleedPadding!: boolean;

	@Prop({ type: Boolean })
	offsetColor!: boolean;

	readonly providers: ShareProvider[] = ['facebook', 'twitter'];

	openShareModal() {
		ShareModal.show({
			resource: this.resource,
			url: this.url,
		});
	}

	copyLink() {
		copyShareLink(this.url, this.resource);
	}
}
