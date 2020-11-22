import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { UserTimeout } from '../../../../_common/user/timeout/timeout.model';

@Component({})
export default class AppTimeoutTemplate extends Vue {
	@Prop(propRequired(UserTimeout)) timeout!: UserTimeout;
}
