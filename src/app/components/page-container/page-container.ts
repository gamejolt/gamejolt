import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppPageContainer extends Vue {
	@Prop(Boolean)
	xl?: number;

	@Prop(Boolean)
	noLeft?: boolean;

	@Prop(Boolean)
	noRight?: boolean;

	get hasLeftColumn() {
		return !this.noLeft && Screen.isLg;
	}

	get hasRightColumn() {
		return !this.noRight;
	}

	get shouldCombineColumns() {
		return !this.noLeft && !Screen.isLg;
	}
}
