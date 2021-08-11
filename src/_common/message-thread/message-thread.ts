import { Options, Prop, Vue } from 'vue-property-decorator';
import AppTimelineList from '../timeline-list/timeline-list.vue';

@Options({
	components: {
		AppTimelineList,
	},
})
export default class AppMessageThread extends Vue {
	@Prop(Boolean) isNested?: boolean;
}
