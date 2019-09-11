import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { Navigate } from '../../navigate/navigate.service';

@Component({})
export default class AppLinkHelp extends Vue {
	@Prop({ type: String, required: true }) page!: string;

	get url() {
		return Environment.helpBaseUrl + '/' + this.page;
	}

	onClick(e: Event) {
		Navigate.newWindow(this.url);
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	}
}
