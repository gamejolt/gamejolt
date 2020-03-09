import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';

@Component({
	components: {
		AppUserFollowWidget,
		AppExpand,
	},
})
export default class AppEventItemControlsUserFollow extends Vue {
	@Prop(propRequired(FiresidePost))
	post!: FiresidePost;

	@Prop(propOptional(Boolean, false))
	shouldShow!: boolean;

	readonly Screen = Screen;

	@Emit('close')
	emitClose() {}
}
