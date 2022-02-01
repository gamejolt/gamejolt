<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppContentViewerTag extends Vue {
	@Prop(String)
	tag!: string;

	get url() {
		const searchTerm = encodeURIComponent(`#${this.tag}`);
		return `/search?q=${searchTerm}`;
	}
}
</script>

<template>
	<router-link :to="url">
		<slot />
	</router-link>
</template>
