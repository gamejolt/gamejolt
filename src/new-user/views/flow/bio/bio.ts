import View from '!view!./bio.html?style=./bio.styl';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppFormControlMarkdown } from '../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { FormBio } from '../../../components/forms/bio/bio-form';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowBio',
	components: {
		AppFormControlMarkdown,
		FormBio,
	},
})
export default class RouteFlowBio extends BaseRouteComponent {
	@State
	app!: Store['app'];

	onClickNext() {
		this.$router.push({ name: 'flow.tags' });
	}
}
