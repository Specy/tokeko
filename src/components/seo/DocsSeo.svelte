<script lang="ts">
	import {
		DOCS_ROOT_PATH,
		SOCIAL_IMAGE_URL,
		breadcrumbListLd,
		docsTechArticleLd,
		docsTitle,
		serializeJsonLd,
		toAbsoluteUrl
	} from '$lib/seo';

	/** Short page name, e.g. "FIRST and FOLLOW sets explained". The brand suffix is added here. */
	export let title: string;
	/** One sentence, at most 160 characters, taken from the page's content. */
	export let description: string;
	/** Route path of the page, e.g. "/docs/dotlr/grammar". */
	export let path: string;

	$: fullTitle = docsTitle(title);
	$: url = toAbsoluteUrl(path);
	$: article = docsTechArticleLd({ headline: fullTitle, description, url });
	$: breadcrumbs = breadcrumbListLd([
		{ name: 'Docs', url: toAbsoluteUrl(DOCS_ROOT_PATH) },
		{ name: title, url }
	]);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<!-- og:url and twitter:card come from the root layout (per-page canonical URL), and og:image
	     from src/app.html (the homepage image, absolute); not repeated here to avoid duplicate tags. -->
	{@html `<script type="application/ld+json">${serializeJsonLd(article)}</script>`}
	{@html `<script type="application/ld+json">${serializeJsonLd(breadcrumbs)}</script>`}
</svelte:head>
