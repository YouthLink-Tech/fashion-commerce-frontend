"use client";

import { useMemo } from "react";
import createDOMPurify from "dompurify";

let DOMPurifyInstance;

// Initialize once on client
if (typeof window !== "undefined") {
  DOMPurifyInstance = createDOMPurify(window);

  DOMPurifyInstance.addHook("afterSanitizeAttributes", (node) => {
    // Harden links
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer nofollow");
    }
    // Ensure images have alt
    if (node.tagName === "IMG" && !node.getAttribute("alt")) {
      node.setAttribute("alt", "");
    }
  });
}

const RichTextRenderer = ({ content, className = "" }) => {
  // Memoized sanitize; returns empty string if window not ready
  const sanitized = useMemo(() => {
    if (!content?.trim() || !DOMPurifyInstance) return "";
    return DOMPurifyInstance.sanitize(content, {
      ALLOWED_TAGS: [
        "p", "br", "b", "i", "strong", "em", "u", "strike", "s", "sup", "sub",
        "ul", "ol", "li", "a", "span", "div",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "blockquote", "code", "pre", "img"
      ],
      ALLOWED_ATTR: [
        "href", "target", "rel", "src", "alt", "title",
        "class", "style", "width", "height"
      ],
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style"],
      FORBID_ATTR: ["on*"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
    });
  }, [content]);

  if (!sanitized) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default RichTextRenderer;
