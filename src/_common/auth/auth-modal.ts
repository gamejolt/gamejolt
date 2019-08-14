import { Component } from 'vue-property-decorator';
import AppJolticon from '../jolticon/jolticon.vue';
import { BaseModal } from '../modal/base';
import AppAuthJoin from './join/join.vue';

@Component({
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
export default class AppAuthModal extends BaseModal {}
