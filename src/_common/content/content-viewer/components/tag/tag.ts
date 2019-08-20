import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppContentViewerTag extends Vue {
	@Prop(String)
	tag!: string;

	get url() {
		const searchTerm = encodeURIComponent(`#${this.tag}`);
		return `/search?q=${searchTerm}`;
	}
}
