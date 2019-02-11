import View from '!view!./bio.html?style=./bio.styl';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowBio',
	components: {},
})
export default class RouteFlowBio extends BaseRouteComponent {
	@State
	app!: Store['app'];

	$refs!: {
		input: HTMLTextAreaElement;
	};

	private textInputReceived = false;

	get nextButtonText() {
		if (!this.textInputReceived) {
			return 'Skip';
		}
		const bio = this.app.user!.description_markdown;
		return !!bio && bio.length > 0 ? 'Continue' : 'Skip';
	}

	async onClickNext() {
		if (this.textInputReceived) {
			await this.app.user!.$save();
		}
		this.$router.push({ name: 'flow.tags' });
	}

	onChangeBio() {
		this.app.user!.description_markdown = this.$refs.input.value;
		this.textInputReceived = true;
	}
}
