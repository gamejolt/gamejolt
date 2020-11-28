<script lang="ts" src="./styleguide"></script>

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
								<a v-app-scroll-to :href="`#styleguide-${key}`">
									{{ label }}
								</a>
							</li>
						</ul>
					</nav>
				</app-scroll-affix>
			</div>
			<div class="col-sm-9 col-sm-pull-3 col-lg-10 col-lg-pull-2">
				<component :is="component" v-for="(component, key) of components" :key="key" />
			</div>
		</div>
	</div>
</template>
