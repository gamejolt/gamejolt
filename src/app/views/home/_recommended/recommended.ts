import AppUserFollowWidget from 'game-jolt-frontend-lib/components/user/follow-widget/follow-widget.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppUserList from '../../../components/user/list/list.vue';

@Component({
	components: {
		AppUserAvatar,
		AppUserFollowWidget,
		AppLoading,
		AppUserList,
	},
})
export default class AppHomeRecommended extends Vue {
	@Prop(Array)
	users!: User[];

	@Prop(Boolean)
	loading!: boolean;

	@Emit('refresh')
	emitRefresh() {}
}
