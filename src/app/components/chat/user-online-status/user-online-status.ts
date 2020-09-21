import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';

@Component({})
export default class AppChatUserOnlineStatus extends Vue {
	@Prop(propRequired(Boolean)) isOnline!: boolean;
	@Prop(propOptional(Number, null)) size!: number | null;

	get outerSize() {
		if (!this.size || typeof this.size !== 'number') {
			return '12px';
		}

		return this.size + 'px';
	}

	get innerSize() {
		if (!this.size || typeof this.size !== 'number') {
			return '4px';
		}

		return Math.ceil(this.size / 3) + 'px';
	}
}
