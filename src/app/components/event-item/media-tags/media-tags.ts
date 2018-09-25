import View from '!view!./media-tags.html?style=./media-tags.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppEventItemMediaTags extends Vue {
	@Prop(Boolean)
	gif?: boolean;
}
