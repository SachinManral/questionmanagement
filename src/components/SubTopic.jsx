import { useState, useRef, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSheetStore } from '../store/useSheetStore';
import { useToastStore } from './Toast';
import { useClickOutside } from '../hooks/UseCustomHooks';
import Question from './Question';
import { GripVertical, ChevronRight, Edit2, Trash2, Check, X, Plus } from 'lucide-react';

const SubTopic = memo(({ sub, topicId }) => {
  const [questionText, setQuestionText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(sub.title);
  const [isExpanded, setIsExpanded] = useState(true);
  const editInputRef = useRef(null);

  const { addQuestion, deleteSubTopic, editSubTopic, reorderQuestions } = useSheetStore();
  const { addToast } = useToastStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub.id });

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

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      addToast('Please enter a question', 'warning');
      return;
    }
    addQuestion(topicId, sub.id, questionText.trim());
    setQuestionText('');
    addToast('Question added successfully', 'success');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${sub.title}" and all its questions?`)) {
      deleteSubTopic(topicId, sub.id);
      addToast('Sub-topic deleted', 'success');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== sub.title) {
      editSubTopic(topicId, sub.id, editTitle.trim());
      addToast('Sub-topic updated', 'success');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(sub.title);
      setIsEditing(false);
    }
  };

  const handleQuestionKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddQuestion();
    }
  };

  const handleQuestionDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sub.questions.findIndex((q) => q.id === active.id);
    const newIndex = sub.questions.findIndex((q) => q.id === over.id);

    const newOrder = arrayMove(sub.questions, oldIndex, newIndex);
    reorderQuestions(topicId, sub.id, newOrder);
  };

  const completedCount = sub.questions.filter((q) => q.completed).length;
  const totalCount = sub.questions.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group ml-6 mt-4 border-l-4 border-primary pl-4 bg-gradient-to-r from-primary/10 to-transparent rounded-r-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted hover:text-primary transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Sub-topic Title */}
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 font-semibold text-primary bg-surface border-2 border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <h3 className="font-semibold text-primary text-lg">{sub.title}</h3>
          )}
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {completedCount}/{totalCount}
          </span>
          {totalCount > 0 && (
            <div className="w-16 h-2 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-1 text-success hover:bg-success/10 rounded"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditTitle(sub.title);
                  setIsEditing(false);
                }}
                className="p-1 text-muted hover:bg-surfaceHover rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-1 text-accent hover:bg-accent/10 rounded"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Add Question Input */}
          <div className="flex gap-2">
            <input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onKeyDown={handleQuestionKeyDown}
              placeholder="Add a new question..."
              className="flex-1 px-3 py-2 bg-surface border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-muted"
            />
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-primary/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Questions List with Drag and Drop */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
            <SortableContext
              items={sub.questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {sub.questions.map((q) => (
                <Question key={q.id} question={q} topicId={topicId} subId={sub.id} />
              ))}
            </SortableContext>
          </DndContext>

          {sub.questions.length === 0 && (
            <div className="text-center py-6 text-muted italic">
              No questions yet. Add one above!
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SubTopic.displayName = 'SubTopic';

export default SubTopic;