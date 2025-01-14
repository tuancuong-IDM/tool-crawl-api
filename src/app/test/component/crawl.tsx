'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

import { htmlToSlate } from '@slate-serializers/html'
import { Config } from '@slate-serializers/html/src/lib/serializers/htmlToSlate/config/types'
import { getAttributeValue } from 'domutils'
const mediaCache = new Map<string, any>()

const cleanHtmlContent = (html: string): string => {
  return html
}
// Custom serializer to convert HTML to Slate JSON
// const deserialize = (el: Node): any => {
//   if (el.nodeType === 3) {
//     return el.textContent
//   } else if (el.nodeType !== 1) {
//     return null
//   }

//   const children = Array.from(el.childNodes).map(deserialize).flat()

//   switch ((el as HTMLElement).nodeName.toLowerCase()) {
//     case 'body':
//       return jsx('fragment', {}, children)
//     case 'br':
//       return '\n'
//     case 'p':
//       return jsx('element', { type: 'paragraph' }, children)
//     case 'strong':
//       return jsx('element', { type: 'bold' }, children)
//     case 'em':
//       return jsx('element', { type: 'italic' }, children)
//     case 'img':
//       const imgEl = el as HTMLImageElement
//       return jsx(
//         'element',
//         {
//           type: 'image',
//           url: imgEl.getAttribute('src'),
//           id: imgEl.getAttribute('data-media-id'),
//         },
//         [],
//       )
//     default:
//       return children
//   }
// }

// const htmlToSlate = (html: string) => {
//   const parser = new DOMParser()
//   const doc = parser.parseFromString(html, 'text/html')
//   const cleanedHtml = cleanHtmlContent(tempDiv.innerHTML)
//   const result = htmlToSlate(cleanedHtml)
//   return deserialize(doc.body)
// }

