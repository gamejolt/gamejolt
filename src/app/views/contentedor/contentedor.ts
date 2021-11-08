import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { ContentContext } from '../../../_common/content/content-context';
import AppContentEditor from '../../../_common/content/content-editor/content-editor.vue';

@Component({
	components: {
		AppContentEditor,
	},
})
export default class RouteContentedor extends Vue {
	context: ContentContext = 'fireside-post-article';
	value = '';
}
