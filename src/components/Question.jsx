import { useState, useRef, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSheetStore } from '../store/useSheetStore';
import { useToastStore } from './Toast';
import { useClickOutside } from '../hooks/UseCustomHooks';
import { GripVertical, Edit2, Trash2, Check, X } from 'lucide-react';

const Question = memo(({ question, topicId, subId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.text);
  const editInputRef = useRef(null);
  
  const { deleteQuestion, editQuestion, toggleQuestionComplete } = useSheetStore();
  const { addToast } = useToastStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useClickOutside(editInputRef, () => {
    if (isEditing) {
      handleSaveEdit();
    }
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(topicId, subId, question.id);
      addToast('Question deleted successfully', 'success');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== question.text) {
      editQuestion(topicId, subId, question.id, editText.trim());
      addToast('Question updated', 'success');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(question.text);
      setIsEditing(false);
    }
  };

  const handleToggleComplete = () => {
    toggleQuestionComplete(topicId, subId, question.id);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-muted/20 text-muted border-muted/30';
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted/20 text-muted border-muted/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group ml-6 mt-2 p-3 rounded-lg border transition-all duration-200
        ${question.completed ? 'bg-success/10 border-success/30' : 'glass border-border'}
        hover:shadow-lg hover:border-primary/50
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={question.completed}
          onChange={handleToggleComplete}
          className="mt-1 w-5 h-5 rounded border-border text-success focus:ring-success cursor-pointer bg-surface"
          aria-label="Mark as complete"
        />

        {/* Question Text */}
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 bg-surface border-2 border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
          ) : (
            <div>
              <span
                className={`
                  ${question.completed ? 'line-through text-muted' : 'text-slate-200'}
                  text-sm
                `}
              >
                {question.text}
              </span>
              {question.difficulty && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-1 text-success hover:bg-success/10 rounded transition-colors"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditText(question.text);
                  setIsEditing(false);
                }}
                className="p-1 text-muted hover:bg-surfaceHover rounded transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Question metadata */}
      {question.createdAt && (
        <div className="mt-2 text-xs text-muted ml-9">
          Added: {new Date(question.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
});

Question.displayName = 'Question';

export default Question;