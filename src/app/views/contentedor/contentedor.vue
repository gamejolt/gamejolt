<script lang="ts" src="./contentedor"></script>

<template>
	<div class="container">
		<div class="row">
			<div class="col-sm-3 col-sm-push-9 col-lg-2 col-lg-push-10">
				<br />
				<br />
				<!-- <app-scroll-affix>
					<nav class="platform-list">
						<ul>
							<li v-for="(label, key) of nav" :key="key">
								<a v-app-scroll-to :href="`#styleguide-${key}`">
									{{ label }}
								</a>
							</li>
						</ul>
					</nav>
				</app-scroll-affix> -->
			</div>
			<div class="col-sm-9 col-sm-pull-3 col-lg-10 col-lg-pull-2">
				<app-content-editor
					class="-editor"
					:content-context="context"
					:value="value"
					placeholder="type here"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-editor
	margin: 40px 0
	border: 2px solid white
	border-radius: 8px
</style>
