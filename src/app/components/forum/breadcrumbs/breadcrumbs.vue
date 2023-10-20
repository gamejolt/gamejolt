<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ForumChannelModel } from '../../../../_common/forum/channel/channel.model';

@Options({})
export default class AppForumBreadcrumbs extends Vue {
	@Prop(Object) channel?: ForumChannelModel;
	@Prop(String) sort?: string;
	@Prop(String) page?: string;
}
</script>

<template>
	<nav class="breadcrumb dark-variant">
		<ul>
			<li>
				<router-link :to="{ name: 'forums.landing.overview' }">
					<span class="breadcrumb-tag"> &nbsp; </span>
					<AppTranslate>Forums</AppTranslate>
				</router-link>
				<AppJolticon v-if="channel" icon="chevron-right" class="breadcrumb-separator" />
			</li>

			<li v-if="channel">
				<router-link
					:class="{ active: !page }"
					:to="{
						name: 'forums.channels.view',
						params: { name: channel.name, sort: sort },
					}"
				>
					<AppTranslate class="breadcrumb-tag">Channel</AppTranslate>
					#{{ channel.name }}
				</router-link>
				<AppJolticon v-if="page" icon="chevron-right" class="breadcrumb-separator" />
			</li>

			<li v-if="page">
				<span class="active">
					<span class="breadcrumb-tag"> &nbsp; </span>
					<template v-if="page === 'add-topic'">
						<AppTranslate>New Topic</AppTranslate>
					</template>
					<template v-else-if="page === 'view-topic'">
						<AppTranslate>View Topic</AppTranslate>
					</template>
				</span>
			</li>
		</ul>
	</nav>
</template>
