<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useFiresideController } from '../../../../components/fireside/controller/controller';
import { CohostManageModal } from './manage-modal.service';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideCohostManage extends Vue {
	c = shallowSetup(() => useFiresideController()!);

	openManageModal() {
		CohostManageModal.show(this.c);
	}
}
</script>

<template>
	<div class="-options-wrap">
		<div
			v-app-tooltip="$gettext('Invite to Stream / Voice Chat')"
			class="-options"
			@click="openManageModal"
		>
			<AppJolticon class="-icon" icon="add" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../common'
</style>
