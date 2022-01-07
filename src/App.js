import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

import { SearchInput } from "./components/Input";
import { useDebounce } from "./common/utility";

import api, { wordsApi } from "./common/api";
import ImageBlock from "./components/ImageBlock";
import { findIndex, get, sortBy } from "lodash";

function App() {
  const [_searchTerm, _setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [suggestion, setSuggestion] = useState("");

  // When a user presses enter instead of waiting for debounce to start search
  const handleSubmit = (e) => {
    e.preventDefault();
    _setSearchTerm(e.target[1].value);
  };

  const requestToken = axios.CancelToken.source();

  const wordProcessor = useMemo(() => {
    if (!_searchTerm) return null;
    if (_searchTerm.toLowerCase().includes(" says ")) {
      const searchTerm = _searchTerm.split(" ");
      const saysIndex = findIndex(
        searchTerm,
        (o) => o.toLowerCase() === "says"
      );

      // if it is just an empty string.. do nothing
      if (!searchTerm[saysIndex + 1]) return null;
      const joinPrefixes = searchTerm.slice(0, saysIndex).join(" ");
      const joinSuffixes = searchTerm
        .slice(saysIndex + 1, searchTerm.length)
        .join(" ");

      return [joinPrefixes, joinSuffixes];
    }
  }, [_searchTerm]);

  // handle search deviation from suggestion
  useEffect(() => {
    if (!suggestion) return;
    if (wordProcessor) {
      // check if suffix search term matches suggestion text
      if (
        suggestion.substring(0, wordProcessor[1].length) !== wordProcessor[1]
      ) {
        setSuggestion("");
      }
    } else {
      // check if regular search term matches suggestion text
      if (suggestion.substring(0, _searchTerm.length) !== _searchTerm) {
        setSuggestion("");
      }
    }
  }, [wordProcessor, suggestion, _searchTerm]);

  const finalSuggestion = useMemo(() => {
    if (wordProcessor) {
      return [wordProcessor[0], "says", suggestion].join(" ");
    }
    return suggestion;
  }, [suggestion, wordProcessor]);

  // handle searches here onwards
  useDebounce(
    () => {
      if (!_searchTerm) {
        // Where there isn't any search term, reset results and word suggestion
        setResults(null);
        setSuggestion("");
        return;
      }

      const searchSuggestionWord = wordProcessor
        ? wordProcessor[1]
        : _searchTerm;
      // format search term for cats api
      const encodedSearch = encodeURI(_searchTerm);

      setIsLoading(true);
      setError(null);
      setResults(null);
      setSuggestion("");

      // Search for suggestion based on current search term
      if (searchSuggestionWord.length > 2) {
        wordsApi
          .get("/words", {
            params: {
              sp: `${searchSuggestionWord}*`,
            },
            cancelToken: requestToken.token,
          })
          .then(({ data }) => {
            if (data.length) {
              const sorted = sortBy(data, (o) => !o.score);
              setSuggestion(sorted[0].word);
            }
          })
          .catch((error) => {
            // Don't need to do anything here..
            console.log("Error looking for suggestions", error);
          });
      }

      // Search for cats based on current search term
      const apiUrl = wordProcessor
        ? `/cat/${wordProcessor[0]}/says/${wordProcessor[1]}`
        : `/cat/${encodedSearch}`;

      api
        .get(apiUrl, {
          cancelToken: requestToken.token,
          // This is required to ensure we can display the image
          responseType: "arraybuffer",
        })
        .then(({ data, headers }) => {
          // Convert data into an img that can be displayed
          const blob = new Blob([data], { type: headers["content-type"] });
          const image = URL.createObjectURL(blob);
          setResults(image);
        })
        .catch((error) => {
          if (get(error, "response.status") === 404) {
            setResults(null);
          } else {
            console.log("Either this was cancelled, or an error occured.", error);
            setError(error.message);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [_searchTerm],
    600,
    requestToken
  );

  // When a user decides to make use of the suggested term during search
  const handleKeydown = useCallback(
    (e) => {
      if (!finalSuggestion) return;
      if (e.key === "Tab") {
        if (_searchTerm.length < finalSuggestion.length) {
          e.preventDefault();
          _setSearchTerm(finalSuggestion);
        }
      }
    },
    [_searchTerm, finalSuggestion]
  );

  return (
    <div className="vw-100 d-flex" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="row my-4">
          <div className="col">
            <h1>Start searching for a cat</h1>
            <form onSubmit={handleSubmit}>
              <SearchInput
                className="form-control-lg"
                name="search"
                prediction={finalSuggestion}
                value={_searchTerm}
                onChange={(e) => _setSearchTerm(e.target.value)}
                isLoading={isLoading}
                onKeyDown={handleKeydown}
              />
            </form>
          </div>
        </div>
        <div className="row">
          <div className="col col-md-6 mx-md-auto">
            {!isLoading && error && <p className="text-danger">{error}</p>}
            {!isLoading && !results && _searchTerm && (
              <p className="text-center">Oops.. no cats were found :(</p>
            )}
            {results && _searchTerm && (
              <ImageBlock src={results} alt={_searchTerm} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
