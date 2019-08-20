import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Shortkeys } from './shortkey-service';

@Component({})
export default class AppShortkey extends Vue {
	@Prop(String)
	shortkey!: string;

	mounted() {
		this.callback = this.callback.bind(this);
		Shortkeys.register(this.shortkey, this.callback);
	}

	destroyed() {
		Shortkeys.unregister(this.shortkey, this.callback);
	}

	callback(e: KeyboardEvent) {
		this.$emit('press', e);
	}
}
