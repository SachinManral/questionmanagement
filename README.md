# Codolio Question Sheet

## Theme Update

Switched from the orange theme to a dark glass aesthetic with deep blues and grays. The new design uses indigo accents and feels more professional overall.

## Color Palette

### Primary Colors

```javascript
{
  background: "#0f172a",    // Main background
  surface: "#1e293b",       // Card backgrounds
  surfaceHover: "#334155",  // Hover states
  primary: "#6366f1",       // Buttons and primary actions
  accent: "#818cf8",        // Hover states and highlights
  success: "#10b981",       // Progress and checkmarks
  muted: "#94a3b8",         // Secondary text
  border: "#1e293b",        // Borders
}
```

### Usage

- **Background** - Main app background
- **Surface** - Cards, modals, input fields
- **Primary** - Call-to-action buttons, links, focus states
- **Accent** - Hover effects, highlights
- **Success** - Progress bars, completed items, success indicators
- **Muted** - Secondary text, placeholders

## Project Structure

```
src/
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Badge.jsx            # Difficulty tags
│   │   ├── Button.jsx           # Styled buttons
│   │   ├── ProgressBar.jsx      # Progress indicator
│   │   ├── Input.jsx            # Input fields
│   │   └── Modal.jsx            # Modal wrapper
│   │
│   ├── sheet/                   # Core functionality
│   │   ├── SheetArea.jsx        # Main container with drag/drop
│   │   ├── TopicNode.jsx        # Topic accordion
│   │   ├── SubTopicNode.jsx     # Nested subtopic
│   │   └── QuestionItem.jsx     # Individual question
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header.jsx           # Navigation and search
│   │   └── StatsPanel.jsx       # Analytics sidebar
│   │
│   ├── Toast.jsx                # Notifications
│   ├── ExportModal.jsx          # Export functionality
│   └── StatsPanel.jsx           # Statistics display
│
├── store/
│   └── useSheetStore.js         # Zustand state manager
│
├── hooks/
│   └── UseCustomHooks.js        # Custom React hooks
│
├── services/
│   └── api.js                   # API integration
│
├── data/
│   └── sampleData.js            # Sample data
│
├── utils/
│   └── cn.js                    # Tailwind class merger
│
├── App.jsx                      # Main app
├── main.jsx                     # Entry point
└── index.css                    # Global styles
```

## State Management

Using a normalized state structure instead of deeply nested arrays. This makes updates much faster since you can access any item directly by ID.

### Normalized vs Nested

```javascript
// Nested (slow for updates)
{
  topics: [
    {
      id: '1',
      subTopics: [
        {
          id: '2',
          questions: [...]  // Have to traverse the whole tree
        }
      ]
    }
  ]
}

// Normalized (fast lookups)
{
  topics: { '1': { id: '1', title: 'Arrays', subTopicIds: ['2'] } },
  subTopics: { '2': { id: '2', title: 'Sorting', questionIds: ['q1'] } },
  questions: { 'q1': { id: 'q1', text: 'Two Sum', status: 'done' } },
  topicOrder: ['1', '2']
}
```

Benefits:
- Direct access to any item
- Easier immutable updates
- Better performance with large datasets
- Makes drag and drop simpler

## Features

### Dark Glass UI

Each component uses translucent backgrounds with backdrop blur for that glass effect. Topics show completion badges and progress bars. Questions have custom checkboxes with animations.

### Drag and Drop

Built with @dnd-kit. Items rotate slightly while being dragged and have visual feedback. The whole thing feels pretty smooth.

### Focus Mode

Filter the list to only show incomplete questions. Helpful when you're trying to grind through problems.

### Search and Filter

Real-time search that works across topics, subtopics, and questions. Just start typing.

### Undo/Redo

Standard keyboard shortcuts work - Ctrl+Z and Ctrl+Shift+Z. Keeps the last 50 states in history.

### Export

Two options:
- JSON export for backups
- HTML export that you can print to PDF

## Setup

```bash
npm install zustand @dnd-kit/core @dnd-kit/sortable lucide-react
npm run dev
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "zustand": "^4.4.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

## Design Choices

### Why dark glass theme?

Looks professional and is easier on the eyes during long sessions. Also matches what most developers prefer these days.

### Why Zustand?

Less boilerplate than Redux. Smaller bundle size. Better TypeScript support out of the box.

### Why @dnd-kit?

Works well with React 18. Has good accessibility support. Flexible enough for complex layouts.

### Component organization

The ui folder has reusable stuff. The sheet folder groups related components together. Trying to keep logic separate from presentation.

## Styling

### Use theme colors

```jsx
// Good
<div className="bg-surface border border-border">
  <button className="bg-primary hover:bg-accent">Click</button>
</div>

// Not good
<div className="bg-slate-800 border border-slate-700">
  <button className="bg-indigo-500 hover:bg-indigo-400">Click</button>
</div>
```

### Glass effect

```jsx
<div className="glass">
  {/* Adds backdrop blur and translucent background */}
</div>
```

### Glow effect

```jsx
<button className="neon-glow">
  {/* Adds indigo glow on hover */}
</button>
```

## Testing

Things to check:
- Create, edit, delete topics/subtopics/questions
- Drag and drop reordering
- Search filtering
- Undo/Redo shortcuts
- Export to JSON and HTML
- Progress bars updating
- Toast notifications
- Hover states
- Mobile responsiveness

## Performance

What's already done:
- Memoization with useMemo for filtered lists
- Normalized state for O(1) lookups
- Debounced search with 300ms delay

Could add later:
- Virtual scrolling for huge lists
- Service worker for offline use
- IndexedDB for bigger datasets
- Code splitting by route

## Customization

### Change colors

Edit tailwind.config.js:

```javascript
extend: {
  colors: {
    primary: "#your-color",
    accent: "#your-color",
  }
}
```

### Add question fields

1. Update sampleData.js
2. Modify store actions in useSheetStore.js
3. Update UI components

## Resources

- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand)
- [@dnd-kit](https://docs.dndkit.com/)
- [Lucide Icons](https://lucide.dev/)

## Contributing

This is mostly a learning project. If you want to contribute:
- Follow the existing file structure
- Use the theme colors
- Write clear commit messages
- Test drag and drop carefully

## License

MIT - use it for whatever you want

Built with React, Zustand, dnd-kit, Tailwind CSS, and Lucide Icons