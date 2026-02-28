import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RecipeComments({ recipe, currentUser }) {
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', recipe.id],
    queryFn: () => base44.entities.Comment.filter({ recipe_id: recipe.id })
  });

  const submitMutation = useMutation({
    mutationFn: (content) => base44.entities.Comment.create({
      recipe_id: recipe.id,
      content,
      author_name: currentUser?.full_name || 'Anonymous Chef',
      status: currentUser?.role === 'admin' ? 'approved' : 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipe.id] });
      setCommentText('');
      toast.success(currentUser?.role === 'admin' ? 'Comment posted!' : 'Comment submitted for moderation.');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Comment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipe.id] });
    }
  });

  const approvedComments = comments.filter(c => c.status === 'approved');
  const pendingComments = comments.filter(c => c.status === 'pending');
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-[#c5d9c9] shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#6b9b76]" />
        Community Comments
      </h3>

      <div className="space-y-4">
        {approvedComments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-3">
            {approvedComments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-gray-900">{comment.author_name}</span>
                  <span className="text-xs text-gray-400">{format(new Date(comment.created_date || Date.now()), 'MMM d, yyyy')}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && pendingComments.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3 mt-6">
          <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Pending Moderation
          </h4>
          {pendingComments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex-1">
                <span className="font-semibold text-xs text-gray-900">{comment.author_name}</span>
                <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
              </div>
              <div className="flex gap-2 shrink-0 items-start">
                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: comment.id, status: 'approved' })} className="border-green-200 text-green-700 hover:bg-green-50 h-8">
                  <Check className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: comment.id, status: 'rejected' })} className="border-red-200 text-red-700 hover:bg-red-50 h-8">
                  <X className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recipe.id && (
        <div className="space-y-3 pt-4 border-t border-gray-100 mt-6">
          <Textarea 
            value={commentText} 
            onChange={e => setCommentText(e.target.value)}
            placeholder="Share your thoughts, tweaks, or questions about this recipe with the community..."
            className="border-gray-200 focus:border-[#6b9b76] min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => submitMutation.mutate(commentText)} 
              disabled={!commentText.trim() || submitMutation.isPending}
              className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}