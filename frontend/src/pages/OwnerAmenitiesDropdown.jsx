import React from "react";
import "../styles/dropdown.css";

export default function MultiSelectDropdown({ 
  title, 
  options = [],
  selectedItems = [],
  setSelectedItems,
  showDropdown,
  setShowDropdown
}) {
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];

  const handleToggle = (item) => {
    const updated = safeSelectedItems.includes(item)
      ? safeSelectedItems.filter(i => i !== item)
      : [...safeSelectedItems, item];
    setSelectedItems(updated);
  };

  return (
    <div className="luxe-dropdown-container">
      <label className="dropdown-label">{title}</label>
      <div className="dropdown-relative">
        <button
          type="button"
          className={`luxe-dropdown-trigger ${showDropdown ? "active" : ""}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>{safeSelectedItems.length > 0 ? `${safeSelectedItems.length} Selected` : `Select ${title}`}</span>
          <span className="arrow">▾</span>
        </button>

        {showDropdown && (
          <div className="luxe-dropdown-menu">
            {options.map((item) => (
              <label key={item} className="dropdown-option">
                <input
                  type="checkbox"
                  checked={safeSelectedItems.includes(item)}
                  onChange={() => handleToggle(item)}
                />
                <span className="custom-check"></span>
                {item}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Selected Items Tags */}
      <div className="selected-tags">
        {safeSelectedItems.map(item => (
          <span key={item} className="luxe-tag">
            {item} <button type="button" onClick={() => handleToggle(item)}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}