/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ArticleBlock = ({ data }:any) => {
  const { articleHeader, articleContent, relatedPosts, sidebarImage } = data;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar with Logo */}
          <div className="lg:col-span-1">
            <Link href="/" className="block">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full font-serif text-2xl">
                W
              </div>
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <div className="mb-8">
              <span className="text-sm text-gray-600 uppercase tracking-wider">
                {articleHeader.category}
              </span>
              <h1 className="mt-2 text-3xl font-serif">
                {articleHeader.title}
              </h1>
            </div>

            {/* Article Content */}
            <div className="prose max-w-none mb-12">
              <p className="text-gray-600">{articleContent.content}</p>
              <Link
                href={articleContent.readMoreLink}
                className="inline-flex items-center text-sm text-gray-900 hover:underline mt-4"
              >
                READ MORE
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Related Posts */}
            <div className="border-t pt-8">
              <h2 className="text-sm uppercase tracking-wider mb-6">RELATED</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((post:any, index:number) => (
                  <article key={index}>
                    <Link href={post.link} className="group">
                      <div className="aspect-[4/3] mb-4">
                        <Image
                          src={post.image.url}
                          alt={post.title}
                          width={400}
                          height={300}
                          className="object-cover w-full h-full rounded-sm group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <h3 className="font-serif text-xl">{post.title}</h3>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-12">
              <Image
                src={sidebarImage.url}
                alt="Magazine Cover"
                width={300}
                height={400}
                className="w-full rounded-sm shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleBlock;