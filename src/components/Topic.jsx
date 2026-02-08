import { useState, useRef, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSheetStore } from '../store/useSheetStore';
import { useToastStore } from './Toast';
import { useClickOutside } from '../hooks/UseCustomHooks';
import SubTopic from './SubTopic';
import { GripVertical, ChevronRight, Edit2, Trash2, Check, X, Plus } from 'lucide-react';

const Topic = memo(({ topic }) => {
  const [subTitle, setSubTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const [isExpanded, setIsExpanded] = useState(true);
  const editInputRef = useRef(null);

  const { addSubTopic, deleteTopic, editTopic, reorderSubTopics } = useSheetStore();
  const { addToast } = useToastStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

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

  const handleAddSubTopic = () => {
    if (!subTitle.trim()) {
      addToast('Please enter a sub-topic name', 'warning');
      return;
    }
    addSubTopic(topic.id, subTitle.trim());
    setSubTitle('');
    addToast('Sub-topic added successfully', 'success');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${topic.title}" and all its content?`)) {
      deleteTopic(topic.id);
      addToast('Topic deleted', 'success');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== topic.title) {
      editTopic(topic.id, editTitle.trim());
      addToast('Topic updated', 'success');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(topic.title);
      setIsEditing(false);
    }
  };

  const handleSubTopicKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddSubTopic();
    }
  };

  const handleSubTopicDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topic.subTopics.findIndex((s) => s.id === active.id);
    const newIndex = topic.subTopics.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(topic.subTopics, oldIndex, newIndex);
    reorderSubTopics(topic.id, newOrder);
  };

  // Calculate statistics
  const totalQuestions = topic.subTopics.reduce(
    (sum, sub) => sum + sub.questions.length,
    0
  );
  const completedQuestions = topic.subTopics.reduce(
    (sum, sub) => sum + sub.questions.filter((q) => q.completed).length,
    0
  );
  const progressPercentage =
    totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group glass border-2 border-border p-6 mt-6 rounded-xl shadow-2xl hover:border-primary/50 transition-all duration-300 card-hover"
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-6 h-6" />
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted hover:text-primary transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Topic Title */}
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-xl font-bold text-white bg-surface border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <h2 className="text-xl font-bold text-white">{topic.title}</h2>
          )}
        </div>

        {/* Statistics */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-medium">{topic.subTopics.length}</span>
            <span className="text-muted">sub-topics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {completedQuestions}/{totalQuestions} completed
            </span>
            {totalQuestions > 0 && (
              <div className="w-20 h-2 bg-surface rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-success to-emerald-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setEditTitle(topic.title);
                  setIsEditing(false);
                }}
                className="p-2 text-muted hover:bg-surfaceHover rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Add Sub-topic Input */}
          <div className="flex gap-2">
            <input
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              onKeyDown={handleSubTopicKeyDown}
              placeholder="Add a new sub-topic..."
              className="flex-1 px-3 py-2 bg-surface border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-muted"
            />
            <button
              onClick={handleAddSubTopic}
              className="px-6 py-2 bg-primary hover:bg-accent text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-primary/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Sub-topic
            </button>
          </div>

          {/* Sub-topics List with Drag and Drop */}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleSubTopicDragEnd}>
            <SortableContext
              items={topic.subTopics.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {topic.subTopics.map((sub) => (
                <SubTopic key={sub.id} sub={sub} topicId={topic.id} />
              ))}
            </SortableContext>
          </DndContext>

          {topic.subTopics.length === 0 && (
            <div className="text-center py-8 text-muted italic border-2 border-dashed border-border rounded-lg bg-surface">
              No sub-topics yet. Add one above to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Topic.displayName = 'Topic';

export default Topic;