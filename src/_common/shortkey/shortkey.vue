<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Shortkeys } from './shortkey-service';

@Options({})
export default class AppShortkey extends Vue {
	@Prop(String)
	shortkey!: string;

	@Emit('press')
	emitPress(_e: KeyboardEvent) {}

	mounted() {
		this.callback = this.callback.bind(this);
		Shortkeys.register(this.shortkey, this.callback);
	}

	unmounted() {
		Shortkeys.unregister(this.shortkey, this.callback);
	}

	callback(e: KeyboardEvent) {
		this.emitPress(e);
	}
}
</script>

<template>
	<span />
</template>
