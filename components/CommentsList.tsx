'use client';

import { CommentData } from '@/types/youtube';
import { formatDateDetailed } from '@/lib/utils';
import { downloadCSV, prepareCommentsForExport } from '@/lib/export-utils';
import { batchAnalyzeWithAI } from '@/lib/sentiment-ai';
import Image from 'next/image';
import { ThumbsUp, Download, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CommentsListProps {
  comments: CommentData[];
  sentiments?: string[];
}

// Ultra-advanced sentiment analysis with multi-layer processing
function analyzeSentiment(text: string): 'Positive' | 'Negative' | 'Neutral' {
  if (!text || text.trim().length === 0) return 'Neutral';

  // Comprehensive lexicons with precise weights
  const sentimentLexicon = {
    // Extremely positive (weight: 3)
    extremelyPositive: [
      'masterpiece', 'phenomenal', 'exceptional', 'extraordinary', 'magnificent',
      'spectacular', 'breathtaking', 'mindblowing', 'lifechanging', 'gamechanging',
      'revolutionary', 'legendary', 'epic', 'flawless', 'perfection', 'godlike',
      'unbelievable', 'incredible', 'miraculous', 'stunning'
    ],
    
    // Very positive (weight: 2.5)
    veryPositive: [
      'excellent', 'amazing', 'outstanding', 'fantastic', 'brilliant', 'superb',
      'wonderful', 'marvelous', 'fabulous', 'splendid', 'terrific', 'tremendous',
      'remarkable', 'impressive', 'inspiring', 'beautiful', 'genius', 'perfect'
    ],
    
    // Positive (weight: 2)
    positive: [
      'great', 'awesome', 'love', 'loved', 'loving', 'best', 'favorite',
      'appreciate', 'appreciated', 'helpful', 'valuable', 'informative',
      'insightful', 'enlightening', 'educational', 'clear', 'concise',
      'recommended', 'recommend', 'enjoyed', 'enjoying', 'wonderful'
    ],
    
    // Moderately positive (weight: 1.5)
    moderatelyPositive: [
      'good', 'nice', 'fine', 'pleased', 'glad', 'happy', 'satisfied',
      'useful', 'interesting', 'solid', 'decent', 'cool', 'neat', 'sweet',
      'like', 'liked', 'liking', 'better', 'improved', 'positive', 'benefit'
    ],
    
    // Mildly positive (weight: 1)
    mildlyPositive: [
      'okay', 'ok', 'alright', 'fair', 'acceptable', 'adequate', 'sufficient',
      'thanks', 'thank', 'thankyou', 'grateful', 'gratitude', 'appreciate'
    ],

    // Extremely negative (weight: -3)
    extremelyNegative: [
      'catastrophic', 'disastrous', 'abysmal', 'atrocious', 'deplorable',
      'abominable', 'detestable', 'repulsive', 'disgusting', 'revolting',
      'horrific', 'horrendous', 'nightmarish', 'unbearable', 'intolerable'
    ],
    
    // Very negative (weight: -2.5)
    veryNegative: [
      'terrible', 'horrible', 'awful', 'dreadful', 'appalling', 'pathetic',
      'miserable', 'horrifying', 'shocking', 'outrageous', 'unacceptable'
    ],
    
    // Negative (weight: -2)
    negative: [
      'bad', 'worst', 'hate', 'hated', 'hating', 'poor', 'disappointing',
      'disappointed', 'frustrating', 'frustrated', 'annoying', 'annoyed',
      'useless', 'worthless', 'pointless', 'waste', 'wasted', 'fail', 'failed',
      'sucks', 'sucked', 'suck', 'crap', 'trash', 'garbage', 'rubbish'
    ],
    
    // Moderately negative (weight: -1.5)
    moderatelyNegative: [
      'dislike', 'disliked', 'boring', 'bored', 'dull', 'tedious', 'tiresome',
      'confusing', 'confused', 'unclear', 'difficult', 'hard', 'complicated',
      'misleading', 'misled', 'wrong', 'incorrect', 'inaccurate', 'flawed'
    ],
    
    // Mildly negative (weight: -1)
    mildlyNegative: [
      'meh', 'blah', 'whatever', 'slow', 'long', 'short', 'lacking',
      'missing', 'repetitive', 'redundant', 'outdated', 'old', 'weak'
    ]
  };

  // Enhanced emoji detection with precise sentiment values
  const emojiSentiment: Record<string, number> = {
    // Strong positive
    '❤️': 3, '�': 3, '🥰': 3, '🤩': 3, '�': 3, '�': 3, '�': 3, '�': 3, '�': 3,
    '🔥': 2.5, '💯': 2.5, '🏆': 2.5, '👑': 2.5, '⭐': 2.5, '�': 2.5, '✨': 2.5,
    '�': 2, '👏': 2, '🙌': 2, '💪': 2, '🎉': 2, '🎊': 2, '🎆': 2, '✅': 2, '✔️': 2,
    '😊': 1.5, '😁': 1.5, '😃': 1.5, '😄': 1.5, '😀': 1.5, '🙂': 1.5, '😌': 1.5,
    '�': 1.5, '�': 1.5, '👍�': 2, '👍🏼': 2, '👍�': 2, '�🏾': 2, '👍🏿': 2,
    
    // Strong negative
    '💩': -3, '🤮': -3, '🤬': -3, '😡': -2.5, '😠': -2.5, '🤢': -2.5,
    '👎': -2, '😤': -2, '😾': -2, '💔': -2, '❌': -2, '⛔': -2,
    '�': -1.5, '😭': -1.5, '�': -1.5, '�': -1.5, '�': -1.5, '�': -1.5,
    '�': -1.5, '�': -1.5, '😱': -1.5, '�': -1.5, '😩': -1.5, '�': -1.5,
    '👎🏻': -2, '👎🏼': -2, '👎🏽': -2, '�🏾': -2, '�🏿': -2
  };

  // Intensifiers and their multipliers
  const intensifiers: Record<string, number> = {
    'extremely': 2.0, 'incredibly': 2.0, 'absolutely': 1.8, 'completely': 1.8,
    'totally': 1.7, 'utterly': 1.7, 'thoroughly': 1.7, 'perfectly': 1.6,
    'very': 1.5, 'really': 1.5, 'truly': 1.5, 'highly': 1.5, 'genuinely': 1.5,
    'quite': 1.3, 'pretty': 1.3, 'fairly': 1.2, 'rather': 1.2, 'somewhat': 1.1,
    'super': 1.6, 'mega': 1.7, 'ultra': 1.8, 'so': 1.4, 'too': 1.3
  };

  // Diminishers (reduce intensity)
  const diminishers: Record<string, number> = {
    'slightly': 0.5, 'barely': 0.4, 'hardly': 0.4, 'scarcely': 0.4,
    'somewhat': 0.7, 'kind of': 0.7, 'sort of': 0.7, 'kinda': 0.7, 'sorta': 0.7,
    'a bit': 0.8, 'a little': 0.8, 'little': 0.8, 'bit': 0.8
  };

  // Negations (reverse sentiment)
  const negations = [
    'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere', 'none',
    "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't", "couldn't",
    "can't", "cannot", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't",
    "hadn't", "without", "lack', 'lacking", "failed to", "fails to"
  ];

  // Contrastive conjunctions (flip sentiment after them)
  const contrasts = ['but', 'however', 'although', 'though', 'yet', 'except', 'despite'];

  // Parse text
  const lowerText = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let totalScore = 0;
  let sentenceCount = 0;

  // Process each sentence separately for better context
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/).map(w => w.replace(/[^\w'-]/g, ''));
    let sentenceScore = 0;
    let contrastIndex = -1;

    // Find contrast words
    words.forEach((word, idx) => {
      if (contrasts.includes(word)) contrastIndex = idx;
    });

    // Process words with context
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const prev2Word = i > 1 ? words[i - 2] : '';
      const nextWord = i < words.length - 1 ? words[i + 1] : '';

      // Check for negation in previous words (within 3 words)
      const hasNegation = negations.includes(prevWord) || 
                         negations.includes(prev2Word) ||
                         (prevWord + ' ' + word) === 'no longer' ||
                         (prev2Word + ' ' + prevWord) === 'failed to';

      // Check for intensifiers/diminishers
      let modifier = 1.0;
      if (intensifiers[prevWord]) modifier = intensifiers[prevWord];
      if (diminishers[prevWord]) modifier = diminishers[prevWord];
      if (intensifiers[prev2Word]) modifier *= intensifiers[prev2Word];

      // Find sentiment value
      let wordScore = 0;
      
      // Check each sentiment category
      Object.entries(sentimentLexicon).forEach(([category, wordList]) => {
        if (wordList.some(w => word.includes(w) || w.includes(word))) {
          if (category === 'extremelyPositive') wordScore = 3;
          else if (category === 'veryPositive') wordScore = 2.5;
          else if (category === 'positive') wordScore = 2;
          else if (category === 'moderatelyPositive') wordScore = 1.5;
          else if (category === 'mildlyPositive') wordScore = 1;
          else if (category === 'extremelyNegative') wordScore = -3;
          else if (category === 'veryNegative') wordScore = -2.5;
          else if (category === 'negative') wordScore = -2;
          else if (category === 'moderatelyNegative') wordScore = -1.5;
          else if (category === 'mildlyNegative') wordScore = -1;
        }
      });

      // Apply modifiers
      if (wordScore !== 0) {
        wordScore *= modifier;
        if (hasNegation) wordScore *= -0.8; // Reverse but slightly reduce intensity
        
        // If after contrast word, give it more weight
        if (contrastIndex >= 0 && i > contrastIndex) {
          wordScore *= 1.5;
        }
        
        sentenceScore += wordScore;
      }
    }

    totalScore += sentenceScore;
    sentenceCount++;
  });

  // Emoji analysis
  let emojiScore = 0;
  for (const [emoji, value] of Object.entries(emojiSentiment)) {
    const count = (text.match(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    emojiScore += count * value;
  }
  totalScore += emojiScore;

  // Punctuation analysis
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  
  // Multiple exclamation marks amplify sentiment
  if (exclamations > 1 && Math.abs(totalScore) > 0) {
    totalScore *= (1 + Math.min(exclamations * 0.15, 0.6));
  }

  // ALL CAPS analysis (strong emotion)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.5 && text.length > 10) {
    totalScore *= 1.4;
  }

  // Repeated characters (e.g., "sooo good", "baaaaad")
  const repeatedChars = (text.match(/(.)\1{2,}/g) || []).length;
  if (repeatedChars > 0 && Math.abs(totalScore) > 0) {
    totalScore *= (1 + repeatedChars * 0.1);
  }

  // Normalize by sentence count
  const normalizedScore = sentenceCount > 0 ? totalScore / sentenceCount : totalScore;

  // Question handling - questions are usually neutral unless very strong sentiment
  if (questions > exclamations && questions > 0 && Math.abs(normalizedScore) < 2.5) {
    return 'Neutral';
  }

  // Sarcasm detection (limited - very hard to detect perfectly)
  const sarcasmIndicators = ['yeah right', 'sure', 'obviously', 'clearly', 'definitely'];
  const hasSarcasm = sarcasmIndicators.some(indicator => lowerText.includes(indicator));
  if (hasSarcasm && normalizedScore > 1) {
    totalScore *= -0.5; // Flip positive to negative
  }

  // Final classification with dynamic thresholds
  if (normalizedScore >= 1.0) return 'Positive';
  if (normalizedScore <= -1.0) return 'Negative';
  
  // Tighter neutral zone for more accurate classification
  if (normalizedScore > 0.3) return 'Positive';
  if (normalizedScore < -0.3) return 'Negative';
  
  return 'Neutral';
}

export function CommentsList({ comments, sentiments: providedSentiments }: CommentsListProps) {
  const [showAll, setShowAll] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState<'All' | 'Positive' | 'Negative' | 'Neutral'>('All');
  const [allSentiments, setAllSentiments] = useState<Array<'Positive' | 'Negative' | 'Neutral'>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // AI-powered sentiment analysis on component mount
  useEffect(() => {
    if (providedSentiments) {
      setAllSentiments(providedSentiments as Array<'Positive' | 'Negative' | 'Neutral'>);
      return;
    }

    const analyzeSentiments = async () => {
      if (!useAI) {
        // Use rule-based analysis
        const sentiments = comments.map(comment => analyzeSentiment(comment.text));
        setAllSentiments(sentiments);
        return;
      }

      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        // Use AI-powered analysis
        const sentiments = await batchAnalyzeWithAI(
          comments.map(c => c.text),
          (current, total) => {
            setAnalysisProgress(Math.round((current / total) * 100));
          }
        );
        setAllSentiments(sentiments);
      } catch (error) {
        console.error('AI analysis failed, falling back to rule-based:', error);
        // Fallback to rule-based
        const sentiments = comments.map(comment => analyzeSentiment(comment.text));
        setAllSentiments(sentiments);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeSentiments();
  }, [comments, providedSentiments, useAI]);
  
  // Filter comments based on sentiment
  const filteredComments = filterSentiment === 'All' 
    ? comments 
    : comments.filter((_, index) => allSentiments[index] === filterSentiment);
  
  const displayComments = showAll ? filteredComments : filteredComments.slice(0, 50);

  const handleDownloadCSV = () => {
    const exportData = prepareCommentsForExport(comments, allSentiments);
    downloadCSV(exportData, 'comments_with_sentiment');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return '😊';
      case 'Negative': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Comments ({filteredComments.length})
          </h3>
          {useAI && (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI-Powered</span>
            </div>
          )}
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>
      </div>

      {/* AI Analysis Progress */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-blue-900 dark:text-blue-300 font-medium">
              Analyzing sentiment with AI... {analysisProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Sentiment Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterSentiment('All')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterSentiment === 'All'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({comments.length})
        </button>
        <button
          onClick={() => setFilterSentiment('Positive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterSentiment === 'Positive'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          😊 Positive ({allSentiments.filter(s => s === 'Positive').length})
        </button>
        <button
          onClick={() => setFilterSentiment('Neutral')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterSentiment === 'Neutral'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          😐 Neutral ({allSentiments.filter(s => s === 'Neutral').length})
        </button>
        <button
          onClick={() => setFilterSentiment('Negative')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterSentiment === 'Negative'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          😞 Negative ({allSentiments.filter(s => s === 'Negative').length})
        </button>
      </div>
      
      <div className="space-y-4 max-h-[800px] overflow-y-auto">
        {displayComments.map((comment, index) => {
          const originalIndex = comments.indexOf(comment);
          const sentiment = allSentiments[originalIndex];
          
          return (
            <div
              key={comment.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
            >
              <div className="flex items-start space-x-3">
                <Image
                  src={comment.authorProfileImageUrl}
                  alt={comment.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.author}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(sentiment)}`}
                    >
                      {getSentimentEmoji(sentiment)} {sentiment}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateDetailed(comment.publishedAt)}
                    </span>
                  </div>
                  <p
                    className="text-gray-700 dark:text-gray-300 text-sm mb-2"
                    dangerouslySetInnerHTML={{ __html: comment.text }}
                  />
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    <span>{comment.likeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {filteredComments.length > 50 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All {filteredComments.length} Comments
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
