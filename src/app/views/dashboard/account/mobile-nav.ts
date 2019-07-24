import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteDashAccountMobileNav extends Vue {
	@State
	app!: Store['app'];

	get shouldShowVerify() {
		if (this.app.user) {
			return this.app.user.canBeVerified;
		}
		return false;
	}
}
