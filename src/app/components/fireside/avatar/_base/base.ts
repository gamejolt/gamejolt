import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppFiresideAvatarBase extends Vue {
	@Prop({ type: Boolean })
	isPlaceholder!: boolean;

	@Prop({ type: Boolean })
	isLive!: boolean;

	@Prop({ type: Object, default: null })
	avatarMediaItem!: MediaItem | null;

	@Prop({ type: Object, default: null })
	community!: Community | null;

	@Prop({ type: String, default: null })
	borderStyle!: 'dashed' | null;

	get hasTag() {
		if (this.isPlaceholder) {
			return true;
		}
		return !!this.$slots.tag;
	}

	get hasTitle() {
		if (this.isPlaceholder) {
			return true;
		}
		return !!this.$slots.title;
	}

	get hasLink() {
		if (this.isPlaceholder) {
			return false;
		}
		return !!this.$slots.link;
	}
}
