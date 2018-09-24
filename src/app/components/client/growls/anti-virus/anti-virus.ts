import View from '!view!./anti-virus.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
		AppExpand,
	},
})
export class AppClientGrowlAntiVirus extends Vue {
	@Prop(String)
	title!: string;

	moreInfo = false;

	toggleMoreInfo() {
		this.moreInfo = !this.moreInfo;
	}
}
