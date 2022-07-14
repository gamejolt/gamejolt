<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Navigate } from '../navigate/navigate.service';

@Options({})
export default class AppContactLink extends Vue {
	@Prop({ type: String, required: true }) email!: string;

	onClick() {
		if (!this.GJ_IS_DESKTOP_APP) {
			Navigate.gotoExternal(`mailto:${this.email}`);
			return;
		}

		// Sometimes Vue router will break <a> tags that use mailto
		// by replacing part of the current url with the mailto path,
		// so we can instead use 'Navigate.goto(path)' to bypass this.
		Navigate.goto(`mailto:${this.email}`);
	}
}
</script>

<template>
	<a :title="email" @click="onClick()">
		<slot />
	</a>
</template>
