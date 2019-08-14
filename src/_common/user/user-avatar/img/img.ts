import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { User } from '../../user.model';

@Component({})
export default class AppUserAvatarImg extends Vue {
	@Prop(Object) user?: User;

	hasError = false;
}
