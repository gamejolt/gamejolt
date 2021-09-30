import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../../components/fireside/controller/controller';
import { CohostRemoveModal } from './remove-modal.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamRemove extends Vue {
	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	openRemoveModal() {
		CohostRemoveModal.show(this.c);
	}
}
