import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import AppExpand from '../../expand/expand.vue'
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue'

const STORAGE_KEY_PREFIX = 'dismiss-alert:';

@Component({
	components: {
		AppExpand,
		AppJolticon,
	},
})
export default class AppAlertDismissable extends Vue {
	@Prop(String) alertType!: string;
	@Prop(String) dismissKey!: string;
	@Prop(Boolean) noMargin?: boolean;

	shouldShow = false;

	get _key() {
		return STORAGE_KEY_PREFIX + this.dismissKey;
	}

	mounted() {
		if (!window.localStorage.getItem(this._key)) {
			this.shouldShow = true;
		}
	}

	dismiss() {
		window.localStorage.setItem(this._key, Date.now() + '');
		this.shouldShow = false;

		this.$emit('dismiss');
	}
}
