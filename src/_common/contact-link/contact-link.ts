import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../utils/vue';
import { Navigate } from '../navigate/navigate.service';

@Component({})
export default class AppContactLink extends Vue {
	@Prop(propRequired(String)) email!: string;

	onClick() {
		// Sometimes Vue router will break <a> tags that use mailto
		// by replacing part of the current url with the mailto path,
		// so we can instead use 'Navigate.goto(path)' to bypass this.
		Navigate.goto(`mailto:${this.email}`);
	}
}
