// Extracts Q&A pairs from a post so the page can emit a FAQPage JSON-LD
// structured-data block.
//
// This parser operates on the RAW markdown string (file.value) rather than the
// mdast, which makes it robust to two formatting variants found across posts
// AND to any mdast-level transformations applied by Astro's full markdown
// pipeline (remark-gfm, remark-smartypants, etc.):
//
//   Variant A (Q and A in separate paragraphs):
//     **Q：<question>**
//
//     A：<answer>
//
//   Variant B (Q and A on consecutive lines — same markdown paragraph):
//     **Q：<question>**
//     A：<answer>
//
// A Q line is any line starting with `**Q：` (every question is bolded). The
// answer is every subsequent line until the next Q line or a heading.
// The extracted array is exposed via file.data.astro.frontmatter.faq, which
// Astro surfaces as `remarkPluginFrontmatter.faq` after rendering.

type FaqItem = { question: string; answer: string };

/** Strip inline markdown to plain text for schema "text" fields. */
function toPlainText(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline code
    .replace(/\*\*([^*]*)\*\*/g, "$1") // bold
    .replace(/\*([^*]*)\*/g, "$1") // italic
    .replace(/__([^_]*)__/g, "$1")
    .replace(/_([^_]*)_/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const Q_LINE = /^\*\*Q[：:]\s*(.+?)\*\*\s*$/;
const Q_LINE_LOOSE = /^\*\*Q[：:]\s*(.+?)\*\*/;
const A_LINE = /^A[：:]\s*(.*)$/;
const HEADING = /^#{1,6}\s/;

export function remarkExtractFaq() {
  return (_tree: any, file: any) => {
    const md: string = typeof file?.value === "string" ? file.value : "";
    if (!md) return;

    const lines = md.split(/\r?\n/);
    const faqs: FaqItem[] = [];
    let curQ: string | null = null;
    let ansLines: string[] = [];

    const flush = () => {
      if (curQ) {
        const answer = toPlainText(ansLines.join(" "));
        if (answer) faqs.push({ question: toPlainText(curQ), answer });
      }
      curQ = null;
      ansLines = [];
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const m = line.match(Q_LINE) || line.match(Q_LINE_LOOSE);
      if (m) {
        flush();
        curQ = m[1].trim();
        continue;
      }
      if (HEADING.test(line)) {
        flush();
        continue;
      }
      if (curQ === null) continue;
      const a = line.match(A_LINE);
      if (a) {
        if (a[1].trim()) ansLines.push(a[1]);
      } else if (line.trim() === "") {
        // blank line inside an answer — keep words separated
        if (ansLines.length) ansLines.push(" ");
      } else {
        ansLines.push(line.trim());
      }
    }
    flush();

    if (faqs.length > 0) {
      file.data.astro = file.data.astro || {};
      file.data.astro.frontmatter = file.data.astro.frontmatter || {};
      file.data.astro.frontmatter.faq = faqs;
    }
  };
}
