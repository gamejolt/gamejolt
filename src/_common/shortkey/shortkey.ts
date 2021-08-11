import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Shortkeys } from './shortkey-service';

@Options({})
export default class AppShortkey extends Vue {
	@Prop(String)
	shortkey!: string;

	@Emit('press')
	emitPress(e: KeyboardEvent) {}

	mounted() {
		this.callback = this.callback.bind(this);
		Shortkeys.register(this.shortkey, this.callback);
	}

	destroyed() {
		Shortkeys.unregister(this.shortkey, this.callback);
	}

	callback(e: KeyboardEvent) {
		this.emitPress(e);
	}
}
