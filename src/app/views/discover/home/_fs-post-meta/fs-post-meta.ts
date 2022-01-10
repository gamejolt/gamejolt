import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppCommunityOverlayPill from '../_community-overlay-pill/community-overlay-pill.vue';

@Options({
	components: {
		AppUserAvatarImg,
		AppCommunityOverlayPill,
	},
})
export default class AppHomeFsPostMeta extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;
}
