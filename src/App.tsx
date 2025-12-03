import React, { useState, useCallback, useMemo, useEffect } from "react";
import apiData from "./api";
import PersonInfo from "./PersonInfo";
import "./App.css";

type Contact = {
  id: string;
  firstNameLastName: string;
  jobTitle: string;
  emailAddress: string;
};

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newContacts = await apiData();
      setContacts((prev) => [...prev, ...newContacts]);
      if (newContacts.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [id, ...prev];
      }
    });
  }, []);

  const sortedContacts = useMemo(() => {
    const contactsMap = new Map(contacts.map((c) => [c.id, c]));

    const selected = selectedIds
      .map((id) => contactsMap.get(id))
      .filter((c): c is Contact => c !== undefined);

    const unselected = contacts.filter((c) => !selectedIdsSet.has(c.id));

    return [...selected, ...unselected];
  }, [contacts, selectedIds, selectedIdsSet]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="App">
      <a href="#contact-list" className="skip-link">
        Skip to contact list
      </a>
      <header className="app-header">
        <h1 className="app-title">Contact List</h1>
        <p
          className="selected-count"
          aria-live="polite"
          aria-atomic="true"
        >
          Selected contacts: {selectedIds.length}
        </p>
      </header>

      <main className="list-container">
        <div
          id="contact-list"
          className="list"
          role="listbox"
          aria-label={`Contact list, ${sortedContacts.length} contacts`}
          aria-multiselectable="true"
        >
          {sortedContacts.map((contact) => (
            <PersonInfo
              key={contact.id}
              data={contact}
              isSelected={selectedIdsSet.has(contact.id)}
              onToggle={() => handleToggleSelect(contact.id)}
            />
          ))}
        </div>

        {isLoading && (
          <div
            className="loader"
            role="status"
            aria-label="Loading contacts"
          >
            <div className="spinner" aria-hidden="true" />
            <span className="visually-hidden">Loading more contacts...</span>
          </div>
        )}

        {error && (
          <div
            className="error-container"
            role="alert"
            aria-live="assertive"
          >
            <p className="error-message">{error}</p>
            <button
              onClick={fetchContacts}
              className="retry-button"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && hasMore && contacts.length > 0 && (
          <button
            onClick={fetchContacts}
            className="load-more-button"
            type="button"
            aria-label={`Load more contacts. Currently showing ${contacts.length} contacts.`}
          >
            Load More
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
