'use client';

import { useState } from 'react';

interface CommentReactionsProps {
  commentId: string;
  initialReactions?: Record<string, number>;
  onReactionSuccess?: () => void;
}

const EMOJI_OPTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🔥', label: 'Fire' },
];

export default function CommentReactions({
  commentId,
  initialReactions = {},
  onReactionSuccess,
}: CommentReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({
    '👍': initialReactions['👍'] || 0,
    '❤️': initialReactions['❤️'] || 0,
    '😂': initialReactions['😂'] || 0,
    '🔥': initialReactions['🔥'] || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReact(emoji: string) {
    if (isSubmitting) return;

    // Optimistic Update
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/comments/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, emoji }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment?.reactions) {
          setReactions(data.comment.reactions);
        }
        if (onReactionSuccess) {
          onReactionSuccess();
        }
      }
    } catch {
      // Revert upon error
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 1) - 1),
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
      <span className="text-[11px] text-gray-400 font-medium mr-1">React:</span>
      {EMOJI_OPTIONS.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReact(emoji)}
            disabled={isSubmitting}
            title={`React with ${label}`}
            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-all duration-150 active:scale-95 ${
              count > 0
                ? 'bg-blue-50/80 border-blue-200 text-blue-800 hover:bg-blue-100 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-semibold text-[11px]">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
