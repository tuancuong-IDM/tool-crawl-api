"use client";
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $createParagraphNode, createEditor } from '@payloadcms/richtext-lexical/lexical';
import { useRef, useState } from 'react';
import axios from 'axios';
import { slugify } from '@/utils/slug';

const categoryMapping: Record<string, string> = {
  "1": "Enjoy",
  "2": "Explore", 
  "3": "Discover",
  "4": "The Art Corner",
  "5": "Reminiscence & Heritage",
  "6": "LifeStyle",
  "7": "Tips & Advice", 
  "8": "Inspiration Journey",
  "9": "W Coffee Talk",
  "10": "Browse Content",
  "11": "Hospitality Business News",
  "12": "WWK News",
  "13": "WWK Video",
  "14": "Environmental Movement",
  "15": "Long Form",
  "16": "Automobile",
  "17": "Fashion",
  "18": "Cuisine",
  "19": "Beauty",
  "20": "Music",
  "21": "Photograph",
  "22": "Sports & Esports",
  "23": "Architecture",
  "24": "Technology",
  "25": "Watches",
  "26": "Properties Opportunity"
};
const topic:Record<string,string>={
    "1": "I have the simplest tastes. I am always satisfied with the best. - Oscar Wilde",
    "2": "The world is a book and those who do not travel read only one page. - St. Augustine",
    "3": "When was the last time you did something for the first time? If you can't even remember, it's time for a discovery trip!",
    "4": "A piece of art - no matter how small - once touched a soul, remains immortal.",
    "5": "“Preserving the heritage – promoting the future.” – Becky Williamson-Martin",
    "6": "There's nothing as bland as a life without style, and nothing as fine as a style that inspires life.",
    "7": "Making the most of your trip",
    "8": "A picture paints a thousand words. A photo sings a thousand songs.",
    "9": "Sharing the timeless vibes",
    "10": "Wowweekend Magazine",
    "11": "Looking for breaking business news stories in the hospitality industry",
    "12": "Get the latest Wowweekend News: breaking news, features, internal news, community news...",
    "13": "Let’s these videos bring you into the real experiences where you not only enjoy the beautiful scenes but also feel the greatest atmosphere.",
    "14": "Global save news",
    "15": "WOWWEEKEND offers Editorial Sponsorship options for both Print and Online. Built around campaigns, branded content is customized to best suit an individual client's needs and timeframes.",
    "16": "Moving forward with the most exceptional experience",
    "17": "From snazzy to jazzy - From daily to active - Look is everything",
    "18": "Seeing is tasting - Tasting is believing",
    "19": "“Beauty lies in the eyes of the beholder” - Plato",
    "20": "The language of deep emotion, the vehicle to transport us to memorable places and time",
    "21": "Capturing the essential of the world for the ecstasy of your eyes",
    "22": "Champions don't show up to get everything they want; they show up to give everything they have",
    "23": "“Architecture should speak of its time and place, but yearn for timelessness.” – Frank Gehry",
    "24": "Sneak peek of what future will look like.",
    "25": "\"Time isn't the main thing. It's the only thing.\" - Miles Davis",
    "26": "Set a new benchmark for life with a sought-after location, wonder views and key amenities"
}
export default function APage() {
  const editorRef = useRef<any>(null);
  const [status, setStatus] = useState('');



  async function processCategories() {
    try {
      setStatus('Fetching categories...');
      for (const [id, name] of Object.entries(categoryMapping)) {
          axios.post('/api/categories',{
            title:name,
            title_en:name,
            alias:slugify(name),
            alias_en:slugify(name),
            subtitle:topic[id],
            subtitle_en:topic[id]
         })
      }
      setStatus('Processing categories...');
   

      setStatus('All categories processed successfully!');
    } catch (error) {
      console.error('Error processing categories:', error);
      setStatus('Error processing categories');
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Category HTML to Lexical Converter</h1>
      <div className="mb-4">
        <p>Status: {status}</p>
      </div>
      <button
        onClick={processCategories}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Process Categories
      </button>
    </div>
  );
}
