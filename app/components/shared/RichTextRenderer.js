"use client";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

const RichTextRenderer = ({ content, className = "" }) => {
  const [sanitized, setSanitized] = useState("");

  useEffect(() => {
    if (!content?.trim()) {
      setSanitized("");
      return;
    }
    setSanitized(
      DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "p", "br", "b", "i", "strong", "em", "u", "strike", "s", "sup", "sub",
          "ul", "ol", "li", "a", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6",
          "blockquote", "code", "pre", "img",
        ],
        ALLOWED_ATTR: [
          "href", "target", "rel", "src", "alt", "title",
          "class",
          "style", "width", "height",
        ],
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style"],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^&:/?#]*(?:[/?#]|$))/i,
      })
    );
  }, [content]);

  if (!sanitized) return null;

  return (
    <div
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default RichTextRenderer;