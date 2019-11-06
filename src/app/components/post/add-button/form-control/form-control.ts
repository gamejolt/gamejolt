import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppFormControl from '../../../../../_common/form-vue/control/control.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';

@Component({
	components: {
		AppUserAvatarImg,
		AppFormControl,
	},
})
export default class AppPostAddButtonFormControl extends Vue {
	@Prop()
	rules!: any;

	@Prop(String)
	placeholder!: string;

	@Prop(Array) validateOn!: string[];
	@Prop(Number) validateDelay!: number;
	@Prop(Array) mask!: (string | RegExp)[];

	@AppState
	user!: AppStore['user'];
}
