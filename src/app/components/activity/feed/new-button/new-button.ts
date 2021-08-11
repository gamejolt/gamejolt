import { Emit, Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppActivityFeedNewButton extends Vue {
	@Emit('click') emitClick(_e: Event) {}
}
