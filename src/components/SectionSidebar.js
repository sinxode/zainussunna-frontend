import React from "react";
import "../styles/SectionSidebar.scss";

function SectionSidebar({ sections, activeId, onNavigate }) {
  return (
    <aside className="section-sidebar">
      <ul>
        {sections.map((sec) => (
          <li
            key={sec.id}
            className={activeId === sec.id ? "active" : ""}
            onClick={() => onNavigate(sec.id)}
          >
            {sec.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default SectionSidebar;
