"use client";
import DOMPurify from "dompurify";

const RichTextRenderer = ({ content, className = "" }) => {
  if (!content?.trim()) return null;

  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "strong", "em", "u", "strike", "s", "sup", "sub",
      "ul", "ol", "li", "a", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "code", "pre", "img",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "title",
      "class", "className",
      "style",
      "width", "height",
    ],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style"],
    FORBID_ATTR: ["on*"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^&:/?#]*(?:[/?#]|$))/i,
  });

  return (
    <div
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default RichTextRenderer;