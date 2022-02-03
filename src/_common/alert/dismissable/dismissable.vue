<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppExpand from '../../expand/AppExpand.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';

const STORAGE_KEY_PREFIX = 'dismiss-alert:';

@Options({
	components: {
		AppExpand,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppAlertDismissable extends Vue {
	@Prop(String) alertType!: string;
	@Prop({ type: String, default: null }) dismissKey!: string | null;
	@Prop(Boolean) noMargin?: boolean;
	@Prop(String) dismissTooltip?: string;

	shouldShow = false;

	@Emit('dismiss')
	emitDismiss() {}

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

		this.emitDismiss();
	}
}
</script>

<template>
	<AppExpand :when="shouldShow">
		<div class="alert sans-margin-bottom" :class="`alert-${alertType}`">
			<a v-app-tooltip="dismissTooltip" class="alert-dismiss" @click="dismiss">
				<AppJolticon icon="remove" />
			</a>
			<div class="alert-content">
				<slot />
			</div>
		</div>
		<br v-if="!noMargin" />
	</AppExpand>
</template>
