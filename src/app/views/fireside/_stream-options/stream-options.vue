<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/settings-popper.vue';

@Options({
	components: {
		AppFiresideSettingsPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamOptions extends Vue {
	commonStore = setup(() => useCommonStore());

	c = shallowSetup(() => useFiresideController()!);

	get user() {
		return this.commonStore.user;
	}

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onClickStopStreaming() {
		const rtc = this.c.rtc.value;
		if (!rtc?.producer) {
			return;
		}

		stopStreaming(rtc.producer);
	}
}
</script>

<template>
	<div class="-options-wrap">
		<app-fireside-settings-popper @show="emitShowPopper" @hide="emitHidePopper">
			<div class="-options">
				<app-jolticon class="-icon" icon="ellipsis-v" />
			</div>
		</app-fireside-settings-popper>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
