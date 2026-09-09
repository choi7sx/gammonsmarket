import site from '../../data/site.json';
import { getCollection } from 'astro:content';

import rss from '@astrojs/rss';
const posts = await getCollection('blog', ({ data }) => !data.draft);

export async function GET(context) {
  return rss({
    title: site.site_title,
    description: site.description,
    site: context.site,
    items: posts.map((post) => ({
      link: `/blog/${post.id}`,
      title: post.data.title,
      pubDate: post.data.post_hero.date,
    })),
    customData: `<language>en-us</language>`,
  });
}
