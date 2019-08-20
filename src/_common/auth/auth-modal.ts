import { Component } from 'vue-property-decorator';
import { BaseModal } from '../modal/base';
import AppAuthJoin from './join/join.vue';

@Component({
	components: {
		AppAuthJoin,
	},
})
export default class AppAuthModal extends BaseModal {}
