<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { formatFilesize } from '../../../_common/filters/filesize';
import { formatUcwords } from '../../../_common/filters/ucwords';
import { GameBuild } from '../../../_common/game/build/build.model';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { Store } from '../../store/index';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppIncludedItems extends Vue {
	readonly formatUcwords = formatUcwords;
	readonly formatFilesize = formatFilesize;

	@State package!: Store['package'];
	@State packagePayload!: Store['packagePayload'];
	@State packageCard!: Store['packageCard'];

	hasSupport(build: GameBuild, os: string) {
		return this.checkBuildSupport(build, os) || this.checkBuildSupport(build, os + '_64');
	}

	is64BitOnly(build: GameBuild, os: string) {
		return !this.checkBuildSupport(build, os) && this.checkBuildSupport(build, os + '_64');
	}

	private checkBuildSupport(build: GameBuild, os: string) {
		return (build as any)['os_' + os] ?? false;
	}
}
</script>

<template>
	<div class="-included-items">
		<div class="row">
			<div class="col-xs-6 col-centered">
				<p v-if="package.description">
					{{ package.description }}
				</p>

				<ul>
					<li v-for="build of packagePayload.builds" :key="build.id">
						{{ build.primary_file.filename }}
						<small class="text-muted">
							({{ formatFilesize(build.primary_file.filesize) }})
						</small>

						<span
							v-for="os of ['windows', 'mac', 'linux', 'other']"
							:key="os"
							v-app-tooltip.touchable="packageCard.platformSupportInfo[os].tooltip"
						>
							<template v-if="hasSupport(build, os)">
								{{ packageCard.platformSupportInfo[os].tooltip }}
							</template>

							<template v-if="is64BitOnly(build, os)"> 64-bit </template>
						</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-included-items
	p
	ul
		margin-bottom: $shell-padding

		&:last-child
			margin-bottom: 0

	ul
		padding-left: 0
		list-style: none

	li
		margin-bottom: 5px
</style>
