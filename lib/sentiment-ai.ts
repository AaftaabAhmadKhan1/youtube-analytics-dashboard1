// Advanced AI-powered sentiment analysis using multiple models
// Provides human-like accuracy with nuanced understanding

interface SentimentResult {
  label: string;
  score: number;
}

interface HuggingFaceResponse {
  label: string;
  score: number;
}

// Cache for sentiment results to avoid repeated API calls
const sentimentCache = new Map<string, 'Positive' | 'Negative' | 'Neutral'>();

// List of advanced models for better accuracy
const MODELS = [
  'cardiffnlp/twitter-roberta-base-sentiment-latest', // Best for social media/comments
  'finiteautomata/bertweet-base-sentiment-analysis', // Optimized for tweets/short text
  'distilbert-base-uncased-finetuned-sst-2-english', // General purpose fallback
];

/**
 * Analyze sentiment using advanced RoBERTa model (human-like accuracy)
 * Falls back to multiple models for best results
 */
export async function analyzeWithAI(text: string): Promise<'Positive' | 'Negative' | 'Neutral'> {
  // Check cache first
  const cacheKey = text.toLowerCase().trim();
  if (sentimentCache.has(cacheKey)) {
    return sentimentCache.get(cacheKey)!;
  }

  // Clean and preprocess text for better accuracy
  const cleanedText = preprocessText(text);
  
  // Try primary model first (RoBERTa - most accurate for social media)
  try {
    const result = await analyzeWithModel(cleanedText, MODELS[0]);
    if (result) {
      sentimentCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('Primary model failed, trying backup...', error);
  }

  // Try secondary model
  try {
    const result = await analyzeWithModel(cleanedText, MODELS[1]);
    if (result) {
      sentimentCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('Secondary model failed, trying tertiary...', error);
  }

  // Try tertiary model
  try {
    const result = await analyzeWithModel(cleanedText, MODELS[2]);
    if (result) {
      sentimentCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('All AI models failed, using advanced fallback:', error);
  }

  // Fallback to enhanced rule-based analysis
  return analyzeSentimentFallback(cleanedText);
}

/**
 * Preprocess text for better AI understanding
 */
function preprocessText(text: string): string {
  // Normalize whitespace
  let cleaned = text.trim().replace(/\s+/g, ' ');
  
  // Keep emojis and special characters (important for sentiment)
  // Remove excessive punctuation only
  cleaned = cleaned.replace(/([!?.])\1{3,}/g, '$1$1$1');
  
  // Expand common contractions for better understanding
  const contractions: Record<string, string> = {
    "won't": "will not",
    "can't": "cannot",
    "n't": " not",
    "'re": " are",
    "'ve": " have",
    "'ll": " will",
    "'d": " would",
    "'m": " am",
  };
  
  for (const [contraction, expansion] of Object.entries(contractions)) {
    cleaned = cleaned.replace(new RegExp(contraction, 'gi'), expansion);
  }
  
  return cleaned;
}

/**
 * Analyze with specific model
 */
async function analyzeWithModel(text: string, modelName: string): Promise<'Positive' | 'Negative' | 'Neutral' | null> {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const results: HuggingFaceResponse[][] = await response.json();
    
    if (!results || !results[0] || results[0].length === 0) {
      return null;
    }

    // Get the sentiment with highest confidence
    const sortedResults = results[0].sort((a, b) => b.score - a.score);
    const topSentiment = sortedResults[0];
    
    // Only accept if confidence is reasonable
    if (topSentiment.score < 0.4) {
      // Low confidence, check if neutral with context
      return interpretLowConfidence(text, sortedResults);
    }

    // Map labels (different models use different labels)
    const label = topSentiment.label.toUpperCase();
    
    if (label.includes('POS') || label === 'POSITIVE' || label === 'LABEL_2') {
      return 'Positive';
    } else if (label.includes('NEG') || label === 'NEGATIVE' || label === 'LABEL_0') {
      return 'Negative';
    } else if (label.includes('NEU') || label === 'NEUTRAL' || label === 'LABEL_1') {
      return 'Neutral';
    }
    
    // If score difference between top 2 is small, consider neutral
    if (sortedResults.length > 1 && (topSentiment.score - sortedResults[1].score) < 0.1) {
      return 'Neutral';
    }

    return label.includes('POS') ? 'Positive' : label.includes('NEG') ? 'Negative' : 'Neutral';
  } catch (error) {
    return null;
  }
}

/**
 * Interpret low confidence results with context
 */
function interpretLowConfidence(
  text: string, 
  results: HuggingFaceResponse[]
): 'Positive' | 'Negative' | 'Neutral' {
  // Check for questions (usually neutral)
  if (text.includes('?') && text.length < 100) {
    return 'Neutral';
  }
  
  // Check for simple acknowledgments (neutral)
  const neutralPhrases = ['ok', 'okay', 'i see', 'got it', 'alright', 'noted', 'understood'];
  if (neutralPhrases.some(phrase => text.toLowerCase().trim() === phrase)) {
    return 'Neutral';
  }
  
  // If all scores are close, it's genuinely neutral
  if (results.length >= 2) {
    const maxDiff = Math.max(...results.map(r => r.score)) - Math.min(...results.map(r => r.score));
    if (maxDiff < 0.2) {
      return 'Neutral';
    }
  }
  
  // Return the highest even if confidence is low
  const top = results[0];
  const label = top.label.toUpperCase();
  if (label.includes('POS') || label === 'POSITIVE' || label === 'LABEL_2') {
    return 'Positive';
  } else if (label.includes('NEG') || label === 'NEGATIVE' || label === 'LABEL_0') {
    return 'Negative';
  }
  
  return 'Neutral';
}

/**
 * Batch analyze multiple texts with rate limiting
 */
export async function batchAnalyzeWithAI(
  texts: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Array<'Positive' | 'Negative' | 'Neutral'>> {
  const results: Array<'Positive' | 'Negative' | 'Neutral'> = [];
  const batchSize = 10; // Process 10 at a time
  const delayMs = 1000; // 1 second delay between batches

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(text => analyzeWithAI(text))
    );
    
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, texts.length), texts.length);
    }

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Advanced rule-based fallback sentiment analysis (human-like)
 */
