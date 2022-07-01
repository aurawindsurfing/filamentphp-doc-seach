import { ActionPanel, List, showToast, Action, Toast } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import algoliaSearch from "algoliasearch";
import _ from "lodash";

const APPID = "LMIKXMDI4P";
const APIKEY = "1e3d12b0b9c3a4db16cd896e83b9efa0";
const INDEX = "filamentadmin";

type result = {
  url: string;
  anchor: string;
  body: string;
  objectID: string;
  _highlightResult: {
    content:
      | {
          value: string;
          matchlevel: string;
          fullyHighlighted: boolean;
          matchedWords: string[];
        }
      | undefined;
    hierarchy: {
      [key: string]: {
        value: string;
        matchLevel: string;
        matchedWords: string[];
      };
    };
  };
};

const convertTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const hDisplay = h > 0 ? `${h}h ` : "";
  const mDisplay = m > 0 ? `${m}m` : "";
  return hDisplay + mDisplay;
};

export default function SearchFilamentphpDocumentation() {
  const algoliaClient = useMemo(() => {
    return algoliaSearch(APPID, APIKEY);
  }, [APPID, APIKEY]);

  const algoliaIndex = useMemo(() => {
    return algoliaClient.initIndex(INDEX);
  }, [algoliaClient, INDEX]);

  const [searchResults, setSearchResults] = useState<any[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const search = async (query = "") => {
    setIsLoading(true);

    return await algoliaIndex
      .search(query, {
        hitsPerPage: 15,
      })
      .then((res) => {
        return Object.entries(_.groupBy(res.hits, "anchor")) || [];
      })
      .catch((err) => {
        showToast(Toast.Style.Failure, "Error searching filamentphp docs", err.message);
        return [];
      });
  };

  useEffect(() => {
    (async () => {
      setSearchResults(await search());
      setIsLoading(false);
    })();
  }, []);
  return (
    <List
      throttle={true}
      isLoading={isLoading}
      searchBarPlaceholder={"Search Filamentphp"}
      onSearchTextChange={async (query) => {
        setSearchResults(await search(query));
        setIsLoading(false);
      }}
    >
      {searchResults?.map(([hitType, hitTypeResults]) => (

        <List.Section title={hitType.toUpperCase()} key={hitType}>
          {hitTypeResults?.map((hit: result) => (
            <List.Item
              id={hit.objectID}
              key={hit.objectID}
              title={hit.anchor}
              actions={
                <ActionPanel title={(hit.url)}>
                  <Action.OpenInBrowser url={(hit.url)} />
                  <Action.CopyToClipboard content={(hit.url)} title="Copy URL" />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>

      ))}

    </List>
  );
}
