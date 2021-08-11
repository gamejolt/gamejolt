import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppActivityFeedPostBlocked extends Vue {
	@Prop({ type: String, required: true })
	username!: string;

	@Emit('show') show() {}
}
