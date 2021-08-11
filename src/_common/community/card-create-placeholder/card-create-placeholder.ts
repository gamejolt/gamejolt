import { Options, Vue } from 'vue-property-decorator';
import AppCommunityAddWidget from '../add-widget/add-widget.vue';

@Options({
	components: {
		AppCommunityAddWidget,
	},
})
export default class AppCommunityCardCreatePlaceholder extends Vue {}
