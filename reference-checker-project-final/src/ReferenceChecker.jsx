import React, { useState, useCallback, useMemo, memo } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Download, Search, BookOpen, FileCheck, AlertTriangle, Info } from 'lucide-react';
import './animations.css';

// ==================== CONSTANTS ====================
const CITATION_PATTERNS = {
  // More comprehensive parenthetical pattern
  parenthetical: /\([^)]*\b[A-ZÀ-ÿ][A-ZÀ-ÿa-z\-\']*(?:\s+et\s+al\.?)?.*?\d{4}[^)]*\)/g,
  // Possessive citations like "Averill's (1980)" or "Hatfield, Cacioppo, and Rapson's (1988)"
  possessive: /\b((?:[A-Z][a-z]+(?:,?\s*)?)+(?:and\s)?(?:[A-Z][a-z]+)?)(?:'s|’s)\s+\((\d{4}[a-z]?)\)/g,
  // Standard narrative citations
  narrative: /\b((?:[a-z]+\s)?[A-Z][a-z]+(?:'s)?(?:(?:\s*,\s*[A-Z][a-z]+)*\s+and\s+[A-Z][a-z]+|(?:\s+(?:et\s+al\.?,?|and\s+colleagues)))?(?:\s*[&,]\s*[A-Z][a-z]+)*)\s+\(([^)]+)\)/g,
  // Author-year patterns for parsing
  authorYear: [
    /([A-ZÀ-ÿa-z\-\']+(?:\s*[&,]\s*[A-ZÀ-ÿa-z\-\']+)*(?:\s+et\s+al\.?)?)\s*,?\s*(\d{4})/,
    /([A-ZÀ-ÿa-z\-\']+\s+et\s+al\.?)\s*,?\s*(\d{4})/,
    /([A-ZÀ-ÿa-z\-\']+\s*&\s*[A-ZÀ-ÿa-z\-\']+)\s*,?\s*(\d{4})/,
    /([A-ZÀ-ÿa-z\-\']+)\s*,?\s*(\d{4})/
  ],
  narrativeEtAl: /\b((?:[a-z]+\s)*[A-Z][a-z\-']+)\s+et\s+al\.?,?\s*(\d{4})/g
};

const CONFIDENCE_THRESHOLDS = {
  exact: 100,
  veryHigh: 95,
  high: 90,
  medium: 85,
  low: 70
};

// ==================== UTILITY FUNCTIONS ====================
const normalize = (text) => {
  return text.toLowerCase()
    .replace(/\s+and\s+/g, ' ')      // Normalize " and "
    .replace(/[.,&]/g, '')          // Remove punctuation
    .replace(/\s[a-z]\b\.?/g, '')   // Remove initials
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

const getConfidenceLevel = (confidence) => {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return { color: 'emerald', label: 'High' };
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return { color: 'green', label: 'Medium' };
  if (confidence >= CONFIDENCE_THRESHOLDS.low) return { color: 'yellow', label: 'Low' };
  return { color: 'red', label: 'Very Low' };
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// ==================== COMPONENTS ====================

// Statistics Card Component
const StatCard = memo(({ value, label, color = 'blue', icon: Icon }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg text-center transform transition-transform hover:scale-105`}>
    <div className="flex items-center justify-center mb-2">
      {Icon && <Icon className={`h-5 w-5 text-${color}-500 mr-1`} />}
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
));

// Match Item Component
const MatchItem = memo(({ item, type, confidence }) => {
  const confidenceLevel = getConfidenceLevel(confidence);
  const bgColors = {
    full: 'emerald',
    partial: 'green',
    missing: 'red',
    unused: 'orange'
  };
  const bgColor = bgColors[type] || 'gray';

  return (
    <div className={`border border-${bgColor}-200 rounded-lg p-4 bg-${bgColor}-50 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {item.citation && (
            <div className={`font-semibold text-${bgColor}-800 mb-1`}>
              <span className="text-sm font-normal text-gray-600">Citation:</span> {item.citation.original}
            </div>
          )}
          {item.reference && type !== 'unused' && (
            <div className="text-sm text-gray-700 mt-1">
              <span className="font-medium text-gray-600">Matches:</span> {item.reference.original}
            </div>
          )}
          {type === 'unused' && (
            <div className={`font-semibold text-${bgColor}-800`}>
              {item.reference.original}
            </div>
          )}
          {type === 'missing' && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Authors:</span> {item.citation.authors} |
              <span className="font-medium ml-2">Year:</span> {item.citation.year}
            </div>
          )}
        </div>
        {confidence !== undefined && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${confidenceLevel.color}-100 text-${confidenceLevel.color}-800 ml-2`}>
            {confidence}% • {confidenceLevel.label}
          </span>
        )}
      </div>
    </div>
  );
});

// Progress Indicator Component
const ProgressIndicator = ({ step, total }) => (
  <div className="flex items-center justify-center space-x-2 my-4">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          i <= step ? 'bg-indigo-600 w-8' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

// ==================== MAIN EXTRACTION LOGIC ====================

const useReferenceExtraction = () => {
  const extractCitations = useCallback((text) => {
    const citations = [];
    const foundCitations = new Set();

    // Handle narrative "et al." outside of parentheses, e.g., "Jackson et al., 2019"
    let narrativeEtAlMatch;
    const narrativeEtAlPattern = new RegExp(CITATION_PATTERNS.narrativeEtAl);
    while ((narrativeEtAlMatch = narrativeEtAlPattern.exec(text)) !== null) {
      const author = narrativeEtAlMatch[1] + ' et al';
      const year = narrativeEtAlMatch[2];
      const citationKey = normalize(author + ' ' + year);

      if (!foundCitations.has(citationKey)) {
        citations.push({
          original: narrativeEtAlMatch[0],
          authors: author,
          year: year,
          normalized: citationKey,
          type: 'narrative'
        });
        foundCitations.add(citationKey);
      }
    }

    // First, handle possessive citations like "Averill's (1980)"
    let possessiveMatch;
    const possessivePattern = new RegExp(CITATION_PATTERNS.possessive);
    while ((possessiveMatch = possessivePattern.exec(text)) !== null) {
      const author = possessiveMatch[1];
      const year = possessiveMatch[2].replace(/[a-z]$/, '');
      const citationKey = normalize(author + ' ' + year);

      if (!foundCitations.has(citationKey)) {
        citations.push({
          original: `${author}'s (${year})`,
          authors: author,
          year: year,
          normalized: citationKey,
          type: 'possessive'
        });
        foundCitations.add(citationKey);
      }
    }

    // Extract narrative citations (but not possessive ones we already got)
    let narrativeMatch;
    const narrativePattern = new RegExp(CITATION_PATTERNS.narrative);
    while ((narrativeMatch = narrativePattern.exec(text)) !== null) {
      // Skip if this is a possessive we already captured
      if (narrativeMatch[1].endsWith("'s") || narrativeMatch[1].endsWith("’s")) {
        continue;
      }

      let leadAuthor = narrativeMatch[1].trim();
      const content = narrativeMatch[2];

      const parts = content.split(/;\s*/);

      parts.forEach(part => {
        part = part.trim();

        // Just a year
        if (/^\d{4}[a-z]?/.test(part)) {
          const year = part.match(/^(\d{4})/)[0];
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
          // Author and year in parentheses
          const authorYearMatch = part.match(/^(.+?),?\s*(\d{4}[a-z]?)$/);
          if (authorYearMatch) {
            const authors = authorYearMatch[1].trim();
            const year = authorYearMatch[2].replace(/[a-z]$/, '');
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

    // Extract parenthetical citations (including those with e.g., etc.)
    const parentheticalMatches = text.match(CITATION_PATTERNS.parenthetical) || [];

    parentheticalMatches.forEach(match => {
      // Skip if this is part of a possessive citation we already captured
      if (text.includes(`'s ${match}`) || text.includes(`’s ${match}`)) {
        return;
      }

      const cleaned = match.replace(/[()]/g, '');

      // Split by semicolon for multiple citations, but be careful with nested commas
      const citationGroups = cleaned.split(/;\s*/);

      citationGroups.forEach(group => {
        group = group.trim();

        // Remove common prefixes. Handles sequences like "see, e.g.,"
        group = group.replace(/^((?:see also|see|e\.g\.,|i\.e\.,|cf\.|viz\.)\s*,?\s*)+/i, '').trim();

        // Skip if too short
        if (group.length < 4) return;

        // Handle multiple years for same author(s)
        const multiYearMatch = group.match(/^([A-ZÀ-ÿ][A-ZÀ-ÿa-z\-\'\s]*(?:\s*[&,]\s*[A-ZÀ-ÿ][A-ZÀ-ÿa-z\-\'\s]*)*(?:\s+et\s+al\.?)?)\s*,?\s*(\d{4}(?:\s*,\s*\d{4})*)/);

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
          // Try various author-year patterns
          let authorYearMatch = null;
          for (const pattern of CITATION_PATTERNS.authorYear) {
            authorYearMatch = group.match(pattern);
            if (authorYearMatch) break;
          }

          if (authorYearMatch) {
            let authors = authorYearMatch[1].trim();
            const year = authorYearMatch[2];

            // Clean up page numbers, chapters, etc.
            authors = authors
              .replace(/,?\s*pp?\.\s*\d+.*$/, '')
              .replace(/,?\s*ch\.\s*\d+.*$/, '')
              .replace(/\s*,\s*$/, '')
              .trim();

            // Validate year
            const yearNum = parseInt(year);
            if (yearNum < 1800 || yearNum > 2030) return;

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

    return citations;
  }, []);

  const extractReferences = useCallback((text) => {
    // Find the references section - be more flexible with the format
    // Look for the References heading and capture everything after it
    const refSectionMatch = text.match(/(References|Bibliography|Works Cited|Literature Cited|REFERENCES|BIBLIOGRAPHY)\s*\n([\s\S]*?)$/i);
    if (!refSectionMatch) return [];

    const refSection = refSectionMatch[2];
    const references = [];

    // Split by double newlines or look for reference patterns
    // References can be multi-line, so we need to be smarter about splitting
    const refEntries = [];
    const lines = refSection.split('\n');
    let currentRef = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Remove any leading asterisks or formatting markers
      const cleanLine = line.replace(/^\*+\s*/, '').trim();

      // Skip empty lines
      if (!cleanLine) {
        if (currentRef.trim().length > 20) {
          refEntries.push(currentRef.trim());
          currentRef = '';
        }
        continue;
      }

      // Check if this looks like the start of a new reference
      // Most references start with an author name (capital letter) and eventually have a year
      const looksLikeNewRef = /^[A-ZÀ-ÿ]/.test(cleanLine) &&
                              !cleanLine.match(/^(pp\.|Vol\.|In[:\s]|Ed[s]?\.|DOI|http|www\.)/i) && // Not a continuation
                              (cleanLine.match(/[A-Z][a-z]+/) || // Has proper names
                               cleanLine.match(/\d{4}/)); // Or has a year

      // Additional check: if current ref already has a year and this line starts with a capital letter
      // followed by author-like text, it's probably a new reference
      const currentHasYear = currentRef.match(/\b(19|20)\d{2}\b/);
      const startsLikeAuthor = /^[A-ZÀ-ÿ][a-z]+,?\s*([A-Z]\.?\s*)+/.test(cleanLine);

      if ((looksLikeNewRef || (currentHasYear && startsLikeAuthor)) && currentRef.trim().length > 20) {
        refEntries.push(currentRef.trim());
        currentRef = cleanLine;
      } else {
        // Add to current reference (handling multi-line references)
        currentRef += (currentRef ? ' ' : '') + cleanLine;
      }
    }

    // Don't forget the last reference
    if (currentRef.trim().length > 20) {
      refEntries.push(currentRef.trim());
    }

    // Process each reference entry
    refEntries.forEach(entry => {
      // Remove any leading asterisks or special characters
      entry = entry.replace(/^\*+\s*/, '').trim();

      // Multiple patterns for finding years in references - MORE SPECIFIC
      // Years typically appear after author names and before the title
      const yearPatterns = [
        /^[^(]*\((19\d{2}[a-z]?|20[0-2]\d[a-z]?)\)/, // Standard: "Author, A. B. (1980)."
        /^[^.]+?\.\s*(19\d{2}[a-z]?|20[0-2]\d[a-z]?)\./, // After period: "Author, A. B. 1980."
        /^[^,]+,[^,]+?,\s*(19\d{2}[a-z]?|20[0-2]\d[a-z]?)[,.\s]/, // After second comma: "Smith, J., 1980,"
        /^[^.]+?\)\s*(19\d{2}[a-z]?|20[0-2]\d[a-z]?)\./, // After Eds.: "In A. Smith (Ed.) 1980."
      ];

      let yearMatch = null;
      let year = null;

      for (const pattern of yearPatterns) {
        yearMatch = entry.match(pattern);
        if (yearMatch) {
          // Extract just the year part
          const fullMatch = yearMatch[0];
          const yearOnly = yearMatch[1];

          // Verify this is actually a year and not page numbers
          // Years should not be preceded by "pp." or "-" or be part of page ranges
          const beforeYearContext = fullMatch.substring(0, fullMatch.indexOf(yearOnly));
          if (!beforeYearContext.match(/pp\.\s*\d+\s*-?\s*$/) &&
              !beforeYearContext.match(/\d\s*-\s*$/)) {
            year = yearOnly.replace(/[a-z]$/, ''); // Remove year suffix like 'a' in '1980a'
            break;
          }
        }
      }

      // If no year found with specific patterns, try a more general but careful approach
      if (!year) {
        // Look for a 4-digit year that's NOT part of page numbers
        const generalYearMatch = entry.match(/\b(19\d{2}[a-z]?|20[0-2]\d[a-z]?)\b(?![^\(]*\))/);
        if (generalYearMatch) {
          // Check it's not preceded by page indicators
          const indexOfYear = entry.indexOf(generalYearMatch[1]);
          const beforeYear = entry.substring(Math.max(0, indexOfYear - 10), indexOfYear);
          if (!beforeYear.match(/pp\.|pages|p\.|vol\.|pp\s+\d/i)) {
            year = generalYearMatch[1].replace(/[a-z]$/, '');
          }
        }
      }

      // Skip if no year found or year is unrealistic
      if (!year || parseInt(year) < 1900 || parseInt(year) > 2030) {
        return;
      }

      // Extract authors - everything before the year
      let beforeYear = '';
      const yearWithParens = `(${year}`;
      const yearWithoutParens = year;

      if (entry.includes(yearWithParens)) {
        beforeYear = entry.substring(0, entry.indexOf(yearWithParens)).trim();
      } else {
        // Find where the year appears and take everything before it
        const yearIndex = entry.indexOf(yearWithoutParens);
        if (yearIndex > 0) {
          // Make sure we're not cutting in the middle of page numbers
          const potentialAuthors = entry.substring(0, yearIndex).trim();
          if (potentialAuthors.length > 2 && !potentialAuthors.endsWith('-')) {
            beforeYear = potentialAuthors;
          }
        }
      }

      // Clean up the authors string
      beforeYear = beforeYear
        .replace(/\*+/g, '') // Remove asterisks
        .replace(/\.$/, '') // Remove trailing period
        .replace(/,$/, '') // Remove trailing comma
        .replace(/\([^)]*\)/g, '') // Remove any parenthetical content
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Skip if authors section is too short or too long (likely parsing error)
      if (beforeYear.length < 3 || beforeYear.length > 200) {
        return;
      }

      // Extract first author (everything before first comma or &)
      const firstAuthorMatch = beforeYear.match(/^([A-ZÀ-ÿ][A-ZÀ-ÿa-z\-\'\s]+?)(?:,|\s+&|\s+and\s+|$)/);
      const firstAuthor = firstAuthorMatch ? firstAuthorMatch[1].trim() : beforeYear.split(/[,&]/)[0].trim();

      references.push({
        original: entry,
        firstAuthor: firstAuthor,
        allAuthors: beforeYear,
        year: year,
        normalized: normalize(beforeYear + ' ' + year),
        firstAuthorNormalized: normalize(firstAuthor + ' ' + year)
      });
    });

    return references;
  }, []);

  const matchCitationsToReferences = useCallback((citations, references) => {
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

        // Scoring logic
        if (citation.normalized === ref.normalized || citation.normalized === ref.firstAuthorNormalized) {
          score = CONFIDENCE_THRESHOLDS.exact;
          matchType = 'full';
        }
        else if (citationAuthorsNorm === refAllAuthorsNorm) {
          score = CONFIDENCE_THRESHOLDS.exact;
          matchType = 'full';
        }
        else if (refAllAuthorsNorm.includes(citationAuthorsNorm) && citationAuthorsNorm.length > 4) {
          score = CONFIDENCE_THRESHOLDS.veryHigh;
          matchType = 'full';
        }
        else if (citationAuthorsNorm.includes(refAllAuthorsNorm) && refAllAuthorsNorm.length > 4) {
          score = CONFIDENCE_THRESHOLDS.veryHigh;
          matchType = 'full';
        }
        else {
          const refWithoutInitials = refAllAuthorsNorm.replace(/\s+[a-z]\s*/g, ' ').replace(/\s+/g, ' ').trim();

          if (citationAuthorsNorm === refWithoutInitials) {
            score = CONFIDENCE_THRESHOLDS.veryHigh;
            matchType = 'full';
          }
          else if (refWithoutInitials.includes(citationAuthorsNorm) && citationAuthorsNorm.length > 4) {
            score = CONFIDENCE_THRESHOLDS.veryHigh;
            matchType = 'full';
          }
          else if (citationFirstAuthor === refFirstAuthor && citationFirstAuthor.length > 2) {
            score = CONFIDENCE_THRESHOLDS.high;
            matchType = 'partial';
          }
          else if (citationFirstAuthor.length > 2 && refFirstAuthor.length > 2) {
            if (citationFirstAuthor.includes(refFirstAuthor) || refFirstAuthor.includes(citationFirstAuthor)) {
              score = CONFIDENCE_THRESHOLDS.medium;
              matchType = 'partial';
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = { reference: ref, index: refIndex, confidence: score, matchType };
        }
      });

      if (bestMatch && bestMatch.confidence >= CONFIDENCE_THRESHOLDS.medium) {
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
  }, []);

  return { extractCitations, extractReferences, matchCitationsToReferences };
};

// ==================== MAIN COMPONENT ====================

const ReferenceChecker = () => {
  const [document, setDocument] = useState('');
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [processingStep, setProcessingStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const { extractCitations, extractReferences, matchCitationsToReferences } = useReferenceExtraction();

  const processDocument = useCallback(async () => {
    if (!document.trim()) return;

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate processing steps with actual work
    await new Promise(resolve => setTimeout(resolve, 500));
    setProcessingStep(1);

    const citations = extractCitations(document);
    await new Promise(resolve => setTimeout(resolve, 500));
    setProcessingStep(2);

    const references = extractReferences(document);
    await new Promise(resolve => setTimeout(resolve, 500));
    setProcessingStep(3);

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

    setResults({
      summary,
      fullMatches: matchResults.fullMatches,
      partialMatches: matchResults.partialMatches,
      missing: matchResults.unmatched,
      unused: matchResults.unusedReferences
    });

    setActiveTab('results');
    setIsProcessing(false);
    setProcessingStep(0);
  }, [document, extractCitations, extractReferences, matchCitationsToReferences]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      setFileName(file.name);
      setFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocument(e.target.result);
      };
      reader.readAsText(file);
    }
  }, []);

  const exportResults = useCallback(() => {
    if (!results) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      fullMatches: results.fullMatches.map(item => ({
        citation: item.citation.original,
        reference: item.reference.original,
        confidence: item.confidence
      })),
      partialMatches: results.partialMatches.map(item => ({
        citation: item.citation.original,
        reference: item.reference.original,
        confidence: item.confidence
      })),
      missingReferences: results.missing.map(item => ({
        citation: item.citation.original,
        authors: item.citation.authors,
        year: item.citation.year
      })),
      unusedReferences: results.unused.map(item => ({
        reference: item.reference.original
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reference-check-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const clearAll = useCallback(() => {
    setDocument('');
    setResults(null);
    setFileName('');
    setFileSize(0);
    setActiveTab('input');
  }, []);

  const documentStats = useMemo(() => {
    if (!document) return { words: 0, characters: 0 };
    return {
      words: document.trim().split(/\s+/).length,
      characters: document.length
    };
  }, [document]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-full shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Academic Reference Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Automatically verify citations and reference lists in academic documents with advanced pattern matching
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'input'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
            aria-label="Document Input Tab"
          >
            <Upload className="h-4 w-4" />
            <span>Document Input</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'results'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
            disabled={!results}
            aria-label="Analysis Results Tab"
          >
            <FileCheck className="h-4 w-4" />
            <span>Analysis Results</span>
            {results && (
              <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {results.summary.totalCitations}
              </span>
            )}
          </button>
        </div>

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="bg-white rounded-xl shadow-xl p-6 animate-slideIn">
            {/* File Upload Section */}
            <div className="mb-6 border-b pb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Document
              </label>
              <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </label>
                </div>
                {fileName && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{fileName}</span>
                    <span className="text-gray-400 ml-2">({formatFileSize(fileSize)})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Text Input Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Document Text
                </label>
                {document && (
                  <div className="text-xs text-gray-500 space-x-3">
                    <span>{documentStats.words.toLocaleString()} words</span>
                    <span>{documentStats.characters.toLocaleString()} characters</span>
                  </div>
                )}
              </div>
              <textarea
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Paste your academic document here including citations and references section..."
                className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                aria-label="Document text input"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={processDocument}
                disabled={!document.trim() || isProcessing}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                aria-label="Analyze references"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Analyze References</span>
                  </>
                )}
              </button>
              {document && (
                <button
                  onClick={clearAll}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Clear all"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Processing Steps Indicator */}
            {isProcessing && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm font-medium text-indigo-700 mb-2">
                  {processingStep === 0 && 'Initializing...'}
                  {processingStep === 1 && 'Extracting citations...'}
                  {processingStep === 2 && 'Extracting references...'}
                  {processingStep === 3 && 'Matching citations to references...'}
                </div>
                <ProgressIndicator step={processingStep} total={3} />
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-indigo-600" />
                  Analysis Summary
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={exportResults}
                    className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow hover:shadow-lg"
                    aria-label="Export results"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="New analysis"
                  >
                    <FileText className="h-4 w-4" />
                    <span>New Analysis</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  value={results.summary.totalCitations}
                  label="Total Citations"
                  color="blue"
                  icon={FileText}
                />
                <StatCard
                  value={results.summary.fullMatches}
                  label="Full Matches"
                  color="emerald"
                  icon={CheckCircle}
                />
                <StatCard
                  value={results.summary.partialMatches}
                  label="Partial Matches"
                  color="green"
                  icon={CheckCircle}
                />
                <StatCard
                  value={results.summary.missingReferences}
                  label="Missing Refs"
                  color="red"
                  icon={AlertCircle}
                />
                <StatCard
                  value={results.summary.unusedReferences}
                  label="Unused Refs"
                  color="orange"
                  icon={AlertTriangle}
                />
                <StatCard
                  value={results.summary.matchRate}
                  label="Match Rate"
                  color="purple"
                  icon={Info}
                />
              </div>

              {/* Quick Insights */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {results.summary.matchRate >= 90 && (
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Excellent citation-reference matching
                    </div>
                  )}
                  {results.summary.matchRate < 90 && results.summary.matchRate >= 70 && (
                    <div className="flex items-center text-yellow-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Good matching with some discrepancies
                    </div>
                  )}
                  {results.summary.matchRate < 70 && (
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Significant matching issues detected
                    </div>
                  )}
                  {results.summary.unusedReferences > 5 && (
                    <div className="flex items-center text-orange-700">
                      <Info className="h-4 w-4 mr-2" />
                      Many unused references in bibliography
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Missing References Section */}
            {results.missing.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Missing References ({results.missing.length})
                    </h3>
                    <p className="text-sm text-gray-600">Citations found in text but not in references</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.missing.map((item, index) => (
                    <MatchItem
                      key={index}
                      item={item}
                      type="missing"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Full Matches Section */}
            {results.fullMatches.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Full Matches ({results.fullMatches.length})
                    </h3>
                    <p className="text-sm text-gray-600">Perfect citation-reference pairs</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.fullMatches.map((item, index) => (
                    <MatchItem
                      key={index}
                      item={item}
                      type="full"
                      confidence={item.confidence}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Partial Matches Section */}
            {results.partialMatches.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Partial Matches ({results.partialMatches.length})
                    </h3>
                    <p className="text-sm text-gray-600">Probable matches with minor discrepancies</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.partialMatches.map((item, index) => (
                    <MatchItem
                      key={index}
                      item={item}
                      type="partial"
                      confidence={item.confidence}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unused References Section */}
            {results.unused.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Unused References ({results.unused.length})
                    </h3>
                    <p className="text-sm text-gray-600">References not cited in the document</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.unused.map((item, index) => (
                    <MatchItem
                      key={index}
                      item={item}
                      type="unused"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.summary.totalCitations === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Citations Found</h3>
                <p className="text-gray-600">
                  The document doesn't appear to contain any citations or references.
                  Please ensure your document includes both in-text citations and a references section.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceChecker;
You are currently working on plan step: Improve the `normalize` function. I will update the function to better handle variations in author lists by stripping out initials and normalizing conjunctions like "and".. Once you have finished this, call `plan_step_complete()` before moving on to the next step.
System Info: timestamp: 2025-08-17 01:07:53.308298
