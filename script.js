// --- STATE MANAGEMENT ---
let documentText = '';
let results = null;
let isProcessing = false;
let activeTab = 'input';
let secondAnalysis = null;
let isSecondAnalysisRunning = false;
let exportStatus = '';
let exportData = '';


// --- CORE BUSINESS LOGIC (from React component) ---

const normalize = (text) => {
  return text.toLowerCase()
    .replace(/[.,&]/g, '')
    .replace(/\s+et\s+al\.?/g, '')
    .replace(/[-\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractFirstAuthor = (authorString) => {
  return authorString
    .split(/\s*[&,]\s*/)[0]
    .replace(/\s+et\s+al\.?/i, '')
    .trim();
};

const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

const extractCitations = (text) => {
    const citations = [];
    const foundCitations = new Set();

    const parentheticalPattern = /\([^)]*\b[A-ZÀ-ÿ][A-ZÀ-ÿa-z\-\']*(?:\s+et\s+al\.?)?.*?\d{4}[^)]*\)/g;
    const parentheticalMatches = text.match(parentheticalPattern) || [];

    parentheticalMatches.forEach(match => {
      const cleaned = match.replace(/[()]/g, '');
      const citationGroups = cleaned.split(';');

      citationGroups.forEach(group => {
        group = group.trim();

        const multiYearMatch = group.match(/^([A-ZÀ-ÿa-z\-\']+(?:\s*[&,]\s*[A-ZÀ-ÿa-z\-\']+)*(?:\s+et\s+al\.?)?)\s*,?\s*(\d{4}(?:\s*,\s*\d{4})*)/);

        if (multiYearMatch) {
          const authors = multiYearMatch[1].trim();
          const yearsString = multiYearMatch[2];
          const years = yearsString.split(',').map(y => y.trim());

          years.forEach(year => {
            const citationKey = normalize(authors + ' ' + year);
            if (!foundCitations.has(citationKey)) {
              citations.push({
                original: `(${authors}, ${year})`,
                authors: authors,
                year: year,
                normalized: citationKey,
                type: 'parenthetical'
              });
              foundCitations.add(citationKey);
            }
          });
        } else {
          const patterns = [
            /^([A-ZÀ-ÿa-z\-\']+(?:\s*[&,]\s*[A-ZÀ-ÿa-z\-\']+)*(?:\s+et\s+al\.?)?)\s*,?\s*(\d{4})/,
            /^([A-ZÀ-ÿa-z\-\']+\s+et\s+al\.?)\s*,?\s*(\d{4})/,
            /^([A-ZÀ-ÿa-z\-\']+\s*&\s*[A-ZÀ-ÿa-z\-\']+)\s*,?\s*(\d{4})/,
            /^([A-ZÀ-ÿa-z\-\']+)\s*,?\s*(\d{4})/
          ];

          let authorYearMatch = null;
          for (const pattern of patterns) {
            authorYearMatch = group.match(pattern);
            if (authorYearMatch) break;
          }

          if (authorYearMatch) {
            let authors = authorYearMatch[1].trim();
            const year = authorYearMatch[2];

            authors = authors
              .replace(/^(e\.g\.,|see|cf\.)\s*/i, '')
              .replace(/,?\s*p\.\s*\d+.*$/, '')
              .replace(/\s*,\s*$/, '')
              .trim();

            const citationKey = normalize(authors + ' ' + year);
            if (!foundCitations.has(citationKey)) {
              citations.push({
                original: `(${group.trim()})`,
                authors: authors,
                year: year,
                normalized: citationKey,
                type: 'parenthetical'
              });
              foundCitations.add(citationKey);
            }
          }
        }
      });
    });

    const narrativePattern = /\b([A-Z][a-z]+(?:'s)?(?:(?:\s*,\s*[A-Z][a-z]+)*\s+and\s+[A-Z][a-z]+|\s+et\s+al\.?)?(?:\s*[&,]\s*[A-Z][a-z]+)*)\s+\(([^)]+)\)/g;
    let narrativeMatch;
    while ((narrativeMatch = narrativePattern.exec(text)) !== null) {
      let leadAuthor = narrativeMatch[1].trim();
      const content = narrativeMatch[2];

      leadAuthor = leadAuthor.replace(/'s$/, '');

      const parts = content.split(';');

      parts.forEach(part => {
        part = part.trim();

        if (/^\d{4}/.test(part)) {
          const year = part.match(/^\d{4}/)[0];
          const citationKey = normalize(leadAuthor + ' ' + year);

          if (!foundCitations.has(citationKey)) {
            citations.push({
              original: `${leadAuthor} (${year})`,
              authors: leadAuthor,
              year: year,
              normalized: citationKey,
              type: 'narrative'
            });
            foundCitations.add(citationKey);
          }
        } else {
          const authorYearMatch = part.match(/^(.+?),?\s*(\d{4})$/);
          if (authorYearMatch) {
            const authors = authorYearMatch[1].trim();
            const year = authorYearMatch[2];
            const citationKey = normalize(authors + ' ' + year);

            if (!foundCitations.has(citationKey)) {
              citations.push({
                original: `(${part.trim()})`,
                authors: authors,
                year: year,
                normalized: citationKey,
                type: 'narrative'
              });
              foundCitations.add(citationKey);
            }
          }
        }
      });
    }

    return citations;
};

const extractReferences = (text) => {
  const refSectionMatch = text.match(/(References|Bibliography|Works Cited)\s*\n([\s\S]*?)(?:\n\n[A-Z]|\n*$)/i);
  if (!refSectionMatch) return [];

  const refSection = refSectionMatch[2];
  const refLines = refSection.split('\n').filter(line => line.trim().length > 20);

  const references = [];

  refLines.forEach(line => {
    const yearMatch = line.match(/\((\d{4})\)/);
    if (!yearMatch) return;

    const year = yearMatch[1];
    const beforeYear = line.substring(0, line.indexOf(`(${year})`)).trim();

    const firstCommaIndex = beforeYear.indexOf(',');
    const firstAuthor = firstCommaIndex !== -1 ? beforeYear.substring(0, firstCommaIndex).trim() : beforeYear;

    const allAuthors = beforeYear
      .replace(/\([^)]*\)/g, '')
      .replace(/\.$/, '')
      .trim();

    references.push({
      original: line.trim(),
      firstAuthor: firstAuthor,
      allAuthors: allAuthors,
      year: year,
      normalized: normalize(allAuthors + ' ' + year),
      firstAuthorNormalized: normalize(firstAuthor + ' ' + year)
    });
  });

  return references;
};

const matchCitationsToReferences = (citations, references) => {
  const fullMatches = [];
  const partialMatches = [];
  const unmatched = [];
  const usedReferences = new Set();

  citations.forEach((citation) => {
    let bestMatch = null;
    let bestScore = 0;

    references.forEach((ref, refIndex) => {
      if (citation.year !== ref.year) return;

      const citationAuthorsNorm = normalize(citation.authors);
      const refAllAuthorsNorm = normalize(ref.allAuthors);
      const citationFirstAuthor = normalize(extractFirstAuthor(citation.authors));
      const refFirstAuthor = normalize(extractFirstAuthor(ref.firstAuthor));

      let score = 0;
      let matchType = 'none';

      if (citation.normalized === ref.normalized || citation.normalized === ref.firstAuthorNormalized) {
        score = 100;
        matchType = 'full';
      }
      else if (citationAuthorsNorm === refAllAuthorsNorm) {
        score = 100;
        matchType = 'full';
      }
      else if (refAllAuthorsNorm.includes(citationAuthorsNorm) && citationAuthorsNorm.length > 4) {
        score = 95;
        matchType = 'full';
      }
      else if (citationAuthorsNorm.includes(refAllAuthorsNorm) && refAllAuthorsNorm.length > 4) {
        score = 95;
        matchType = 'full';
      }
      else {
        const refWithoutInitials = refAllAuthorsNorm.replace(/\s+[a-z]\s*/g, ' ').replace(/\s+/g, ' ').trim();

        if (citationAuthorsNorm === refWithoutInitials) {
          score = 95;
          matchType = 'full';
        }
        else if (refWithoutInitials.includes(citationAuthorsNorm) && citationAuthorsNorm.length > 4) {
          score = 95;
          matchType = 'full';
        }
        else if (citationFirstAuthor === refFirstAuthor && citationFirstAuthor.length > 2) {
          score = 90;
          matchType = 'partial';
        }
        else if (citationFirstAuthor.length > 2 && refFirstAuthor.length > 2) {
          if (citationFirstAuthor.includes(refFirstAuthor) || refFirstAuthor.includes(citationFirstAuthor)) {
            score = 85;
            matchType = 'partial';
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { reference: ref, index: refIndex, confidence: score, matchType };
      }
    });

    if (bestMatch && bestMatch.confidence >= 85) {
      const matchData = {
        citation: citation,
        reference: bestMatch.reference,
        confidence: bestMatch.confidence,
        matchType: bestMatch.matchType
      };

      if (bestMatch.matchType === 'full') {
        fullMatches.push(matchData);
      } else {
        partialMatches.push(matchData);
      }

      usedReferences.add(bestMatch.index);
    } else {
      unmatched.push({
        citation: citation,
        suggestions: []
      });
    }
  });

  const unusedReferences = references
    .filter((ref, index) => !usedReferences.has(index))
    .map(ref => ({
      reference: ref,
      possibleMatches: []
    }));

  return { fullMatches, partialMatches, unmatched, unusedReferences };
};

const performSecondAnalysis = (unusedRefs, docText) => {
    const suggestions = [];

    unusedRefs.forEach(unusedRef => {
      const ref = unusedRef.reference;
      const refFirstAuthor = extractFirstAuthor(ref.firstAuthor).toLowerCase();
      const refYear = ref.year;
      const candidates = [];

      const authorVariations = [
        refFirstAuthor,
        refFirstAuthor.charAt(0).toUpperCase() + refFirstAuthor.slice(1),
        ref.firstAuthor.split(',')[0].toLowerCase(),
        ref.firstAuthor.split(',')[0]
      ];

      authorVariations.forEach(authorVar => {
        if (authorVar.length < 3) return;

        try {
          const escapedAuthor = authorVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          const narrativeRegex = new RegExp(escapedAuthor + "(?:'s)?\\s*\\(" + refYear + "\\)", 'gi');
          let match;
          while ((match = narrativeRegex.exec(docText)) !== null) {
            candidates.push({
              text: match[0],
              confidence: 0.9,
              type: 'narrative'
            });
          }

          const parentheticalRegex = new RegExp("\\([^)]*" + escapedAuthor + "[^)]*" + refYear + "[^)]*\\)", 'gi');
          while ((match = parentheticalRegex.exec(docText)) !== null) {
            candidates.push({
              text: match[0],
              confidence: 0.8,
              type: 'parenthetical'
            });
          }

          const authorRegex = new RegExp("\\b" + escapedAuthor + "\\b", 'gi');
          while ((match = authorRegex.exec(docText)) !== null) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(docText.length, match.index + authorVar.length + 50);
            const context = docText.slice(start, end);

            if (context.includes(refYear)) {
              candidates.push({
                text: context.trim(),
                confidence: 0.6,
                type: 'proximity'
              });
            }
          }

          const lastNameMatch = authorVar.match(/([A-Za-z]+)$/);
          if (lastNameMatch && lastNameMatch[1].length > 3) {
            const lastName = lastNameMatch[1];
            const sentences = docText.split(/[.!?]/);
            sentences.forEach(sentence => {
              if (sentence.includes(lastName) && sentence.includes(refYear)) {
                if (sentence.length < 200) {
                  candidates.push({
                    text: sentence.trim(),
                    confidence: 0.5,
                    type: 'lastname_year'
                  });
                }
              }
            });
          }

          if (ref.allAuthors.includes('.')) {
            const authorWithInitials = ref.allAuthors.split(',')[0].trim();
            if (docText.includes(authorWithInitials) && docText.includes(refYear)) {
              const escapedInitials = authorWithInitials.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const initRegex = new RegExp(escapedInitials + ".*?" + refYear + "|" + refYear + ".*?" + escapedInitials, 'gi');
              while ((match = initRegex.exec(docText)) !== null) {
                if (match[0].length < 150) {
                  candidates.push({
                    text: match[0].trim(),
                    confidence: 0.7,
                    type: 'initials'
                  });
                }
              }
            }
          }

          if (ref.allAuthors.includes('&') || ref.allAuthors.includes(',')) {
            const firstAuthorOnly = ref.allAuthors.split(/[,&]/)[0].trim();
            const escapedFirst = firstAuthorOnly.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const etAlRegex = new RegExp(escapedFirst + "\\s+et\\s+al\\.?.*?" + refYear + "|" + refYear + ".*?" + escapedFirst + "\\s+et\\s+al\\.?", 'gi');
            while ((match = etAlRegex.exec(docText)) !== null) {
              if (match[0].length < 100) {
                candidates.push({
                  text: match[0].trim(),
                  confidence: 0.8,
                  type: 'et_al'
                });
              }
            }
          }
        } catch (error) {
          // Skip this variation if regex fails
        }
      });

      const uniqueCandidates = candidates
        .filter((candidate, index, arr) =>
          arr.findIndex(c => c.text === candidate.text) === index
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      if (uniqueCandidates.length > 0) {
        suggestions.push({
          reference: ref,
          candidates: uniqueCandidates
        });
      }
    });

    return suggestions;
};

const getConfidenceBadge = (confidence) => {
  if (confidence === 'User Confirmed') return 'bg-blue-100 text-blue-800';
  if (confidence >= 90) return 'bg-green-100 text-green-800';
  if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const extractTitleFromReference = (refString) => {
    let match = refString.match(/"([^"]+)"/);
    if (match && match[1]) return match[1];

    match = refString.match(/\(\d{4}\)\.?\s+([^.]+)/);
    if (match && match[1]) return match[1].replace(/\.$/, '').trim();

    const yearMatch = refString.match(/\(\d{4}\)/);
    if (yearMatch) {
        const afterYear = refString.substring(yearMatch.index + 6);
        return afterYear.split('.')[0].trim();
    }

    return '';
}

async function verifyReferenceOnline(item, type) {
    let author = '';
    let year = '';
    let title = '';
    let originalRef = '';

    if (type === 'unused' || type === 'full' || type === 'partial') {
        const ref = item.reference;
        author = ref.firstAuthor.split(',')[0];
        year = ref.year;
        title = extractTitleFromReference(ref.original);
        originalRef = ref.original;
    } else if (type === 'missing') {
        const cit = item.citation;
        author = cit.authors.split(',')[0];
        year = cit.year;
        title = ''; // No reliable title
        originalRef = cit.original;
    }

    if (!author || !year) {
        return { status: 'Error', message: "Not enough info" };
    }

    const query = title ? `"${title}" ${author} ${year}` : `${originalRef}`;

    try {
        const searchResultsJson = await google_search(query);
        const searchResults = JSON.parse(searchResultsJson || '[]');

        if (!searchResults || searchResults.length === 0) {
            return { status: 'NotFound' };
        }

        for (const result of searchResults.slice(0, 5)) {
            const resultTitle = result.title || '';
            const snippet = result.snippet || '';
            const content = (resultTitle + ' ' + snippet).toLowerCase();

            const titleSimilarity = title ? calculateSimilarity(normalize(title), normalize(resultTitle)) : 0;
            const authorMatch = content.includes(author.toLowerCase());
            const yearMatch = content.includes(year);

            if (title && titleSimilarity > 0.85 && authorMatch && yearMatch) {
                return { status: 'Verified', url: result.url };
            }
            if (!title && authorMatch && yearMatch) {
                return { status: 'Verified', url: result.url };
            }
        }

        return { status: 'NotFound' };

    } catch (error) {
        console.error("Search verification failed:", error);
        return { status: 'Error', message: error.message };
    }
}

const generateHtmlReport = (results) => {
  if (!results) return '';

  const summary = results.summary;
  const { fullMatches, partialMatches, missing, unused } = results;

  const getConfidenceBadge = (confidence) => {
    if (confidence === 'User Confirmed') return 'bg-blue-100 text-blue-800';
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const generateSection = (title, items, renderItem) => {
    if (!items || items.length === 0) return '';
    return `
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">${title} (${items.length})</h2>
        <div class="space-y-3">
          ${items.map(renderItem).join('')}
        </div>
      </div>
    `;
  };

  const fullMatchItem = item => `
    <div class="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="font-semibold text-emerald-800">Citation: ${item.citation.original}</div>
          <div class="text-sm text-gray-600 mt-1">Matches: ${item.reference.original}</div>
        </div>
        <span class="ml-4 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(item.confidence)}">
          ${item.confidence === 'User Confirmed' ? 'User Confirmed' : `${item.confidence}% confidence`}
        </span>
      </div>
    </div>
  `;

  const partialMatchItem = item => `
    <div class="border border-green-200 rounded-lg p-4 bg-green-50">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="font-semibold text-green-800">Citation: ${item.citation.original}</div>
          <div class="text-sm text-gray-600 mt-1">Matches: ${item.reference.original}</div>
        </div>
        <span class="ml-4 flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(item.confidence)}">
          ${item.confidence === 'User Confirmed' ? 'User Confirmed' : `${item.confidence}% confidence`}
        </span>
      </div>
    </div>
  `;

  const missingItem = item => `
    <div class="border border-red-200 rounded-lg p-4 bg-red-50">
      <div class="font-semibold text-red-800 mb-2">Citation: ${item.citation.original}</div>
      <div class="text-sm text-gray-600">Authors: ${item.citation.authors} | Year: ${item.citation.year}</div>
    </div>
  `;

  const unusedItem = item => `
    <div class="border border-orange-200 rounded-lg p-4 bg-orange-50">
      <div class="font-semibold text-orange-800">${item.reference.original}</div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reference Check Report</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Reference Check Report</h1>

        <!-- Summary -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Analysis Summary</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-blue-600">${summary.totalCitations}</div><div class="text-sm text-gray-600">Total Citations</div></div>
            <div class="bg-emerald-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-emerald-600">${summary.fullMatches}</div><div class="text-sm text-gray-600">Full Matches</div></div>
            <div class="bg-green-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-green-600">${summary.partialMatches}</div><div class="text-sm text-gray-600">Partial Matches</div></div>
            <div class="bg-red-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-red-600">${summary.missingReferences}</div><div class="text-sm text-gray-600">Missing Refs</div></div>
            <div class="bg-orange-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-orange-600">${summary.unusedReferences}</div><div class="text-sm text-gray-600">Unused Refs</div></div>
            <div class="bg-purple-50 p-4 rounded-lg text-center"><div class="text-2xl font-bold text-purple-600">${summary.matchRate}</div><div class="text-sm text-gray-600">Match Rate</div></div>
          </div>
        </div>

        ${generateSection('Full Matches', fullMatches, fullMatchItem)}
        ${generateSection('Partial Matches', partialMatches, partialMatchItem)}
        ${generateSection('Missing References', missing, missingItem)}
        ${generateSection('Unused References', unused, unusedItem)}

      </div>
    </body>
    </html>
  `;
};

// --- DOM MANIPULATION AND EVENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
  const tabInput = document.getElementById('tab-input');
  const tabResults = document.getElementById('tab-results');
  const contentInput = document.getElementById('content-input');
  const contentResults = document.getElementById('content-results');
  const fileUpload = document.getElementById('file-upload');
  const documentTextarea = document.getElementById('document-text');
  const processButton = document.getElementById('process-button');
  const processButtonText = document.getElementById('process-button-text');
  const processButtonLoader = document.getElementById('process-button-loader');
  const exportStatusEl = document.getElementById('export-status');
  const secondAnalysisButton = document.getElementById('second-analysis-button');
  const secondAnalysisButtonText = document.getElementById('second-analysis-button-text');
  const secondAnalysisLoader = document.getElementById('second-analysis-loader');
  const exportHtmlButton = document.getElementById('export-html-button');
  const verifyAllButton = document.getElementById('verify-all-button');
  const summaryTotalCitations = document.getElementById('summary-total-citations');
  const summaryFullMatches = document.getElementById('summary-full-matches');
  const summaryPartialMatches = document.getElementById('summary-partial-matches');
  const summaryMissingRefs = document.getElementById('summary-missing-refs');
  const summaryUnusedRefs = document.getElementById('summary-unused-refs');
  const summaryMatchRate = document.getElementById('summary-match-rate');
  const secondAnalysisContainer = document.getElementById('second-analysis-container');
  const secondAnalysisTitle = document.getElementById('second-analysis-title');
  const updateResultsButton = document.getElementById('update-results-button');
  const secondAnalysisList = document.getElementById('second-analysis-list');
  const missingRefsContainer = document.getElementById('missing-refs-container');
  const missingRefsTitle = document.getElementById('missing-refs-title');
  const missingRefsList = document.getElementById('missing-refs-list');
  const fullMatchesContainer = document.getElementById('full-matches-container');
  const fullMatchesTitle = document.getElementById('full-matches-title');
  const fullMatchesList = document.getElementById('full-matches-list');
  const partialMatchesContainer = document.getElementById('partial-matches-container');
  const partialMatchesTitle = document.getElementById('partial-matches-title');
  const partialMatchesList = document.getElementById('partial-matches-list');
  const unusedRefsContainer = document.getElementById('unused-refs-container');
  const unusedRefsTitle = document.getElementById('unused-refs-title');
  const unusedRefsList = document.getElementById('unused-refs-list');

  // --- UI Functions ---

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'input') {
      tabInput.classList.add('bg-indigo-600', 'text-white');
      tabInput.classList.remove('bg-white', 'text-gray-700');
      tabResults.classList.remove('bg-indigo-600', 'text-white');
      tabResults.classList.add('bg-white', 'text-gray-700');
      contentInput.style.display = 'block';
      contentResults.style.display = 'none';
    } else {
      tabResults.classList.add('bg-indigo-600', 'text-white');
      tabResults.classList.remove('bg-white', 'text-gray-700');
      tabInput.classList.remove('bg-indigo-600', 'text-white');
      tabInput.classList.add('bg-white', 'text-gray-700');
      contentInput.style.display = 'none';
      contentResults.style.display = 'block';
    }
  }

  function renderResults() {
    if (!results) return;

    const verifyAllButton = document.getElementById('verify-all-button');
    if (results.summary.totalCitations > 0) {
        verifyAllButton.style.display = 'flex';
    } else {
        verifyAllButton.style.display = 'none';
    }

    // Summary
    summaryTotalCitations.textContent = results.summary.totalCitations;
    summaryFullMatches.textContent = results.summary.fullMatches;
    summaryPartialMatches.textContent = results.summary.partialMatches;
    summaryMissingRefs.textContent = results.summary.missingReferences;
    summaryUnusedRefs.textContent = results.summary.unusedReferences;
    summaryMatchRate.textContent = results.summary.matchRate;

    const renderItemHTML = (item, index, type, colorClass) => `
      <div class="border border-${colorClass}-200 rounded-lg p-4 bg-${colorClass}-50">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="font-semibold text-${colorClass}-800">${type === 'unused' ? '' : 'Citation: '}${type === 'unused' ? item.reference.original : item.citation.original}</div>
            ${type !== 'missing' && type !== 'unused' ? `<div class="text-sm text-gray-600 mt-1">Matches: ${item.reference.original}</div>` : ''}
            ${type === 'missing' ? `<div class="text-sm text-gray-600 mb-2">Authors: ${item.citation.authors} | Year: ${item.citation.year}</div>` : ''}
            <div id="verify-status-${type}-${index}" class="text-xs text-gray-500 mt-2 font-mono"></div>
          </div>
          <div class="flex flex-col items-end ml-4 flex-shrink-0">
            ${type !== 'missing' && type !== 'unused' ? `<span class="px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(item.confidence)}">${item.confidence === 'User Confirmed' ? 'User Confirmed' : `${item.confidence}% confidence`}</span>` : ''}
            <button data-item-index="${index}" data-item-type="${type}" class="verify-btn mt-2 px-3 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 transition-colors">
              Verify
            </button>
          </div>
        </div>
      </div>
    `;

    // Missing References
    if (results.missing.length > 0) {
      missingRefsContainer.style.display = 'block';
      missingRefsTitle.textContent = `Missing References (${results.missing.length})`;
      missingRefsList.innerHTML = results.missing.map((item, index) => renderItemHTML(item, index, 'missing', 'red')).join('');
    } else {
      missingRefsContainer.style.display = 'none';
    }

    // Full Matches
    if (results.fullMatches.length > 0) {
      fullMatchesContainer.style.display = 'block';
      fullMatchesTitle.textContent = `Full Matches (${results.fullMatches.length})`;
      fullMatchesList.innerHTML = results.fullMatches.map((item, index) => renderItemHTML(item, index, 'full', 'emerald')).join('');
    } else {
      fullMatchesContainer.style.display = 'none';
    }

    // Partial Matches
    if (results.partialMatches.length > 0) {
      partialMatchesContainer.style.display = 'block';
      partialMatchesTitle.textContent = `Partial Matches (${results.partialMatches.length})`;
      partialMatchesList.innerHTML = results.partialMatches.map((item, index) => renderItemHTML(item, index, 'partial', 'green')).join('');
    } else {
      partialMatchesContainer.style.display = 'none';
    }

    // Unused References
    if (results.unused.length > 0) {
      unusedRefsContainer.style.display = 'block';
      unusedRefsTitle.textContent = `Unused References (${results.unused.length})`;
      unusedRefsList.innerHTML = results.unused.map((item, index) => renderItemHTML(item, index, 'unused', 'orange')).join('');
      if (!secondAnalysis) {
        secondAnalysisButton.style.display = 'flex';
      }
    } else {
      unusedRefsContainer.style.display = 'none';
      secondAnalysisButton.style.display = 'none';
    }
  }

  function renderSecondAnalysis() {
    if (!secondAnalysis || secondAnalysis.length === 0) {
      secondAnalysisContainer.style.display = 'none';
      return;
    }

    secondAnalysisContainer.style.display = 'block';
    secondAnalysisTitle.textContent = `Potential Matches Found (${secondAnalysis.length})`;

    secondAnalysisList.innerHTML = secondAnalysis.map((suggestion, index) => `
      <div class="border rounded-lg p-4 ${suggestion.confirmed ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}">
        <div class="font-semibold text-gray-800 mb-2">
          Reference: ${suggestion.reference.original.substring(0, 100)}...
        </div>
        ${suggestion.confirmed ? `
          <div class="text-green-600 font-medium">
            ✓ Confirmed match: ${suggestion.confirmedMatch}
          </div>
        ` : `
          <div>
            <div class="text-sm font-medium text-gray-700 mb-2">Potential citations found:</div>
            ${suggestion.candidates.map((candidate, candIndex) => `
              <div class="mb-2 p-2 bg-white border rounded">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="text-sm font-mono bg-gray-100 p-2 rounded">
                      ${candidate.text}
                    </div>
                    <div class="text-xs mt-1 text-gray-600">
                      ${Math.round(candidate.confidence * 100)}% confidence • ${candidate.type}
                    </div>
                  </div>
                  <button
                    data-suggestion-index="${index}"
                    data-candidate-text="${escape(candidate.text)}"
                    class="mark-as-match-btn ml-4 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  >
                    Mark as Match
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `).join('');

    if (secondAnalysis.some(s => s.confirmed)) {
      updateResultsButton.style.display = 'flex';
      const confirmedCount = secondAnalysis.filter(s => s.confirmed).length;
      updateResultsButton.innerHTML = `<span>Update Results (${confirmedCount})</span>`;
    } else {
      updateResultsButton.style.display = 'none';
    }
  }

  // --- Event Handlers ---

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        documentText = e.target.result;
        documentTextarea.value = documentText;
      };
      reader.readAsText(file);
    }
  }

  function processDocument() {
    documentText = documentTextarea.value;
    if (!documentText.trim()) return;

    isProcessing = true;
    processButton.disabled = true;
    processButtonText.textContent = 'Processing Document...';
    processButtonLoader.style.display = 'block';

    secondAnalysis = null;

    setTimeout(() => {
      const citations = extractCitations(documentText);
      const references = extractReferences(documentText);
      const matchResults = matchCitationsToReferences(citations, references);

      const summary = {
        totalCitations: citations.length,
        totalReferences: references.length,
        fullMatches: matchResults.fullMatches.length,
        partialMatches: matchResults.partialMatches.length,
        missingReferences: matchResults.unmatched.length,
        unusedReferences: matchResults.unusedReferences.length,
        matchRate: citations.length > 0 ?
          (((matchResults.fullMatches.length + matchResults.partialMatches.length) / citations.length) * 100).toFixed(1) + '%' : '0%'
      };

      results = {
        summary,
        fullMatches: matchResults.fullMatches,
        partialMatches: matchResults.partialMatches,
        missing: matchResults.unmatched,
        unused: matchResults.unusedReferences
      };

      isProcessing = false;
      processButton.disabled = false;
      processButtonText.textContent = 'Analyze References';
      processButtonLoader.style.display = 'none';

      tabResults.disabled = false;
      renderResults();
      switchTab('results');
    }, 1500);
  }

  function runSecondAnalysis() {
    if (!results || !results.unused.length) return;

    isSecondAnalysisRunning = true;
    secondAnalysisButton.disabled = true;
    secondAnalysisButtonText.textContent = 'Analyzing...';
    secondAnalysisLoader.style.display = 'block';

    setTimeout(() => {
      const suggestions = performSecondAnalysis(results.unused, documentText);
      secondAnalysis = suggestions;

      isSecondAnalysisRunning = false;
      secondAnalysisButton.disabled = false;
      secondAnalysisButtonText.textContent = 'Find More Matches';
      secondAnalysisLoader.style.display = 'none';
      secondAnalysisButton.style.display = 'none'; // Hide after running

      renderSecondAnalysis();
    }, 1000);
  }

  function markAsMatch(refIndex, candidateText) {
    if (!secondAnalysis) return;

    secondAnalysis = secondAnalysis.map((suggestion, index) => {
      if (index === refIndex) {
        return { ...suggestion, confirmedMatch: candidateText, confirmed: true };
      }
      return suggestion;
    });

    renderSecondAnalysis();
  }

  function updateResults() {
    if (!secondAnalysis || !results) return;

    const confirmedMatches = secondAnalysis.filter(s => s.confirmed);
    if (confirmedMatches.length === 0) return;

    const newPartialMatches = [];
    const confirmedRefs = new Set();
    const matchedMissingIndices = new Set();

    confirmedMatches.forEach(suggestion => {
      let bestMissingMatch = null;
      let bestScore = 0;
      let bestIndex = -1;

      results.missing.forEach((missing, index) => {
        const confirmedText = suggestion.confirmedMatch.toLowerCase();
        const refYear = suggestion.reference.year;
        const refFirstAuthor = extractFirstAuthor(suggestion.reference.firstAuthor).toLowerCase();

        let score = 0;
        if (missing.citation.year === refYear) {
          score += 50;
          const missingAuthor = missing.citation.authors.toLowerCase();
          if (missingAuthor.includes(refFirstAuthor) || refFirstAuthor.includes(missingAuthor)) score += 40;
          if (confirmedText.includes(missingAuthor.split(' ')[0]) || confirmedText.includes(missing.citation.year)) score += 30;
          const similarity = calculateSimilarity(normalize(missing.citation.original), normalize(suggestion.confirmedMatch));
          score += similarity * 20;
        }
        if (score > bestScore && score > 60) {
          bestScore = score;
          bestMissingMatch = missing;
          bestIndex = index;
        }
      });

      const newMatch = {
        citation: bestMissingMatch ? bestMissingMatch.citation : {
          original: suggestion.confirmedMatch,
          authors: extractFirstAuthor(suggestion.reference.firstAuthor),
          year: suggestion.reference.year,
          normalized: normalize(extractFirstAuthor(suggestion.reference.firstAuthor) + ' ' + suggestion.reference.year),
          type: 'confirmed'
        },
        reference: suggestion.reference,
        confidence: 'User Confirmed',
        matchType: 'user_confirmed'
      };

      newPartialMatches.push(newMatch);
      confirmedRefs.add(suggestion.reference);
      if (bestIndex !== -1) matchedMissingIndices.add(bestIndex);
    });

    const updatedUnused = results.unused.filter(u => !confirmedRefs.has(u.reference));
    const updatedMissing = results.missing.filter((_, index) => !matchedMissingIndices.has(index));

    results.partialMatches.push(...newPartialMatches);
    results.unused = updatedUnused;
    results.missing = updatedMissing;

    results.summary.partialMatches += newPartialMatches.length;
    results.summary.missingReferences = updatedMissing.length;
    results.summary.unusedReferences = updatedUnused.length;
    results.summary.matchRate = results.summary.totalCitations > 0 ?
      (((results.summary.fullMatches + results.summary.partialMatches) / results.summary.totalCitations) * 100).toFixed(1) + '%' : '0%';

    secondAnalysis = secondAnalysis.filter(s => !s.confirmed);

    renderResults();
    renderSecondAnalysis();
  }

  function exportHtmlReport() {
    exportStatusEl.textContent = '📁 Generating report...';
    exportStatusEl.style.display = 'block';

    if (!results) {
      exportStatusEl.textContent = '❌ No results to export';
      setTimeout(() => { exportStatusEl.style.display = 'none' }, 2000);
      return;
    }

    try {
      const htmlContent = generateHtmlReport(results);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'reference-check-report.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      exportStatusEl.textContent = '✅ Report downloaded!';
      setTimeout(() => { exportStatusEl.style.display = 'none' }, 3000);

    } catch (error) {
      exportStatusEl.textContent = `❌ Export failed: ${error.message}`;
      setTimeout(() => { exportStatusEl.style.display = 'none' }, 5000);
    }
  }

  // --- Event Listeners ---

  tabInput.addEventListener('click', () => switchTab('input'));
  tabResults.addEventListener('click', () => switchTab('results'));
  fileUpload.addEventListener('change', handleFileUpload);
  processButton.addEventListener('click', processDocument);
  secondAnalysisButton.addEventListener('click', runSecondAnalysis);
  updateResultsButton.addEventListener('click', updateResults);
  exportHtmlButton.addEventListener('click', exportHtmlReport);

  secondAnalysisList.addEventListener('click', (e) => {
    if (e.target.classList.contains('mark-as-match-btn')) {
      const suggestionIndex = parseInt(e.target.dataset.suggestionIndex, 10);
      const candidateText = unescape(e.target.dataset.candidateText);
      markAsMatch(suggestionIndex, candidateText);
    }
  });

  // --- Verification Logic ---
  async function handleVerify(itemType, itemIndex) {
    const statusEl = document.getElementById(`verify-status-${itemType}-${itemIndex}`);
    if (!statusEl) return;

    statusEl.textContent = 'Verifying...';
    statusEl.classList.remove('text-green-600', 'text-red-600');

    let item;
    switch (itemType) {
        case 'full': item = results.fullMatches[itemIndex]; break;
        case 'partial': item = results.partialMatches[itemIndex]; break;
        case 'missing': item = results.missing[itemIndex]; break;
        case 'unused': item = results.unused[itemIndex]; break;
        default: return;
    }

    const result = await verifyReferenceOnline(item, itemType);

    if (result.status === 'Verified') {
        statusEl.innerHTML = `✔ Verified <a href="${result.url}" target="_blank" class="text-blue-500 hover:underline">[source]</a>`;
        statusEl.classList.add('text-green-600');
    } else if (result.status === 'NotFound') {
        statusEl.textContent = '❌ Not Found';
        statusEl.classList.add('text-red-600');
    } else {
        statusEl.textContent = `⚠️ Error: ${result.message || 'Unknown'}`;
        statusEl.classList.add('text-red-600');
    }
  }

  async function handleVerifyAll() {
      verifyAllButton.disabled = true;
      verifyAllButton.textContent = 'Verifying...';

      const allItems = [
          ...results.fullMatches.map((item, index) => ({ item, type: 'full', index })),
          ...results.partialMatches.map((item, index) => ({ item, type: 'partial', index })),
          ...results.missing.map((item, index) => ({ item, type: 'missing', index })),
          ...results.unused.map((item, index) => ({ item, type: 'unused', index }))
      ];

      for (const { item, type, index } of allItems) {
          const statusEl = document.getElementById(`verify-status-${type}-${index}`);
          const buttonEl = document.querySelector(`button.verify-btn[data-item-type='${type}'][data-item-index='${index}']`);
          if (statusEl && !statusEl.textContent.includes('✔')) {
              await handleVerify(type, index);
              if(buttonEl) {
                buttonEl.disabled = true;
                buttonEl.textContent = 'Checked';
              }
          }
      }

      verifyAllButton.disabled = false;
      verifyAllButton.textContent = 'Verify All';
  }

  verifyAllButton.addEventListener('click', handleVerifyAll);

  const resultsLists = [fullMatchesList, partialMatchesList, missingRefsList, unusedRefsList];
  resultsLists.forEach(list => {
      list.addEventListener('click', (e) => {
          if (e.target.classList.contains('verify-btn')) {
              const itemType = e.target.dataset.itemType;
              const itemIndex = parseInt(e.target.dataset.itemIndex, 10);
              e.target.disabled = true;
              handleVerify(itemType, itemIndex);
          }
      });
  });
});
