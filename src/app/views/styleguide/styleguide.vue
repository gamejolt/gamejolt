<template>
	<div class="container">
		<div class="row">
			<div class="col-sm-3 col-sm-push-9 col-lg-2 col-lg-push-10">
				<br />
				<br />
				<app-scroll-affix>
					<nav class="platform-list">
						<ul>
							<li v-for="(label, key) of nav" :key="key">
								<a :href="`#styleguide-${key}`" v-app-scroll-to>
									{{ label }}
								</a>
							</li>
						</ul>
					</nav>
				</app-scroll-affix>
			</div>
			<div class="col-sm-9 col-sm-pull-3 col-lg-10 col-lg-pull-2">
				<component
					v-for="component of components"
					:is="component"
					:key="component"
					/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./styleguide"></script>
