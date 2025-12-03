import React, { useCallback, useEffect, useRef } from "react";

type Props = {
  data: {
    firstNameLastName: string;
    jobTitle: string;
    emailAddress: string;
  };
  isSelected: boolean;
  onToggle: () => void;
};

const useIsFirstRender = () => {
  const isFirst = useRef(true);
  useEffect(() => {
    isFirst.current = false;
  }, []);
  return isFirst.current;
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const PersonInfo = React.memo(function PersonInfo({
  data,
  isSelected,
  onToggle,
}: Props) {
  const isFirstRender = useIsFirstRender();
  const previousSelected = useRef(isSelected);
  const [announcement, setAnnouncement] = React.useState("");

  useEffect(() => {
    if (!isFirstRender && previousSelected.current !== isSelected) {
      setAnnouncement(
        `${data.firstNameLastName} ${isSelected ? "selected" : "deselected"}`
      );
      const timer = setTimeout(() => setAnnouncement(""), 1000);
      return () => clearTimeout(timer);
    }
    previousSelected.current = isSelected;
  }, [isSelected, data.firstNameLastName, isFirstRender]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  const handleInnerKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.stopPropagation();
    }
  }, []);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`person-info ${isSelected ? "selected" : ""}`}
    >
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="visually-hidden"
      >
        {announcement}
      </span>

      <div className="avatar" aria-hidden="true">
        {getInitials(data.firstNameLastName)}
      </div>
      <div className="person-details">
        <span
          className="firstNameLastName"
          tabIndex={0}
          aria-label={`Name: ${data.firstNameLastName}`}
          title={data.firstNameLastName}
          onKeyDown={handleInnerKeyDown}
        >
          {data.firstNameLastName}
        </span>
        <span
          className="jobTitle"
          tabIndex={0}
          aria-label={`Job title: ${data.jobTitle}`}
          title={data.jobTitle}
          onKeyDown={handleInnerKeyDown}
        >
          {data.jobTitle}
        </span>
        <a
          href={`mailto:${data.emailAddress}`}
          className="emailAddress"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleInnerKeyDown}
          title={data.emailAddress}
          aria-label={`Email: ${data.emailAddress}`}
        >
          {data.emailAddress}
        </a>
      </div>
      <span className="visually-hidden">
        Press Enter or Space to {isSelected ? "deselect" : "select"}.
      </span>
    </div>
  );
});

export default PersonInfo;
