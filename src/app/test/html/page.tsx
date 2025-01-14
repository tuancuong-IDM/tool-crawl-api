'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { slateEditor } from '@payloadcms/richtext-slate'
import { htmlToSlate } from '@slate-serializers/html'

const cleanHtmlContent = (html: string): string => {
  // Remove standalone newlines and excessive whitespace
  return html
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .replace(/\n/g, '') // Remove remaining newlines
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
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
  try {
    const response = await axios.get(`/api/proxy?imageUrl=${encodeURIComponent(url)}`, {
      responseType: 'arraybuffer',
    })

    const contentType = response.headers['content-type'] || 'image/jpeg'
    const buffer = Buffer.from(response.data, 'binary')

    const formData = new FormData()
    const blob = new Blob([buffer], { type: contentType })

    const extension = contentType.split('/')[1] || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`
    formData.append('file', blob, filename)
    formData.append('_payload', JSON.stringify({ alt }))
    const uploadResponse = await axios.post('/api/media', formData)
    const mediaData = uploadResponse.data.doc

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
    return [
      {
        children: [{ text: '' }],
      },
    ]
  }

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const resultNodes = []
  const imagePromises = new Map()
  let currentIndex = 0

  const processNode = async (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        resultNodes[currentIndex] = {
          children: [{ text: node.textContent.trim() }],
        }
        currentIndex++
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      if (element.nodeName.toLowerCase() === 'img') {
        const oldSrc = element.getAttribute('src')
        const oldAlt = element.getAttribute('alt') || ''
        if (oldSrc) {
          const absoluteUrl = oldSrc.startsWith('http')
            ? oldSrc
            : `https://www.wowweekend.vn${oldSrc.startsWith('/') ? '' : '/'}${oldSrc}`

          const targetIndex = currentIndex
          const imagePromise = downloadAndUploadImage(absoluteUrl, oldAlt).then((mediaInfo) => {
            if (mediaInfo) {
              resultNodes[targetIndex] = {
                children: [{ text: '' }],
                type: 'upload',
                relationTo: 'media',
                value: {
                  id: mediaInfo.id,
                  url: mediaInfo.url,
                  filename: mediaInfo.filename,
                  mimeType: mediaInfo.mimeType,
                  filesize: mediaInfo.filesize,
                  width: mediaInfo.width,
                  height: mediaInfo.height,
                  focalX: 50,
                  focalY: 50,
                  sizes: {
                    thumbnail: mediaInfo.sizes?.thumbnail || null,
                    medium: mediaInfo.sizes?.medium || null,
                    large: mediaInfo.sizes?.large || null,
                  },
                  createdAt: mediaInfo.createdAt,
                  updatedAt: mediaInfo.updatedAt,
                  thumbnailURL: mediaInfo.sizes?.thumbnail?.url || null,
                },
              }
            }
          })
          imagePromises.set(targetIndex, imagePromise)
          currentIndex++
        }
      } else {
        for (const childNode of Array.from(element.childNodes)) {
          await processNode(childNode)
        }
      }
    }
  }

  await processNode(tempDiv)

  await Promise.all(imagePromises.values())
  console.log(resultNodes)

  return resultNodes.filter(
    (node) =>
      node &&
      (node.type === 'upload' || (node.children && node.children[0].text.trim().length > 0)),
  )
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

const TestPage = () => {
  const [startId, setStartId] = useState(1)
  const [endId, setEndId] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [failedIds, setFailedIds] = useState<number[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentArticle, setCurrentArticle] = useState<{
    title?: string
    image?: string
  }>({})

  const processSingleArticle = async (id: number) => {
    try {
      const response = await axios.get(`/api/proxy?id=${id}`)
      const article = response.data.data
      const getCategory = await axios.get(`/api/category/${response.data.data_cat.alias}`)

      setCurrentArticle({
        title: article.title,
        image: article.image_size_01
          ? `https://www.wowweekend.vn/document_root/${article.image_size_01.replace(/^\//, '')}`
          : null,
      })

      setStatus(`Processing article ${id}: Converting content...`)
      const [lexicalContent, lexicalContentEN, processedImage01, processedImage02] =
        await Promise.all([
          convertHtmlToSlate(article.content),
          convertHtmlToSlate(article.content_en),
          processArticleImage(article.image_size_01),
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
        image_size_02: processedImage02,
        description: article.description,
        description_en: article.description_en,
        content: lexicalContent,
        content_en: lexicalContentEN,
      }
      // console.log(lexicalContent)
      console.log(JSON.stringify(lexicalContent));
      // await axios.post(`/api/article`, _payload)
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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div className="space-y-4">
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
              {isProcessing ? 'Processing...' : 'Start Migration'}
            </button>
          </div>

          {isProcessing && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">Currently Processing</h3>
              {currentArticle.image && (
                <img
                  src={currentArticle.image}
                  alt={currentArticle.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{currentArticle.title || 'Loading...'}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(currentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {failedIds.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 font-medium">Failed Article IDs:</p>
            <p className="text-sm text-red-500 mt-1">{failedIds.join(', ')}</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{status}</p>
        </div>
      </div>
    </div>
  )
}

export default TestPage
