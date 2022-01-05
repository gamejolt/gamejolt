import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../modal/base';
import AppAuthJoin from './join/join.vue';

@Options({
	components: {
		AppAuthJoin,
	},
})
export default class AppAuthModal extends mixins(BaseModal) {}
