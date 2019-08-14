import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppJolticon from '../../vue/components/jolticon/jolticon.vue'
import AppButton from './button.vue'

@Component({
	components: {
		AppButton,
		AppJolticon,
	},
})
export default class AppButtonStyleguide extends Vue {}
