import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../../components/fireside/controller/controller';
import { CohostInviteModal } from './invite-modal.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamInvite extends Vue {
	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	openInviteModal() {
		CohostInviteModal.show(this.c);
	}
}
