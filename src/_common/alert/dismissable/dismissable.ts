import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppExpand from '../../expand/expand.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';

const STORAGE_KEY_PREFIX = 'dismiss-alert:';

@Component({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAlertDismissable extends Vue {
	@Prop(String) alertType!: string;
	@Prop(propOptional(String, null)) dismissKey!: string | null;
	@Prop(Boolean) noMargin?: boolean;
	@Prop(propOptional(String)) dismissTooltip?: string;

	shouldShow = false;

	get _key() {
		return STORAGE_KEY_PREFIX + this.dismissKey;
	}

	mounted() {
		if (!this.dismissKey || !window.localStorage.getItem(this._key)) {
			this.shouldShow = true;
		}
	}

	dismiss() {
		if (this.dismissKey) {
			window.localStorage.setItem(this._key, Date.now() + '');
		}
		this.shouldShow = false;

		this.$emit('dismiss');
	}
}
