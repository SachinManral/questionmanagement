# Codolio Question Sheet - Dark Glass Theme Implementation

## 🎨 Theme Update: Dark Glass Aesthetic

This project has been updated from the orange-themed interface to a **professional Dark Glass palette** with deep blues/grays and neon indigo accents, following Codolio's developer-focused design language.

---

## 🎨 Color Palette

### Primary Colors
```javascript
{
  background: "#0f172a",    // Slate-950 - Main background
  surface: "#1e293b",       // Slate-800 - Card backgrounds
  surfaceHover: "#334155",  // Slate-700 - Hover states
  primary: "#6366f1",       // Indigo-500 - Buttons & primary actions
  accent: "#818cf8",        // Indigo-400 - Hover states & highlights
  success: "#10b981",       // Emerald-500 - Progress & checkmarks
  muted: "#94a3b8",         // Slate-400 - Secondary text
  border: "#1e293b",        // Slate-800 - Borders
}
```

### When to Use Each Color
- **Background (`#0f172a`)**: Main app background
- **Surface (`#1e293b`)**: Cards, modals, input fields
- **Primary (`#6366f1`)**: Call-to-action buttons, links, focus states
- **Accent (`#818cf8`)**: Hover effects, highlights
- **Success (`#10b981`)**: Progress bars, completed items, success indicators
- **Muted (`#94a3b8`)**: Secondary text, placeholders

---

## 📁 Project Architecture

### File Structure (Following Best Practices)

```
src/
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Badge.jsx            # Difficulty tags (Easy/Med/Hard)
│   │   ├── Button.jsx           # Styled button component
│   │   ├── ProgressBar.jsx      # Visual progress indicator
│   │   ├── Input.jsx            # Styled input fields
│   │   └── Modal.jsx            # Modal wrapper
│   │
│   ├── sheet/                   # Core domain logic
│   │   ├── SheetArea.jsx        # Main container with DragContext
│   │   ├── TopicNode.jsx        # Topic accordion component
│   │   ├── SubTopicNode.jsx     # Nested subtopic component
│   │   └── QuestionItem.jsx     # Individual question item
│   │
│   ├── layout/                  # Layout components
│   │   ├── Header.jsx           # Navigation & search
│   │   └── StatsPanel.jsx       # Analytics sidebar
│   │
│   ├── Toast.jsx                # Toast notification system
│   ├── ExportModal.jsx          # Export functionality
│   └── StatsPanel.jsx           # Statistics display
│
├── store/
│   └── useSheetStore.js         # Zustand state manager (normalized)
│
├── hooks/
│   └── UseCustomHooks.js        # Custom React hooks
│
├── services/
│   └── api.js                   # API integration layer
│
├── data/
│   └── sampleData.js            # Initial sample data
│
├── utils/
│   └── cn.js                    # Tailwind class merger (optional)
│
├── App.jsx                      # Main app component
├── main.jsx                     # App entry point
└── index.css                    # Global styles with Dark Glass theme
```

---

## 🏗️ Normalized State Architecture

### Why Normalized State?

Instead of deeply nested arrays, we use a **flat, normalized structure** for O(1) operations:

```javascript
// ❌ BAD: Deeply nested (O(N) operations)
{
  topics: [
    {
      id: '1',
      subTopics: [
        {
          id: '2',
          questions: [...]  // Hard to update nested items
        }
      ]
    }
  ]
}

// ✅ GOOD: Normalized (O(1) operations)
{
  topics: { '1': { id: '1', title: 'Arrays', subTopicIds: ['2'] } },
  subTopics: { '2': { id: '2', title: 'Sorting', questionIds: ['q1'] } },
  questions: { 'q1': { id: 'q1', text: 'Two Sum', status: 'done' } },
  topicOrder: ['1', '2']  // Defines visual order
}
```

### Benefits
1. **Performance**: Direct access to any item by ID
2. **Immutability**: Easier to create new state without deep cloning
3. **Scalability**: Handles 1000+ items efficiently
4. **DnD Optimization**: Reordering only updates the order array

---

## 🎯 Key Features Implemented

### 1. Dark Glass UI Components

#### Topic Node (Accordion)
- **Header**: Title + completion badge (e.g., "2/5 Done")
- **Progress Bar**: Thin emerald line showing completion %
- **Inline Edit**: Double-click to edit (no modals)
- **Glass Effect**: Translucent background with backdrop blur

#### Question Item
- **Custom Checkbox**: SVG with pulse animation on check
- **Difficulty Badge**: Color-coded dot (Green/Yellow/Red)
- **Hover Handle**: Drag icon appears only on hover
- **Glass Morphism**: Subtle transparency with indigo borders

