import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppLinkExternal extends Vue {
	@Prop(Boolean)
	targetSelf!: boolean;

	get target() {
		if (this.targetSelf) {
			return '_self';
		}
		return '_blank';
	}
}
