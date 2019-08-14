import { Component } from 'vue-property-decorator';

import { BaseModal } from '../modal/base';
import AppAuthJoin from './join/join.vue'
import AppJolticon from '../../vue/components/jolticon/jolticon.vue'

@Component({
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
export default class AppAuthModal extends BaseModal {}