### 2. Drag & Drop (@dnd-kit)

```javascript
// Wrapped in DndContext
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  <SortableContext items={items}>
    {/* Draggable items */}
  </SortableContext>
</DndContext>
```

**Visual Cues**:
- Rotate item slightly while dragging (`rotate-2`)
- High shadow (`shadow-2xl`)
- Opacity change (`opacity-50`)

### 3. Bonus Features

#### Focus Mode ✨
- Filter list to show only incomplete questions
- Toggle in Header component
- Helps students focus before interviews

#### Search & Filter
- Real-time search across topics, subtopics, and questions
- Highlights matching results
- Responsive filtering

#### Undo/Redo System
- Keyboard shortcuts: `Ctrl+Z` / `Ctrl+Shift+Z`
- History limited to last 50 states
- Visual indicators when undo/redo available

#### Export Functionality
- **JSON Export**: Raw data backup
- **HTML/PDF Export**: Beautiful formatted document
- Includes statistics and progress tracking

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install zustand @dnd-kit/core @dnd-kit/sortable lucide-react

# Start development server
npm run dev
```

### Required Dependencies

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

---

## 💡 Design Decisions

### 1. Why Dark Glass Theme?
- **Developer-focused**: Professional aesthetic favored by coders
- **Eye comfort**: Reduced eye strain for long coding sessions
- **Modern**: Aligns with current design trends (2024-2025)
- **Branding**: Matches Codolio's visual identity

### 2. Why Zustand over Redux?
- **Simplicity**: Less boilerplate code
- **Performance**: Built-in optimization
- **TypeScript**: Better type inference
- **Size**: Smaller bundle (~1KB)

### 3. Why @dnd-kit?
- **Modern**: Built for React 18+
- **Accessible**: WCAG compliant
- **Flexible**: Supports complex layouts
- **Performant**: Uses CSS transforms

### 4. Component Composition
- **Atomic Design**: ui/ folder contains reusable atoms
- **Feature-based**: sheet/ folder groups related components
- **Separation of Concerns**: Logic (store) vs Presentation (components)

---

## 🎨 Styling Guidelines

### Using Theme Colors

```jsx
// ✅ Good - Using theme colors
<div className="bg-surface border border-border">
  <button className="bg-primary hover:bg-accent">Click</button>
</div>

// ❌ Avoid - Hardcoded colors
<div className="bg-slate-800 border border-slate-700">
  <button className="bg-indigo-500 hover:bg-indigo-400">Click</button>
</div>
```

### Glass Morphism Effect

```jsx
<div className="glass">
  {/* Applies: backdrop-blur + translucent bg + subtle border */}
</div>
```

### Neon Glow Effect

```jsx
<button className="neon-glow">
  {/* Applies indigo glow on hover */}
</button>
```

---

## 🧪 Testing Checklist

- [ ] Topics can be created, edited, deleted
- [ ] Subtopics can be created, edited, deleted
- [ ] Questions can be created, edited, deleted
- [ ] Drag and drop reorders items correctly
- [ ] Search filters results in real-time
- [ ] Undo/Redo works with keyboard shortcuts
- [ ] Export generates valid JSON and HTML
- [ ] Progress bars update on completion toggle
- [ ] Toast notifications appear and dismiss
- [ ] All hover states work correctly
- [ ] Mobile responsive (if implemented)

---

## 📈 Performance Optimization

### Implemented
- **Memoization**: `useMemo` for filtered lists
- **Normalized State**: O(1) lookups
- **Code Splitting**: Dynamic imports (if needed)
- **Debounced Search**: 300ms delay on search input

### Future Improvements
- Virtual scrolling for 1000+ items
- Service worker for offline support
- IndexedDB for large datasets
- React.lazy for route-based splitting

---

## 🔧 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
extend: {
  colors: {
    primary: "#your-color",
    accent: "#your-color",
    // ...
  }
}
```

### Adding New Question Fields

1. Update sample data structure in `data/sampleData.js`
2. Modify Zustand store actions in `store/useSheetStore.js`
3. Update UI components in `components/sheet/`

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🤝 Contributing

This is a learning project following professional architecture patterns. Contributions welcome!

1. Follow the file structure
2. Use theme colors from config
3. Write descriptive commit messages
4. Test drag-and-drop thoroughly

---

## 📄 License

MIT License - Feel free to use for learning and portfolio projects

---

**Built with ❤️ using React, Zustand, dnd-kit, Tailwind CSS & Lucide Icons**