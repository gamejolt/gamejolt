import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppEventItemMediaTags extends Vue {
	@Prop(Boolean)
	gif?: boolean;
}