function analyzeSentimentFallback(text: string): 'Positive' | 'Negative' | 'Neutral' {
  if (!text || text.trim().length === 0) return 'Neutral';

  // Enhanced sentiment lexicons with stemming support
  const sentimentLexicon = {
    strongPositive: [
      'love', 'loved', 'loving', 'amazing', 'awesome', 'excellent', 'fantastic',
      'brilliant', 'outstanding', 'incredible', 'perfect', 'wonderful', 'great',
      'beautiful', 'masterpiece', 'phenomenal', 'spectacular', 'best', 'favorite'
    ],
    moderatePositive: [
      'good', 'nice', 'helpful', 'useful', 'thank', 'thanks', 'appreciate',
      'like', 'liked', 'enjoy', 'enjoyed', 'cool', 'interesting', 'impressive',
      'glad', 'happy', 'pleased', 'satisfied', 'informative', 'clear'
    ],
    strongNegative: [
      'hate', 'hated', 'hating', 'terrible', 'horrible', 'awful', 'worst',
      'disgusting', 'pathetic', 'trash', 'garbage', 'useless', 'disaster',
      'nightmare', 'appalling', 'dreadful', 'atrocious'
    ],
    moderateNegative: [
      'bad', 'poor', 'disappointing', 'disappointed', 'boring', 'bored',
      'annoying', 'annoyed', 'frustrating', 'frustrated', 'confusing', 'confused',
      'waste', 'fail', 'failed', 'sucks', 'dislike', 'wrong', 'unclear'
    ]
  };

  // Comprehensive emoji sentiment (with skin tone variants)
  const emojiSentiment: Record<string, number> = {
    // Strong positive
    '❤️': 3, '😍': 3, '🥰': 3, '😘': 3, '💖': 3, '💕': 3, '�': 3,
    '�🔥': 2.5, '💯': 2.5, '⭐': 2.5, '🌟': 2.5, '✨': 2.5, '🏆': 2.5,
    '👍': 2, '👏': 2, '🙌': 2, '�': 2, '🎉': 2, '🎊': 2, '✅': 2,
    '😊': 1.8, '😁': 1.8, '😃': 1.8, '😄': 1.8, '�': 1.5, '😌': 1.5,
    '🙏': 1.5, '👌': 1.5, '😀': 1.5,
    // Strong negative
    '�💩': -3, '🤮': -3, '🤬': -3, '😡': -2.5, '😠': -2.5, '🤢': -2.5,
    '👎': -2, '😤': -2, '💔': -2, '❌': -2,
    '😢': -1.8, '😭': -1.8, '�': -1.5, '😔': -1.5, '😟': -1.5, '😕': -1.5
  };

  // Enhanced negation handling
  const negations = [
    'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
    "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't",
    "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't"
  ];

  // Context modifiers
  const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'totally', 'so', 'super'];
  const diminishers = ['slightly', 'somewhat', 'kind of', 'sort of', 'a bit', 'little'];
  
  // Questions and neutral patterns
  const isQuestion = text.includes('?') && text.split('?').length <= 2;
  const neutralPatterns = [
    /^(ok|okay|alright|noted|got it|i see|understood|cool)[\s\.\!]*$/i,
    /^(first|1st|early|here)[\s\.\!]*$/i,
    /^(what|when|where|who|why|how)/i,
  ];

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).map(w => w.replace(/[^\w'-]/g, ''));
  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  // Check for neutral patterns first
  if (neutralPatterns.some(pattern => pattern.test(text.trim()))) {
    return 'Neutral';
  }

  // Word-by-word analysis with context
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const nextWord = i < words.length - 1 ? words[i + 1] : '';
    
    let hasNegation = negations.includes(prevWord);
    let hasIntensifier = intensifiers.includes(prevWord);
    let hasDiminisher = diminishers.includes(prevWord) || diminishers.some(d => d.includes(prevWord));
    
    let wordScore = 0;
    
    // Check sentiment
    if (sentimentLexicon.strongPositive.some(w => word.includes(w) || w.includes(word))) {
      wordScore = 3;
      positiveCount++;
    } else if (sentimentLexicon.moderatePositive.some(w => word.includes(w) || w.includes(word))) {
      wordScore = 1.8;
      positiveCount++;
    } else if (sentimentLexicon.strongNegative.some(w => word.includes(w) || w.includes(word))) {
      wordScore = -3;
      negativeCount++;
    } else if (sentimentLexicon.moderateNegative.some(w => word.includes(w) || w.includes(word))) {
      wordScore = -1.8;
      negativeCount++;
    }
    
    // Apply modifiers
    if (wordScore !== 0) {
      if (hasIntensifier) wordScore *= 1.5;
      if (hasDiminisher) wordScore *= 0.6;
      if (hasNegation) wordScore *= -0.9; // Reverse but keep some magnitude
      
      score += wordScore;
    }
  }

  // Emoji analysis with more weight
  let emojiScore = 0;
  for (const [emoji, value] of Object.entries(emojiSentiment)) {
    const count = (text.match(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    emojiScore += count * value;
  }
  score += emojiScore;

  // Exclamation boost
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 0 && Math.abs(score) > 0) {
    score *= (1 + Math.min(exclamations * 0.1, 0.3));
  }

  // ALL CAPS boost
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 5) {
    score *= 1.2;
  }

  // Normalize by word count
  const wordCount = words.filter(w => w.length > 0).length;
  let normalizedScore = wordCount > 3 ? score / Math.sqrt(wordCount) : score;

  // Handle questions differently
  if (isQuestion && Math.abs(normalizedScore) < 1.5) {
    return 'Neutral';
  }

  // Mixed sentiment detection
  if (positiveCount > 0 && negativeCount > 0) {
    // Has both positive and negative words
    if (Math.abs(normalizedScore) < 1.5) {
      return 'Neutral';
    }
  }

  // Final thresholds (more lenient for positive, stricter for negative)
  if (normalizedScore >= 1.2) return 'Positive';
  if (normalizedScore <= -1.2) return 'Negative';
  if (normalizedScore > 0.4) return 'Positive'; // Lean towards positive if slightly positive
  if (normalizedScore < -0.6) return 'Negative'; // More evidence needed for negative
  
  return 'Neutral';
}
