<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import './dogtag.styl';

@Options({})
export default class AppUserDogtag extends Vue {
	@Prop(String) type!: string;
}
</script>

<template>
	<span
		class="user-dogtag tag"
		:class="{
			'tag-highlight': type === 'gmr',
			'tag-highlight': type === 'dev',
			'tag-notice': ['gmr', 'dev', 'guy', 'ban'].indexOf(type) == -1,
			'user-dogtag-guy': type === 'guy',
		}"
	>
		{{ type }}
	</span>
</template>