const downloadAndUploadImage = async (url: string, alt: string): Promise<any> => {
  if (mediaCache.has(url)) {
    return mediaCache.get(url)
  }

  try {
    const response = await axios.get(`/api/proxy?imageUrl=${encodeURIComponent(url)}`, {
      responseType: 'arraybuffer',
    })

    const contentType = response.headers['content-type'] || 'image/jpeg'
    const buff = Buffer.from(response.data, 'binary')

    const formData = new FormData()
    const blob = new Blob([buff], { type: contentType })

    const extension = contentType.split('/')[1] || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`
    formData.append('file', blob, filename)
    formData.append('_payload', JSON.stringify({ alt }))
    const uploadResponse = await axios.post('/api/media', formData)
    const mediaData = uploadResponse.data.doc

    mediaCache.set(url, mediaData)
    return mediaData
  } catch (error) {
    console.error('Error processing image:', error)
    return null
  }
}

// const convertHtmlToSlate = async (html: string) => {
//   const tempDiv = document.createElement('div')
//   tempDiv.innerHTML = html

//   // Process all images in the tempDiv
//   const images = tempDiv.getElementsByTagName('img')
//   const imageProcessingPromises = []

//   for (const img of images) {
//     const oldSrc = img.getAttribute('src')
//     if (!oldSrc) continue

//     const absoluteUrl = oldSrc.startsWith('http')
//       ? oldSrc
//       : `https://www.wowweekend.vn${oldSrc.startsWith('/') ? '' : '/'}${oldSrc}`

//     const processPromise = downloadAndUploadImage(absoluteUrl).then((mediaInfo) => {
//       if (mediaInfo && mediaInfo.url) {
//         img.setAttribute(
//           'src',
//           mediaInfo.sizes.large.url || mediaInfo.sizes.medium.url || mediaInfo.url,
//         )
//         img.setAttribute('data-media-id', mediaInfo.id)
//       } else {
//         img.setAttribute('src', absoluteUrl)
//       }
//     })

//     imageProcessingPromises.push(processPromise)
//   }

//   // Wait for all images to be processed
//   await Promise.all(imageProcessingPromises)

//   // Convert to Slate JSON
//   return htmlToSlate(tempDiv.innerHTML)
// }
const convertHtmlToSlate = async (html: string) => {
  if (!html?.trim()) {
    return [{ children: [{ text: '' }] }]
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const images = tempDiv.getElementsByTagName('img')
  const imageProcessingPromises = []

  for (const img of images) {
    const oldSrc = img.getAttribute('src')
    const oldAlt = img.getAttribute('alt') || ''
    if (!oldSrc) continue

    const absoluteUrl = oldSrc.startsWith('http')
      ? oldSrc
      : `https://www.wowweekend.vn${oldSrc.startsWith('/') ? '' : '/'}${oldSrc}`

    const processPromise = downloadAndUploadImage(absoluteUrl, oldAlt).then((mediaInfo) => {
      if (mediaInfo) {
        img.setAttribute('data-media-id', mediaInfo.id)
        img.setAttribute('data-media-info', JSON.stringify(mediaInfo))
        img.setAttribute(
          'src',
          mediaInfo.sizes?.large?.url || mediaInfo.sizes?.medium?.url || mediaInfo.url,
        )
      }
    })

    imageProcessingPromises.push(processPromise)
  }

  await Promise.all(imageProcessingPromises)

  const config: Config = {
    elementTags: {
      p: (el: any) => ({
        type: 'paragraph',
        children: Array.from(el.childNodes).map((node: any) => {
          if (node.nodeType === 3) {
            return { text: node.textContent || '' }
          }
          return { text: '' }
        }),
      }),
      img: (el: any) => {
        const mediaInfo = getAttributeValue(el, 'data-media-info')
        const parsedMediaInfo = mediaInfo ? JSON.parse(mediaInfo) : null

        return {
          type: 'upload',
          relationTo: 'media',
          value: parsedMediaInfo,
          children: [{ text: '' }],
        }
      },
      div: (el: any) => ({
        type: 'paragraph',
        children: Array.from(el.childNodes).map((node: any) => {
          if (node.nodeType === 3) {
            return { text: node.textContent || '' }
          }
          return { text: '' }
        }),
      }),
    },
    textTags: {
      strong: (el: any) => ({ bold: true, text: el.textContent || '' }),
      em: (el: any) => ({ italic: true, text: el.textContent || '' }),
      b: (el: any) => ({ bold: true, text: el.textContent || '' }),
      i: (el: any) => ({ italic: true, text: el.textContent || '' }),
    },
    filterWhitespaceNodes: true,
  }

  const slateNodes = htmlToSlate(tempDiv.innerHTML, config)

  return slateNodes
}

const processArticleImage = async (imagePath: string | null): Promise<any> => {
  if (!imagePath) return null

  const fullUrl = `https://www.wowweekend.vn/document_root/${imagePath.replace(/^\//, '')}`
  const mediaInfo = await downloadAndUploadImage(fullUrl, '')
  console.log(mediaInfo)

  if (mediaInfo) {
    return mediaInfo
  }
  return null
}

export const Crawl = () => {

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  }

  const imageVariants = {
    enter: {
      opacity: 0,
      scale: 0.9,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      position: 'absolute',
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  const progressVariants = {
    hidden: { width: 0 },
    visible: (progress: number) => ({
      width: `${progress}%`,
      transition: { duration: 0.3, ease: 'easeOut' },
    }),
  }

  const [startId, setStartId] = useState(1)
  const [endId, setEndId] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [failedIds, setFailedIds] = useState<number[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  type ArticlePreview = {
    title?: string
    image?: string
    status?: string
    isLoading?: boolean
  }

  const [currentArticle, setCurrentArticle] = useState<ArticlePreview>({
    title: '',
    image: '',
    status: '',
    isLoading: false,
  })

  useEffect(() => {
    if (currentArticle.image) {
      const img = new Image()
      img.src = currentArticle.image
      img.onload = () => {
        setCurrentArticle((prev) => ({ ...prev, isLoading: false }))
      }
    }
  }, [currentArticle.image])

  const processSingleArticle = async (id: number) => {
    try {
      setCurrentArticle((prev) => ({
        ...prev,
        isLoading: true,
        status: 'Loading article data...',
      }))

      const response = await axios.get(`/api/proxy?id=${id}`)
      const article = response.data.data
      const getCategory = await axios.get(`/api/category/${response.data.data_cat.alias}`)
      
      const checkAlias = await axios.get(`/api/check?alias=${response.data.data.title_rewrite}`)
      if(checkAlias.data.totalDocs !== 0) {
          return false;
      }

      setCurrentArticle((prev) => ({
        ...prev,
        title: article.title,
        image: article.image_size_01
          ? `https://www.wowweekend.vn/document_root/${article.image_size_01.replace(/^\//, '')}`
          : null,
        status: 'Processing content...',
        isLoading: true,
      }))

      setStatus(`Processing article ${id}: Converting content...`)
      const [lexicalContent, lexicalContentEN, processedImage01] =
        await Promise.all([
          convertHtmlToSlate(article.content),
          convertHtmlToSlate(article.content_en),
          // processArticleImage(article.image_size_01),
          processArticleImage(article.image_size_02),
        ])
      const _payload = {
        cat_id: getCategory.data,
        group_type: 'news',
        title: article.title,
        title_en: article.title_en,
        subtitle: article.subtitle,
        subtitle_en: article.subtitle_en,
        website_title: article.website_title,
        meta_keyword: article.meta_keyword,
        meta_description: article.meta_description,
        title_rewrite: article.title_rewrite,
        title_rewrite_en: article.title_rewrite_en,
        image_size_01: processedImage01,
        description: article.description,
        description_en: article.description_en,
        content: lexicalContent,
        content_en: lexicalContentEN,
      }
      // console.log(lexicalContent);
      // console.log(lexicalContent)

      await axios.post(`/api/article`, _payload)
      return true
    } catch (error) {
      console.error(`Error processing article ${id}:`, error)
      return false
    }
  }

  const startProcessing = async () => {
    setIsProcessing(true)
    setFailedIds([])
    setCurrentProgress(0)

    const total = endId - startId + 1

    for (let id = startId; id <= endId; id++) {
      setStatus(`Processing article ${id} of ${endId}...`)
      const success = await processSingleArticle(id)
      if (!success) {
        setFailedIds((prev) => [...prev, id])
      }
      setCurrentProgress(((id - startId + 1) / total) * 100)
    }

    setStatus(
      failedIds.length > 0
        ? `Migration completed with ${failedIds.length} errors`
        : 'Migration completed successfully!',
    )
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6"
      >
        <div className="mb-8 grid grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start ID</label>
                <input
                  type="number"
                  value={startId}
                  onChange={(e) => setStartId(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End ID</label>
                <input
                  type="number"
                  value={endId}
                  onChange={(e) => setEndId(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <button
              onClick={startProcessing}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isProcessing ? 'Processing... below' : 'Start Migration'}
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                key="processing-panel"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <h3 className="font-medium text-gray-800 mb-2">Currently Processing</h3>
                <div className="relative overflow-hidden rounded-lg aspect-video mb-4">
                  <AnimatePresence mode="sync">
                    {currentArticle.image && (
                      <motion.div
                        key={currentArticle.image}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0"
                      >
                        <motion.img
                          src={currentArticle.image}
                          alt={currentArticle.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <motion.p
                    key={currentArticle.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600"
                  >
                    {currentArticle.title || 'Loading...'}
                  </motion.p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <motion.span
                        key={currentProgress}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {Math.round(currentProgress)}%
                      </motion.span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-blue-600 h-full rounded-full"
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                        custom={currentProgress}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {failedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <p className="text-red-600 font-medium">Failed Article IDs:</p>
              <p className="text-sm text-red-500 mt-1">{failedIds.join(', ')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg"
        >
          <motion.p
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-700"
          >
            {status}
          </motion.p>
        </motion.div>

        <button
          onClick={() => {
            const config: Config = {
              elementTags: {
                h1: (el: any) => ({
                  type: 'h1',
                  children: [{ text: el.textContent || '' }],
                }),
                h2: (el: any) => ({
                  type: 'h2',
                  children: [{ text: el.textContent || '' }],
                }),
                p: (el: any) => ({
                  type: 'paragraph',
                  children: [{ text: el.textContent || '' }],
                }),
                img: (el: any) => ({
                  type: 'image',
                  url: getAttributeValue(el, 'src') || '',
                  alt: getAttributeValue(el, 'alt') || '',
                  value: {},
                  children: [{ text: '' }],
                }),
                a: (el: any) => ({
                  type: 'link',
                  url: getAttributeValue(el, 'href') || '',
                  children: [{ text: el.textContent || '' }],
                }),
              },
              textTags: {
                strong: (el: any) => ({ bold: true, text: el.textContent || '' }),
                em: (el: any) => ({ italic: true, text: el.textContent || '' }),
              },
              filterWhitespaceNodes: true,
            }
            const json = htmlToSlate(
              `<p>Hello!</p>
            <img src="/path/to/image.jpg" alt="Example Image" />
            <a href="https://github.com/go-resty/resty/releases/tag/v2.16.3" />
            `,
              config,
            )
            console.log(json)
          }}
        >
          CLick
        </button>
      </motion.div>
    </div>
  )
}