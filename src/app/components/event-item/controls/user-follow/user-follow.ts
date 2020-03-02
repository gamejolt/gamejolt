import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';

@Component({
	components: {
		AppUserFollowWidget,
	},
})
export default class AppEventItemControlsUserFollow extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	toggleUserFollow!: boolean;
}
