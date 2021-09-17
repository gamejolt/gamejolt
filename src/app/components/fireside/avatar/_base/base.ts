import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';

@Component({
	components: {
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppFiresideAvatarBase extends Vue {
	@Prop({ type: Boolean, required: false, default: false })
	isPlaceholder!: boolean;

	@Prop({ type: Boolean, required: false, default: false })
	isLive!: boolean;

	@Prop({ type: MediaItem, required: false, default: null })
	avatarMediaItem!: MediaItem | null;

	@Prop({ type: Community, required: false, default: null })
	community!: Community | null;

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
