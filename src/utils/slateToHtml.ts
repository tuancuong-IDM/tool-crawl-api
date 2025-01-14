
import { Node } from 'slate';
import { Html } from 'slate-html-serializer';

const rules = [
  // Define your rules for serializing Slate nodes to HTML here
  // Example:
  {
    serialize(obj, children) {
      if (obj.type === 'paragraph') {
        return `<p>${children}</p>`;
      }
      if (obj.type === 'bold') {
        return `<strong>${children}</strong>`;
      }
      // Add more rules as needed
    },
  },
];

const htmlSerializer = new Html({ rules });

export function serializeSlateToHtml(value) {
  return htmlSerializer.serialize(value);
}