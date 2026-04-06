interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

const CATEGORIES = [
  'Géographie', 'Histoire', 'Science', 'Arts', 'Sports', 
  'Culture Générale', 'Célébrités', 'Télévision', 'Gastronomie', 'Jeux Vidéo'
] as const;

export function CategorySelector({ selectedCategories, onCategoryChange }: CategorySelectorProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="category-tags">
      {CATEGORIES.map(category => (
        <button
          key={category}
          className={`category-tag ${selectedCategories.includes(category) ? 'selected' : ''}`}
          onClick={() => toggleCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
